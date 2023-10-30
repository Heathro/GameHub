import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { ToastrService } from 'ngx-toastr';

import { AccountService } from 'src/app/services/account.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup = new FormGroup({});
  validationErrors: string[] | undefined;

  constructor(
    private accountService: AccountService, 
    private router: Router, 
    private toastr: ToastrService, 
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.initializeFrom();
  }
  
  initializeFrom() {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  login() {
    this.accountService.login(this.loginForm.value).subscribe({
      next: () => {
        this.router.navigateByUrl('/');
        this.toastr.success('Login successful')
      },
      error: error => {
        this.validationErrors = error;
      }
    });
  }  
}
