import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';

import { FileUploader } from 'ng2-file-upload';
import { ToastrService } from 'ngx-toastr';
import { take } from 'rxjs';

import { environment } from 'src/environments/environment';
import { GamesService } from 'src/app/services/games.service';
import { AccountService } from 'src/app/services/account.service';
import { EditComponent } from 'src/app/interfaces/edit-component';
import { Game } from 'src/app/models/game';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-game-edit',
  templateUrl: './game-edit.component.html',
  styleUrls: ['./game-edit.component.css']
})
export class GameEditComponent implements OnInit, EditComponent {
  @HostListener('window:beforeunload', ['$event']) unloadNotification($event: any) {
    if (this.editForm?.dirty) { $event.returnValue = true; }
  }
  editForm: FormGroup = new FormGroup({});
  validationErrors: string[] | undefined;
  user: User | null = null;
  game: Game | undefined;
  currentTitle = "";
  uploader: FileUploader | undefined;
  baseUrl = environment.apiUrl;

  constructor(
    private accountService: AccountService,
    private gamesService: GamesService, 
    private toastr: ToastrService, 
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private location: Location
  ) {
    this.accountService.currentUser$.pipe(take(1)).subscribe({
      next: user => this.user = user
    });
  }

  ngOnInit(): void {
    this.loadGame();
  }

  isDirty(): boolean {
    return this.editForm.dirty;
  }

  loadGame() {
    const title = this.route.snapshot.paramMap.get('title');
    if (!title) return;
    this.gamesService.getGame(title).subscribe({
      next: game => {
        if (!game) this.router.navigateByUrl('/not-found');
        this.game = game;
        this.currentTitle = game.title;
        this.initializeUploader();
        this.initializeFrom();
      }
    });
  }

  updateGame() {
    this.gamesService.updateGame(this.editForm.value, this.currentTitle).subscribe({
      next: () => {
        this.currentTitle = this.editForm?.controls['title'].value;
        this.location.replaceState('/games/' + this.currentTitle + '/edit');
        this.toastr.success('Game updated');
        this.resetForm();
      },
      error: error => {
        this.validationErrors = error;
        this.resetForm();
      }
    });
  }

  resetForm() {
    this.editForm?.reset(this.editForm.value);
  }
  
  initializeFrom() {
    this.editForm = this.formBuilder.group({
      id: this.game?.id,
      title: [this.game?.title, [
        Validators.required,
        this.whiteSpace(),
        this.alphaNumericSpaceColon(),
        Validators.maxLength(32)
      ]],
      description: this.game?.description,
      platforms: this.formBuilder.group({
        windows: this.game?.platforms.windows,
        macos: this.game?.platforms.macos,
        linux: this.game?.platforms.linux
      }),
      genres: this.formBuilder.group({
        action: this.game?.genres.action,
        adventure: this.game?.genres.adventure,
        card: this.game?.genres.card,
        educational: this.game?.genres.educational,
        fighting: this.game?.genres.fighting,
        horror: this.game?.genres.horror,
        platformer: this.game?.genres.platformer,
        puzzle: this.game?.genres.puzzle,
        racing: this.game?.genres.racing,
        rhythm: this.game?.genres.rhythm,
        roleplay: this.game?.genres.roleplay,
        shooter: this.game?.genres.shooter,
        simulation: this.game?.genres.simulation,
        sport: this.game?.genres.sport,
        stealth: this.game?.genres.stealth,
        strategy: this.game?.genres.strategy,
        survival: this.game?.genres.survival
      })
    });
  }

  alphaNumericSpaceColon(): ValidatorFn {
    return (control: AbstractControl) => {
      return control.value.match('^[A-Za-z0-9: ]+$') ? null : {notAlphaNumericSpaceColon: true};
    }
  }

  whiteSpace(): ValidatorFn {
    return (control: AbstractControl) => {
      const input: string = control.value;
      return input[0] === ' ' || input[input.length - 1] === ' ' ? {whiteSpace: true} : null;
    }
  }

  initializeUploader() {
    this.uploader = new FileUploader({
      method: 'PUT',
      url: this.baseUrl + 'games/' + this.game?.title + '/update-poster',
      authToken: 'Bearer ' + this.user?.token,
      isHTML5: true,
      allowedFileType: ['image'],
      removeAfterUpload: true,
      autoUpload: false,
      maxFileSize: 10 * 1024 * 1024
    });

    this.uploader.onAfterAddingFile = (file) => {
      file.withCredentials = false;
    }

    this.uploader.onSuccessItem = (item, response, status, header) => {
      if (response) {
        const poster = JSON.parse(response);
        if (this.game) this.game.poster = poster;
      }
    }

    this.uploader.onAfterAddingFile = f => {
      if (this.uploader && this.uploader?.queue.length > 1) {
        this.uploader.removeFromQueue(this.uploader.queue[0]);
      }
    };
  }
}