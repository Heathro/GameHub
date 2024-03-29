import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ToastrService } from 'ngx-toastr';

import { CustomValidators } from 'src/app/helpers/customValidators';
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
        CustomValidators.alphaNumeric(),
        Validators.maxLength(24)
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(16),
        CustomValidators.atLeastOneDigit(),
        CustomValidators.atLeastOneLowercaseLetter(),
        CustomValidators.atLeastOneUppercaseLetter(),
        CustomValidators.atLeastOneSpecialCharacter()
      ]],
      confirmPassword: ['', [
        Validators.required,
        CustomValidators.matchValues('password')
      ]]
    });

    this.registerForm.controls['password'].valueChanges.subscribe({
      next: () => this.registerForm.controls['confirmPassword'].updateValueAndValidity()
    });
  }
}
