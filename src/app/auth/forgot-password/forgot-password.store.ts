import { computed, inject } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { NonNullableFormBuilder, Validators } from "@angular/forms";
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

export const ForgotPasswordStore = signalStore(
  withState({
    loading: false,
    errorMessage: "",
    sent: false,
  }),
  withProps(() => {
    const fb = inject(NonNullableFormBuilder);
    const form = fb.group({
      email: fb.control("", [Validators.required, Validators.email]),
    });

    return {
      form,
      formStatus: toSignal(form.statusChanges, { initialValue: form.status }),
      // Re-run `vm` on every keystroke, not just VALID/INVALID transitions —
      // see the same note in login.store.ts / create-account.store.ts.
      formValue: toSignal(form.valueChanges, {
        initialValue: form.getRawValue(),
      }),
    };
  }),
  withComputed(
    ({ form, formStatus, formValue, loading, errorMessage, sent }) => ({
      vm: computed(() => {
        formValue();
        return {
          loading: loading(),
          errorMessage: errorMessage(),
          sent: sent(),
          isEmailValid: !form.controls.email.errors,
          canSubmit: formStatus() === "VALID",
        };
      }),
    }),
  ),
  withMethods((store) => {
    const auth = inject(AuthStore);

    return {
      send: rxMethod<void>(
        pipe(
          filter(() => store.vm().canSubmit),
          tap(() => patchState(store, { loading: true, errorMessage: "" })),
          switchMap(() => {
            const { email } = store.form.getRawValue();

            return from(auth.sendPasswordReset(email)).pipe(
              tap(() => patchState(store, { sent: true })),
              catchError((err: any) => {
                patchState(store, {
                  errorMessage:
                    err?.message ??
                    "Unable to send reset email. Please try again.",
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
