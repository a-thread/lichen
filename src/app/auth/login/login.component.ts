import { Component, inject } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { LoginStore } from "./login.store";
import { AuthBannerComponent } from "../shared/components/auth-banner/auth-banner.component";
import { FormFieldComponent } from "../shared/components/form-field/form-field.component";

@Component({
  selector: "app-login",
  imports: [
    ReactiveFormsModule,
    RouterLink,
    AuthBannerComponent,
    FormFieldComponent,
  ],
  providers: [LoginStore],
  templateUrl: "./login.component.html",
  styleUrl: "../shared/auth.shared.scss",
})
export class LoginComponent {
  protected readonly store = inject(LoginStore);
}
