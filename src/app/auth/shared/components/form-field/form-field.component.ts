import { Component, input } from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";

@Component({
  selector: "app-form-field",
  imports: [ReactiveFormsModule],
  templateUrl: "./form-field.component.html",
  styleUrl: "./form-field.component.scss",
})
export class FormFieldComponent {
  fieldId = input.required<string>();
  label = input.required<string>();
  control = input.required<FormControl<string>>();
  type = input("text");
  autocomplete = input("");
  invalid = input(false);
  errorMessage = input<string | null>(null);

  protected showInvalid(): boolean {
    return !!this.control().value && this.invalid();
  }
}
