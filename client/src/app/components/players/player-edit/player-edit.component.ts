import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

import { ToastrService } from 'ngx-toastr';
import { FileUploader } from 'ng2-file-upload';
import { take } from 'rxjs';

import { environment } from 'src/environments/environment';
import { AccountService } from 'src/app/services/account.service';
import { PlayersService } from 'src/app/services/players.service';
import { EditComponent } from 'src/app/interfaces/edit-component';
import { Player } from 'src/app/models/player';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-player-edit',
  templateUrl: './player-edit.component.html',
  styleUrls: ['./player-edit.component.css']
})
export class PlayerEditComponent implements OnInit, EditComponent {
  @HostListener('window:beforeunload', ['$event']) unloadNotification($event: any) {
    if (this.editForm?.dirty) { $event.returnValue = true; }
  }
  editForm: FormGroup = new FormGroup({});
  validationErrors: string[] | undefined;
  user: User | null = null;
  player: Player | undefined;
  uploader: FileUploader | undefined;
  baseUrl = environment.apiUrl;

  constructor(
    private accountService: AccountService, 
    private playersService: PlayersService,
    private toastr: ToastrService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.accountService.currentUser$.pipe(take(1)).subscribe({
      next: user => this.user = user
    });
  }

  ngOnInit(): void {
    this.loadPlayer();
  }

  isDirty(): boolean {
    return this.editForm.dirty;
  }

  loadPlayer() {
    if (!this.user) return;
    this.playersService.getPlayer(this.user.username).subscribe({
      next: player => {
        if (!player) this.router.navigateByUrl('/not-found');
        this.player = player;
        this.initializeUploader();
        this.initializeFrom();
      }
    });
  }

  updatePlayer() {
    this.playersService.updatePlayer(this.editForm?.value).subscribe({
      next: () => {
        this.toastr.success('Profile updated');
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
      id: this.player?.id,
      realname: this.player?.realname,
      summary: this.player?.summary,
      country: this.player?.country,
      city: this.player?.city
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
