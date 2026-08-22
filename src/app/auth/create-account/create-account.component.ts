import { Component, inject } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { CreateAccountStore } from "./create-account.store";

@Component({
  selector: "app-create-account",
  imports: [ReactiveFormsModule, RouterLink],
  providers: [CreateAccountStore],
  templateUrl: "./create-account.component.html",
  styleUrl: "../auth.shared.scss",
})
export class CreateAccountComponent {
  protected readonly store = inject(CreateAccountStore);
}
