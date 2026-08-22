import { Component, inject } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { ForgotPasswordStore } from "./forgot-password.store";

@Component({
  selector: "app-forgot-password",
  imports: [ReactiveFormsModule, RouterLink],
  providers: [ForgotPasswordStore],
  templateUrl: "./forgot-password.component.html",
  styleUrl: "../auth.shared.scss",
})
export class ForgotPasswordComponent {
  protected readonly store = inject(ForgotPasswordStore);
}
