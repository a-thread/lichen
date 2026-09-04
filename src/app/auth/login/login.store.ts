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

export const LoginStore = signalStore(
  withState({
    loading: false,
    errorMessage: "",
  }),
  withProps(() => {
    const fb = inject(NonNullableFormBuilder);
    const form = fb.group({
      email: fb.control("", [Validators.required, Validators.email]),
      password: fb.control("", [Validators.required, Validators.minLength(6)]),
    });

    return {
      form,
      formStatus: toSignal(form.statusChanges, { initialValue: form.status }),
      // Re-run `vm` on every keystroke, not just VALID/INVALID transitions —
      // the group's overall status string can stay "INVALID" (e.g. because
      // password is still too short) while email's own validity changes
      // underneath, and `form.controls.email.errors` below is a plain
      // property read, not a signal, so nothing else would trigger a
      // recompute.
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
        isEmailValid: !form.controls.email.errors,
        canSubmit: formStatus() === "VALID",
      };
    }),
  })),
  withMethods((store) => {
    const auth = inject(AuthStore);
    const router = inject(Router);

    return {
      signIn: rxMethod<void>(
        pipe(
          filter(() => store.vm().canSubmit),
          tap(() => patchState(store, { loading: true, errorMessage: "" })),
          switchMap(() => {
            const { email, password } = store.form.getRawValue();

            return from(auth.signIn(email, password)).pipe(
              tap(() => router.navigate(["/"])),
              catchError((err: any) => {
                patchState(store, {
                  errorMessage: err?.message ?? "Incorrect email or password",
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
