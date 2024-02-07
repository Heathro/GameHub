import { Component, Input } from '@angular/core';

import { FileUploader } from 'ng2-file-upload';
import { take } from 'rxjs';

import { environment } from 'src/environments/environment';
import { AccountService } from 'src/app/services/account.service';
import { GamesService } from 'src/app/services/games.service';
import { Game } from 'src/app/models/game';
import { User } from 'src/app/models/user';
import { Platform } from 'src/app/enums/platform';

@Component({
  selector: 'app-file-editor',
  templateUrl: './file-editor.component.html',
  styleUrls: ['./file-editor.component.css']
})
export class FileEditorComponent {
  @Input() game: Game | undefined;
  user: User | undefined;
  uploaderWindows: FileUploader | undefined;  
  uploaderMacOS: FileUploader | undefined;  
  uploaderLinux: FileUploader | undefined;
  baseUrl = environment.apiUrl;

  constructor(private accountService: AccountService, private gamesService: GamesService) {
    this.accountService.currentUser$.pipe(take(1)).subscribe({
      next: user => { if (user) this.user = user; }
    })
  }

  ngOnInit(): void {
    this.initializeWindowsUploader();
    this.initializeMacOSUploader();
    this.initializeLinuxUploader();
  }

  initializeWindowsUploader() {
    this.uploaderWindows = new FileUploader({
      method: 'Post',
      url: this.baseUrl + 'files/upload/' + this.game?.title + '/' + Platform.windows,
      authToken: 'Bearer ' + this.user?.token,
      isHTML5: true,
      allowedFileType: ['compress'],
      removeAfterUpload: true,
      autoUpload: false,
      maxFileSize: 256 * 1024 * 1024
    });

    this.uploaderWindows.onAfterAddingFile = (file) => {
      file.withCredentials = false;
    }

    this.uploaderWindows.onSuccessItem = (item, response, status, header) => {
      if (this.game) {
        this.game.files.windowsName = item._file.name;
        this.game.files.windowsSize = item._file.size;
      }
    }
    
    this.uploaderWindows.onAfterAddingFile = f => {
      if (this.uploaderWindows && this.uploaderWindows?.queue.length > 1) {
        this.uploaderWindows.removeFromQueue(this.uploaderWindows.queue[0]);
      }
    };
  }

  initializeMacOSUploader() {
    this.uploaderMacOS = new FileUploader({
      method: 'Post',
      url: this.baseUrl + 'files/upload/' + this.game?.title + '/' + Platform.macOS,
      authToken: 'Bearer ' + this.user?.token,
      isHTML5: true,
      allowedFileType: ['compress'],
      removeAfterUpload: true,
      autoUpload: false,
      maxFileSize: 256 * 1024 * 1024
    });

    this.uploaderMacOS.onAfterAddingFile = (file) => {
      file.withCredentials = false;
    }

    this.uploaderMacOS.onSuccessItem = (item, response, status, header) => {
      if (this.game) {
        this.game.files.macosName = item._file.name;
        this.game.files.macosSize = item._file.size;
      }
    }
    
    this.uploaderMacOS.onAfterAddingFile = f => {
      if (this.uploaderMacOS && this.uploaderMacOS?.queue.length > 1) {
        this.uploaderMacOS.removeFromQueue(this.uploaderMacOS.queue[0]);
      }
    };
  }

  initializeLinuxUploader() {
    this.uploaderLinux = new FileUploader({
      method: 'Post',
      url: this.baseUrl + 'files/upload/' + this.game?.title + '/' + Platform.linux,
      authToken: 'Bearer ' + this.user?.token,
      isHTML5: true,
      allowedFileType: ['compress'],
      removeAfterUpload: true,
      autoUpload: false,
      maxFileSize: 256 * 1024 * 1024
    });

    this.uploaderLinux.onAfterAddingFile = (file) => {
      file.withCredentials = false;
    }

    this.uploaderLinux.onSuccessItem = (item, response, status, header) => {
      if (this.game) {
        this.game.files.linuxName = item._file.name;
        this.game.files.linuxSize = item._file.size;
      }
    }
    
    this.uploaderLinux.onAfterAddingFile = f => {
      if (this.uploaderLinux && this.uploaderLinux?.queue.length > 1) {
        this.uploaderLinux.removeFromQueue(this.uploaderLinux.queue[0]);
      }
    };
  }

  deleteFile(platform: Platform) {
    if (this.game) {
      this.gamesService.deleteFile(this.game.title, platform).subscribe({
        next: () => {
          if (this.game) {
            switch (platform) {
              case Platform.windows:
                this.game.files.windowsName = '';
                this.game.files.windowsSize = 0;
                break;
              case Platform.macOS:
                this.game.files.macosName = '';
                this.game.files.macosSize = 0;
                break;
              case Platform.linux:
                this.game.files.linuxName = '';
                this.game.files.linuxSize = 0;
                break;
            }
          }
        }
      });
    }
  }

  formatFileSize(bytes: number) {
    return (bytes / (1024 * 1024)).toFixed(3);
  }
}
