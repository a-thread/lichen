import { Component, input } from "@angular/core";

@Component({
  selector: "app-auth-banner",
  templateUrl: "./auth-banner.component.html",
  styleUrl: "./auth-banner.component.scss",
})
export class AuthBannerComponent {
  message = input<string | null>(null);
  variant = input<"error" | "info">("error");
}
