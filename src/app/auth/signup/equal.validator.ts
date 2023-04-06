import { Directive, Attribute } from '@angular/core';
import { Validator, NG_VALIDATORS } from '@angular/forms';

@Directive({
  selector: '[compare-password]',
  providers: [
    { provide: NG_VALIDATORS, useExisting: CompareDirective, multi: true },
  ],
})
export class CompareDirective implements Validator {
  constructor(@Attribute('compare-password') public comparer: string) {}

  validate(confirmPassword: any): { [key: string]: any } {
    const password = confirmPassword.root.controls[this.comparer];
    if (
      password?.value &&
      confirmPassword.value &&
      confirmPassword.value !== password.value
    ) {
      return { compare: true };
    }

    if (password?.value && confirmPassword.value === password.value) {
      if (password.errors && password.errors['compare']) {
        delete password.errors['compare'];
        if (!Object.keys(password.errors).length) {
          password.setErrors(null);
        }
      }

      if (confirmPassword.errors && confirmPassword.errors['compare']) {
        delete confirmPassword.errors['compare'];
        if (!Object.keys(confirmPassword.errors).length) {
          confirmPassword.setErrors(null);
        }
      }
    }
  }
}
