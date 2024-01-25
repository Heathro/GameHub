import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { ToastrService } from 'ngx-toastr';

import { CustomValidators } from 'src/app/helpers/customValidators';
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
}
