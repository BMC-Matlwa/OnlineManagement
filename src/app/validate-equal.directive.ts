// validate-equal.directive.ts
import { Directive } from '@angular/core';
import { NG_VALIDATORS, Validator, AbstractControl, ValidationErrors } from '@angular/forms';

@Directive({
  selector: '[validateEqual]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: ValidateEqualDirective,
      multi: true
    }
  ]
})
export class ValidateEqualDirective implements Validator {
  validate(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.root.get('newPassword')?.value;
    const confirmPassword = control.value;

    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      return { 'validateEqual': true };
    }

    return null;
  }
}
