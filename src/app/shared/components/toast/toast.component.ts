import { Component, inject } from "@angular/core";
import { ToastStore } from "../../state/toast.store";

@Component({
  selector: "app-toast",
  templateUrl: "./toast.component.html",
  styleUrl: "./toast.component.scss",
})
export class ToastComponent {
  readonly toast = inject(ToastStore);
}
