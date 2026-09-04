import { computed, inject } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { NonNullableFormBuilder, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withProps,
  withState,
} from "@ngrx/signals";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import {
  EMPTY,
  catchError,
  filter,
  finalize,
  from,
  pipe,
  switchMap,
  tap,
} from "rxjs";
import { AuthStore } from "../../data-access/auth/auth.store";
import { passwordsMatchValidator } from "../shared/passwords-match-validator";

export const ResetPasswordStore = signalStore(
  withState({
    loading: false,
    errorMessage: "",
  }),
  withProps(() => {
    const fb = inject(NonNullableFormBuilder);
    const form = fb.group(
      {
        password: fb.control("", [
          Validators.required,
          Validators.minLength(6),
        ]),
        confirmPassword: fb.control("", [Validators.required]),
      },
      { validators: passwordsMatchValidator },
    );

    return {
      form,
      formStatus: toSignal(form.statusChanges, { initialValue: form.status }),
      // Re-run `vm` on every keystroke, not just VALID/INVALID transitions —
      // the overall status string can stay e.g. "INVALID" while which
      // field/error caused that changes underneath, and `form.errors`/
      // `control.errors` below are plain property reads, not signals, so
      // nothing else would trigger it.
      formValue: toSignal(form.valueChanges, {
        initialValue: form.getRawValue(),
      }),
    };
  }),
  withComputed(({ form, formStatus, formValue, loading, errorMessage }) => ({
    vm: computed(() => {
      formValue();
      return {
        loading: loading(),
        errorMessage: errorMessage(),
        isPasswordValid: !form.controls.password.errors,
        passwordsMatch: !form.errors?.["passwordMismatch"],
        canSubmit: formStatus() === "VALID",
      };
    }),
  })),
  withMethods((store) => {
    const auth = inject(AuthStore);
    const router = inject(Router);

    return {
      submit: rxMethod<void>(
        pipe(
          filter(() => store.vm().canSubmit),
          tap(() => patchState(store, { loading: true, errorMessage: "" })),
          switchMap(() => {
            const { password } = store.form.getRawValue();

            return from(auth.updatePassword(password)).pipe(
              tap(() => router.navigate(["/"])),
              catchError((err: any) => {
                patchState(store, {
                  errorMessage:
                    err?.message ??
                    "Unable to update password. Please try again.",
                });
                return EMPTY;
              }),
              finalize(() => patchState(store, { loading: false })),
            );
          }),
        ),
      ),
    };
  }),
);
