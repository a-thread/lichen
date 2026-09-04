import { Component, inject } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { ResetPasswordStore } from "./reset-password.store";
import { AuthBannerComponent } from "../shared/components/auth-banner/auth-banner.component";
import { FormFieldComponent } from "../shared/components/form-field/form-field.component";

@Component({
  selector: "app-reset-password",
  imports: [ReactiveFormsModule, AuthBannerComponent, FormFieldComponent],
  providers: [ResetPasswordStore],
  templateUrl: "./reset-password.component.html",
  styleUrl: "../shared/auth.shared.scss",
})
export class ResetPasswordComponent {
  protected readonly store = inject(ResetPasswordStore);
}
