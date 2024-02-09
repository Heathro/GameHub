import { AbstractControl, FormGroup, ValidatorFn } from "@angular/forms";

export class CustomValidators {
  static alphaNumeric(): ValidatorFn {
    return (control: AbstractControl) => {
      return control.value.match('^[A-Za-z0-9]+$') ? null : {notAlphaNumeric: true};
    }
  }

  static atLeastOneDigit(): ValidatorFn {
    return (control: AbstractControl) => {
      return /[0-9]/.test(control.value) ? null : {oneDigit: true};
    }
  }

  static atLeastOneUppercaseLetter(): ValidatorFn {
    return (control: AbstractControl) => {
      return /[A-Z]/.test(control.value) ? null : {oneUpperCase: true};
    }
  }

  static atLeastOneLowercaseLetter(): ValidatorFn {
    return (control: AbstractControl) => {
      return /[a-z]/.test(control.value) ? null : {oneLowerCase: true};
    }
  }

  static atLeastOneSpecialCharacter(): ValidatorFn {
    return (control: AbstractControl) => {
      return /[!@#$%^&*(),.?":{}|<>]/.test(control.value) ? null : {oneSpecialCharacter: true};
    }
  } 

  static alphaNumericSpaceColon(): ValidatorFn {
    return (control: AbstractControl) => {
      return control.value.match('^[A-Za-z0-9: ]+$') ? null : {notAlphaNumericSpaceColon: true};
    }
  }

  static matchValues(matchTo: string): ValidatorFn {
    return (control: AbstractControl) => {
      return control.value === control.parent?.get(matchTo)?.value ? null : {notMatching: true};
    }
  }

  static whiteSpace(): ValidatorFn {
    return (control: AbstractControl) => {
      const input: string = control.value;
      return input[0] === ' ' || input[input.length - 1] === ' ' ? {whiteSpace: true} : null;
    }
  }

  static onlyWhiteSpace(): ValidatorFn {
    return (control: AbstractControl) => {
      return /^[ \t\n]*$/.test(control.value as string) ? {onlyWhiteSpace: true} : null;
    }
  }

  static atLeastOneSelected(groupName: string): ValidatorFn {
    return (control: AbstractControl) => {
      const fg = control as FormGroup;

      if (fg && fg.controls && fg.controls[groupName]) {
        const groupControl = fg.controls[groupName] as FormGroup;
        const controls = Object.values(groupControl.controls);
        return controls.every(c => c.value === false) ? {atLeastOneSelected: true} : null;
      }  
      return null;
    };
  }

  static youtubeId(): ValidatorFn {
    return (control: AbstractControl) => {
      const input: string = control.value;
      return input.length === 0 || (input.length === 11 && input.match('^[A-Za-z0-9-_]+$'))
        ? null : {youtubeId: true};
    }
  }
}