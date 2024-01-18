import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { ToastrService } from 'ngx-toastr';

import { CustomValidators } from 'src/app/forms/customValidators';
import { GamesService } from 'src/app/services/games.service';

@Component({
  selector: 'app-publication',
  templateUrl: './publication.component.html',
  styleUrls: ['./publication.component.css']
})
export class PublicationComponent implements OnInit {
  publishForm: FormGroup = new FormGroup({});
  validationErrors: string[] | undefined;
  publishing = false;

  constructor(
    private gamesService: GamesService, 
    private router: Router, 
    private toastr: ToastrService, 
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.initializeFrom();
  }

  publish() {
    this.publishing = true;
    this.gamesService.publishGame(this.publishForm.value).subscribe({
      next: () => {
        this.router.navigateByUrl('/games/' + this.publishForm.value.title);
        this.toastr.success('Publication successful');
        this.publishing = false;
      },
      error: error => {
        this.validationErrors = error;
        this.publishing = false;
      }
    });
  }

  initializeFrom() {
    this.publishForm = this.formBuilder.group({
      title: ['', [
        Validators.required,
        CustomValidators.whiteSpace(),
        CustomValidators.alphaNumericSpaceColon(),
        Validators.maxLength(32)
      ]],
      description: ['', [
        Validators.maxLength(800)
      ]],
      platforms: this.formBuilder.group({
        windows: false,
        macos: false,
        linux: false
      }),
      genres: this.formBuilder.group({
        action: false,
        adventure: false,
        card: false,
        educational: false,
        fighting: false,
        horror: false,
        platformer: false,
        puzzle: false,
        racing: false,
        rhythm: false,
        roleplay: false,
        shooter: false,
        simulation: false,
        sport: false,
        stealth: false,
        strategy: false,
        survival: false
      })
    },
    { validators: [
      CustomValidators.atLeastOneSelected('genres'),
      CustomValidators.atLeastOneSelected('platforms')]
    });
  }

  // alphaNumericSpaceColon(): ValidatorFn {
  //   return (control: AbstractControl) => {
  //     return control.value.match('^[A-Za-z0-9: ]+$') ? null : {notAlphaNumericSpaceColon: true};
  //   }
  // }

  // whiteSpace(): ValidatorFn {
  //   return (control: AbstractControl) => {
  //     const input: string = control.value;
  //     return input[0] === ' ' || input[input.length - 1] === ' ' ? {whiteSpace: true} : null;
  //   }
  // }

  // atLeastOneSelected(groupName: string): ValidatorFn {
  //   return (control: AbstractControl) => {
  //     const fg = control as FormGroup;
  
  //     if (fg && fg.controls && fg.controls[groupName]) {
  //       const groupControl = fg.controls[groupName] as FormGroup;
  //       const controls = Object.values(groupControl.controls);
  //       return controls.every(c => c.value === false) ? {atLeastOneSelected: true} : null;
  //     }  
  //     return null;
  //   };
  // }
}
