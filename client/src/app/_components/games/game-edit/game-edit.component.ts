import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';

import { FileUploader } from 'ng2-file-upload';
import { ToastrService } from 'ngx-toastr';
import { take } from 'rxjs';

import { environment } from 'src/environments/environment';
import { GamesService } from 'src/app/_services/games.service';
import { AccountService } from 'src/app/_services/account.service';
import { Game } from 'src/app/_models/game';
import { User } from 'src/app/_models/user';

@Component({
  selector: 'app-game-edit',
  templateUrl: './game-edit.component.html',
  styleUrls: ['./game-edit.component.css']
})
export class GameEditComponent implements OnInit {
  @HostListener('window:beforeunload', ['$event']) unloadNotification($event: any) {
    if (this.editForm?.dirty) { $event.returnValue = true; }
  }
  @ViewChild('editForm') editForm: NgForm | undefined;  
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
    private router: Router
  ) {
    this.accountService.currentUser$.pipe(take(1)).subscribe({
      next: user => this.user = user
    });
  }

  ngOnInit(): void {
    this.loadGame();
  }

  loadGame() {
    const title = this.route.snapshot.paramMap.get('title');
    if (!title) return;
    this.gamesService.getGame(title).subscribe({
      next: game => {
        this.game = game;
        this.currentTitle = game.title;
        this.initializeUploader();
      }
    });
  }

  updateGame() {
    const newTitle: string = this.editForm?.controls['title'].getRawValue();

    if (newTitle.length === 0) {
      this.toastr.warning('Title required');
    }
    else if (newTitle[0] === ' ' || newTitle[newTitle.length-1] === ' ') {
      this.toastr.warning('Title must not start or end with space');
    }
    else if (!this.titleValidator(newTitle)) {
      this.toastr.warning('Title must contain only letters, numbers and spaces');
    }
    else if (newTitle.length > 36) {
      this.toastr.warning('Title must be at most 36 characters');
    }
    else {
      this.gamesService.updateGame(this.editForm?.value, this.currentTitle).subscribe({
        next: () => {
          this.currentTitle = newTitle;
          this.editForm?.reset(this.game);
          this.router.navigateByUrl('/games/' + this.currentTitle + '/edit');
          this.toastr.success('Game updated');
        },
        error: error => {
          this.validationErrors = error;
        }
      });
    }
  }

  titleValidator(input: string): boolean {
    if (input.length === 0) return false;
    var regexp = new RegExp('^[A-Za-z0-9 ]+$');
    var result = regexp.test(input);
    return result;
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
