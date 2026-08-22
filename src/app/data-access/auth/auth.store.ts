import { inject } from "@angular/core";
import { patchState, signalStore, withHooks, withMethods, withState } from "@ngrx/signals";
import { AuthService } from "./auth.service";
import { AuthApiStore } from "./auth-api.store";

type AuthState = {
  userId: string | null;
  isInitializing: boolean;
  /** Set true when Supabase redirects back with a password-recovery link. */
  passwordRecoveryPending: boolean;
};

const initialState: AuthState = {
  userId: null,
  isInitializing: true,
  passwordRecoveryPending: false,
};

export const AuthStore = signalStore(
  { providedIn: "root" },
  withState(initialState),
  withMethods((store) => {
    const authApi = inject(AuthApiStore);

    return {
      async signIn(email: string, password: string): Promise<void> {
        await authApi.signIn(email, password);
      },

      async signUp(email: string, password: string): Promise<void> {
        await authApi.signUp(email, password);
      },

      async sendPasswordReset(email: string): Promise<void> {
        await authApi.sendPasswordReset(email);
      },

      async updatePassword(password: string): Promise<void> {
        await authApi.updatePassword(password);
        patchState(store, { passwordRecoveryPending: false });
      },

      async signOut(): Promise<void> {
        await authApi.signOut();
      },
    };
  }),
  withHooks({
    onInit(store) {
      const auth = inject(AuthService);

      auth.getSession().then(({ data }) => {
        patchState(store, {
          userId: data.session?.user?.id ?? null,
          isInitializing: false,
        });
      });

      auth.onAuthStateChange((event, session) => {
        if (event === "PASSWORD_RECOVERY") {
          patchState(store, { passwordRecoveryPending: true });
        }
        patchState(store, { userId: session?.user?.id ?? null });
      });
    },
  }),
);
