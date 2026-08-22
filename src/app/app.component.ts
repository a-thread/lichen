import { Component, effect, inject } from "@angular/core";
import { Router, RouterOutlet } from "@angular/router";
import { NotesStore } from "./data-access/notes/notes.store";
import { AuthStore } from "./data-access/auth/auth.store";
import { ThemeStore } from "./theme.store";
import { ToastComponent } from "./shared/components/toast/toast.component";
import { IconComponent } from "./shared/components/icon/icon.component";

@Component({
  selector: "app-root",
  imports: [RouterOutlet, ToastComponent, IconComponent],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
})
export class AppComponent {
  readonly notesStore = inject(NotesStore);
  readonly auth = inject(AuthStore);
  readonly theme = inject(ThemeStore);
  private readonly router = inject(Router);

  constructor() {
    effect(() => {
      if (this.auth.passwordRecoveryPending()) {
        this.router.navigate(["/reset-password"]);
      }
    });
  }

  async signOut(): Promise<void> {
    await this.auth.signOut();
    this.router.navigate(["/login"]);
  }
}
