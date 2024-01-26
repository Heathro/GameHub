import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { ToastrService } from 'ngx-toastr';
import { FileUploader } from 'ng2-file-upload';
import { take } from 'rxjs';

import { BasicFunctions } from 'src/app/helpers/basicFunctions';
import { environment } from 'src/environments/environment';
import { ConfirmService } from 'src/app/services/confirm.service';
import { AccountService } from 'src/app/services/account.service';
import { PlayersService } from 'src/app/services/players.service';
import { EditComponent } from 'src/app/interfaces/edit-component';
import { Player } from 'src/app/models/player';
import { User } from 'src/app/models/user';
import { Review } from 'src/app/models/review';
import { ReviewsService } from 'src/app/services/reviews.service';

@Component({
  selector: 'app-player-edit',
  templateUrl: './player-edit.component.html',
  styleUrls: ['./player-edit.component.css']
})
export class PlayerEditComponent implements OnInit, OnDestroy, EditComponent {
  @HostListener('window:beforeunload', ['$event']) unloadNotification($event: any) {
    if (this.isDirty()) { $event.returnValue = true; }
  }
  editForm: FormGroup = new FormGroup({});
  initialForm: any;
  validationErrors: string[] | undefined;
  user: User | null = null;
  player: Player | undefined;
  uploader: FileUploader | undefined;
  baseUrl = environment.apiUrl;
  updating = false;
  reviews: Review[] = [];
  loadingReviews = false;
  gameDeletedSubscription;
  reviewDeletedSubscription;
  reviewAcceptedSubscription;

  constructor(
    private accountService: AccountService, 
    private playersService: PlayersService,
    private reviewsService: ReviewsService,
    private toastr: ToastrService,
    private formBuilder: FormBuilder,
    private router: Router,
    private confirmService: ConfirmService
  ) {
    this.gameDeletedSubscription = this.playersService.gameDeleted$.subscribe(
      gameId => this.gameDeleted(gameId)
    );
    this.reviewAcceptedSubscription = this.playersService.reviewAccepted$.subscribe(
      review => this.reviewAccepted(review)
    );
    this.reviewDeletedSubscription = this.playersService.reviewDeleted$.subscribe(
      reviewId => this.reviewDeleted(reviewId)
    );
    this.accountService.currentUser$.pipe(take(1)).subscribe({
      next: user => this.user = user
    });
  }

  ngOnInit(): void {
    this.loadPlayer();
    this.loadReviews();
  }
  
  ngOnDestroy(): void {
    this.gameDeletedSubscription.unsubscribe();
    this.reviewAcceptedSubscription.unsubscribe();
    this.reviewDeletedSubscription.unsubscribe();
  }

  isDirty(): boolean {
    return !BasicFunctions.deepEqual(this.editForm.value, this.initialForm);
  }

  loadPlayer() {
    if (!this.user) return;
    this.playersService.getPlayer(this.user.userName).subscribe({
      next: player => {
        if (!player) this.router.navigateByUrl('/not-found');
        this.player = player;
        this.initializeUploader();
        this.initializeFrom();
      }
    });
  }  
  
  loadReviews() {
    if (!this.user) return;
    this.loadingReviews = true;
    this.reviewsService.getReviewsForPlayer(this.user.userName).subscribe({
      next: reviews => {
        this.reviews = reviews;
        this.loadingReviews = false;
      }
    });
  }

  deleteReview(id: number) {
    this.reviewsService.deleteReview(id).subscribe({
      next: () => this.reviews = this.reviews.filter(r => r.id !== id)
    })
  }

  updatePlayer() {
    this.updating = true;
    this.playersService.updatePlayer(this.editForm?.value).subscribe({
      next: () => {
        this.toastr.success('Profile updated');
        this.resetForm();
        this.updating = false;
      },
      error: error => {
        this.validationErrors = error;
        this.resetForm();
        this.updating = false;
      }
    });
  }

  deleteUser() {
    this.confirmService.confirm(
      'Delete Account',
      'Are you sure you want to delete your account?',
      'Delete',
      'Cancel'
    ).subscribe({
      next: confirmed => {
        if (confirmed) {
          this.playersService.deletePlayer().subscribe({
            next: () => {
              this.accountService.logout();
            }
          });
        }
      }
    });
  }

  resetForm() {
    this.editForm?.reset(this.editForm.value);
    this.initialForm = this.editForm.value;
  }
  
  initializeFrom() {
    this.editForm = this.formBuilder.group({
      id: this.player?.id,
      realname: this.player?.realname,
      summary: [this.player?.summary, [
        Validators.maxLength(800)
      ]],
      country: this.player?.country,
      city: this.player?.city
    });

    this.initialForm = this.editForm.value;
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
  
  private gameDeleted(gameId: number) {
    if (this.player) {
      this.player.publications = this.player.publications.filter(g => g.id !== gameId);
    }
    this.reviews = this.reviews.filter(r => r.gameId !== gameId);
  }

  private reviewAccepted(review: Review) {
    this.reviews.unshift(review);
  }

  private reviewDeleted(reviewId: number) {
    this.reviews = this.reviews.filter(r => r.id !== reviewId);
  }
}
