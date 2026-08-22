import { AbstractControl, ValidationErrors } from "@angular/forms";

/** Group-level validator for a password + confirmPassword pair. */
export function passwordsMatchValidator(
  group: AbstractControl,
): ValidationErrors | null {
  const password = group.get("password")?.value;
  const confirmPassword = group.get("confirmPassword")?.value;
  return password === confirmPassword ? null : { passwordMismatch: true };
}
