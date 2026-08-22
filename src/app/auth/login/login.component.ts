import { Component, inject } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { LoginStore } from "./login.store";

@Component({
  selector: "app-login",
  imports: [ReactiveFormsModule, RouterLink],
  providers: [LoginStore],
  templateUrl: "./login.component.html",
  styleUrl: "../auth.shared.scss",
})
export class LoginComponent {
  protected readonly store = inject(LoginStore);
}
