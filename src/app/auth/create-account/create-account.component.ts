import { Component, inject } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { CreateAccountStore } from "./create-account.store";
import { AuthBannerComponent } from "../shared/components/auth-banner/auth-banner.component";
import { FormFieldComponent } from "../shared/components/form-field/form-field.component";

@Component({
  selector: "app-create-account",
  imports: [
    ReactiveFormsModule,
    RouterLink,
    AuthBannerComponent,
    FormFieldComponent,
  ],
  providers: [CreateAccountStore],
  templateUrl: "./create-account.component.html",
  styleUrl: "../shared/auth.shared.scss",
})
export class CreateAccountComponent {
  protected readonly store = inject(CreateAccountStore);
}
