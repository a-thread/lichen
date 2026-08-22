import { inject } from "@angular/core";
import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { AuthService } from "./auth.service";

type OperationState = { loading: boolean; error: string | null };

type AuthApiState = {
  signIn: OperationState;
  signUp: OperationState;
  sendPasswordReset: OperationState;
  updatePassword: OperationState;
  signOut: OperationState;
};

const idle: OperationState = { loading: false, error: null };

const initialState: AuthApiState = {
  signIn: idle,
  signUp: idle,
  sendPasswordReset: idle,
  updatePassword: idle,
  signOut: idle,
};

export const AuthApiStore = signalStore(
  { providedIn: "root" },
  withState(initialState),
  withMethods((store) => {
    const auth = inject(AuthService);

    return {
      async signIn(email: string, password: string): Promise<void> {
        patchState(store, { signIn: { loading: true, error: null } });
        try {
          await auth.signIn(email, password);
          patchState(store, { signIn: { loading: false, error: null } });
        } catch (err: any) {
          patchState(store, {
            signIn: { loading: false, error: err?.message ?? "Sign in failed" },
          });
          throw err;
        }
      },

      async signUp(email: string, password: string): Promise<void> {
        patchState(store, { signUp: { loading: true, error: null } });
        try {
          await auth.signUp(email, password);
          patchState(store, { signUp: { loading: false, error: null } });
        } catch (err: any) {
          patchState(store, {
            signUp: { loading: false, error: err?.message ?? "Sign up failed" },
          });
          throw err;
        }
      },

      async sendPasswordReset(email: string): Promise<void> {
        patchState(store, {
          sendPasswordReset: { loading: true, error: null },
        });
        try {
          await auth.sendPasswordReset(email);
          patchState(store, {
            sendPasswordReset: { loading: false, error: null },
          });
        } catch (err: any) {
          patchState(store, {
            sendPasswordReset: {
              loading: false,
              error: err?.message ?? "Failed to send reset email",
            },
          });
          throw err;
        }
      },

      async updatePassword(password: string): Promise<void> {
        patchState(store, { updatePassword: { loading: true, error: null } });
        try {
          await auth.updatePassword(password);
          patchState(store, {
            updatePassword: { loading: false, error: null },
          });
        } catch (err: any) {
          patchState(store, {
            updatePassword: {
              loading: false,
              error: err?.message ?? "Failed to update password",
            },
          });
          throw err;
        }
      },

      async signOut(): Promise<void> {
        patchState(store, { signOut: { loading: true, error: null } });
        try {
          await auth.signOut();
          patchState(store, { signOut: { loading: false, error: null } });
        } catch (err: any) {
          patchState(store, {
            signOut: {
              loading: false,
              error: err?.message ?? "Sign out failed",
            },
          });
          throw err;
        }
      },
    };
  }),
);
