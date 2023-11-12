import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';

import { ToastrService } from 'ngx-toastr';

import { AccountService } from 'src/app/services/account.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup = new FormGroup({});
  validationErrors: string[] | undefined;
  registering = false;

  constructor(
    private accountService: AccountService, 
    private router: Router, 
    private toastr: ToastrService, 
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.initializeFrom();
  }

  register() {
    this.registering = true;
    this.accountService.register(this.registerForm.value).subscribe({
      next: () => {
        this.router.navigateByUrl('/');
        this.toastr.success('Register successful');
        this.registering = false;
      },
      error: error => {
        this.validationErrors = error;
        this.registering = false;
      }
    });
  }

  initializeFrom() {
    this.registerForm = this.formBuilder.group({
      username: ['', [
        Validators.required,
        this.alphaNumeric(),
        Validators.maxLength(24)
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(16)
      ]],
      confirmPassword: ['', [
        Validators.required,
        this.matchValues('password')
      ]]
    });

    this.registerForm.controls['password'].valueChanges.subscribe({
      next: () => this.registerForm.controls['confirmPassword'].updateValueAndValidity()
    });
  }

  alphaNumeric(): ValidatorFn {
    return (control: AbstractControl) => {
      return control.value.match('^[A-Za-z0-9]+$') ? null : {notAlphaNumeric: true};
    }
  }

  matchValues(matchTo: string): ValidatorFn {
    return (control: AbstractControl) => {
      return control.value === control.parent?.get(matchTo)?.value ? null : {notMatching: true};
    }
  }
}
