import { Component, inject } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { ResetPasswordStore } from "./reset-password.store";

@Component({
  selector: "app-reset-password",
  imports: [ReactiveFormsModule],
  providers: [ResetPasswordStore],
  templateUrl: "./reset-password.component.html",
  styleUrl: "../shared/auth.shared.scss",
})
export class ResetPasswordComponent {
  protected readonly store = inject(ResetPasswordStore);
}
