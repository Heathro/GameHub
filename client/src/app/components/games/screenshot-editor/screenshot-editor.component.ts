import { Component, Input, OnInit } from '@angular/core';

import { FileUploader } from 'ng2-file-upload';
import { take } from 'rxjs';

import { environment } from 'src/environments/environment';
import { AccountService } from 'src/app/services/account.service';
import { GamesService } from 'src/app/services/games.service';
import { User } from 'src/app/models/user';
import { Game } from 'src/app/models/game';

@Component({
  selector: 'app-screenshot-editor',
  templateUrl: './screenshot-editor.component.html',
  styleUrls: ['./screenshot-editor.component.css']
})
export class ScreenshotEditorComponent implements OnInit {
  @Input() game: Game | undefined;
  user: User | undefined;
  uploader: FileUploader | undefined;
  baseUrl = environment.apiUrl;

  constructor(private accountService: AccountService, private gamesService: GamesService) {
    this.accountService.currentUser$.pipe(take(1)).subscribe({
      next: user => { if (user) this.user = user; }
    })
  }

  ngOnInit(): void {
    this.initializeUploader();
  }

  initializeUploader() {
    this.uploader = new FileUploader({
      url: this.baseUrl + 'games/add-screenshot/' + this.game?.title,
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
        const screenshot = JSON.parse(response);
        this.game?.screenshots.push(screenshot);
      }
    }
  }

  deleteScreenshot(screenshotId: number) {
    if (!this.game) return;
    this.gamesService.deleteScreenshot(this.game, screenshotId).subscribe({
      next: () => {
        if (this.game) {
          this.game.screenshots = this.game.screenshots.filter(s => s.id !== screenshotId);
        }
      }
    });
  }
}
