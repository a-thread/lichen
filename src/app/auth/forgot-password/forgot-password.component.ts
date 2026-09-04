import { Component, inject } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { ForgotPasswordStore } from "./forgot-password.store";
import { AuthBannerComponent } from "../shared/components/auth-banner/auth-banner.component";
import { FormFieldComponent } from "../shared/components/form-field/form-field.component";

@Component({
  selector: "app-forgot-password",
  imports: [
    ReactiveFormsModule,
    RouterLink,
    AuthBannerComponent,
    FormFieldComponent,
  ],
  providers: [ForgotPasswordStore],
  templateUrl: "./forgot-password.component.html",
  styleUrl: "../shared/auth.shared.scss",
})
export class ForgotPasswordComponent {
  protected readonly store = inject(ForgotPasswordStore);
}
