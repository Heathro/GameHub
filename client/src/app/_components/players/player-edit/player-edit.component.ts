import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';

import { ToastrService } from 'ngx-toastr';
import { FileUploader } from 'ng2-file-upload';
import { take } from 'rxjs';

import { environment } from 'src/environments/environment';
import { AccountService } from 'src/app/_services/account.service';
import { PlayersService } from 'src/app/_services/players.service';
import { Player } from 'src/app/_models/player';
import { User } from 'src/app/_models/user';

@Component({
  selector: 'app-player-edit',
  templateUrl: './player-edit.component.html',
  styleUrls: ['./player-edit.component.css']
})
export class PlayerEditComponent implements OnInit {
  @HostListener('window:beforeunload', ['$event']) unloadNotification($event: any) {
    if (this.editForm?.dirty) { $event.returnValue = true; }
  }
  @ViewChild('editForm') editForm: NgForm | undefined;
  user: User | null = null;
  player: Player | undefined;
  uploader: FileUploader | undefined;
  baseUrl = environment.apiUrl;

  constructor(
    private accountService: AccountService, 
    private playersService: PlayersService,
    private toastr: ToastrService
  ) {
    this.accountService.currentUser$.pipe(take(1)).subscribe({
      next: user => this.user = user
    });
  }

  ngOnInit(): void {
    this.loadPlayer();
  }

  loadPlayer() {
    if (!this.user) return;
    this.playersService.getPlayer(this.user.username).subscribe({
      next: player => {
        this.player = player;
        this.initializeUploader();
      }
    });
  }

  updatePlayer() {
    this.playersService.updatePlayer(this.editForm?.value).subscribe({
      next: () => {
        this.toastr.success('Profile updated');
        this.editForm?.reset(this.player);
      }
    });
  }

  initializeUploader() {
    this.uploader = new FileUploader({
      method: 'PUT',
      url: this.baseUrl + 'users/update-avatar',
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
        const avatar = JSON.parse(response);
        if (this.player) {
          this.player.avatar = avatar;
        }
        if (this.user) {
          this.user.avatarUrl = avatar.url;
          this.accountService.setCurrentUser(this.user);
        }
      }
    }

    this.uploader.onAfterAddingFile = f => {
      if (this.uploader && this.uploader?.queue.length > 1) {
        this.uploader.removeFromQueue(this.uploader.queue[0]);
      }
    };
  }
}
