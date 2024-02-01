import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { take } from 'rxjs';
import { FileUploader } from 'ng2-file-upload';
import { ToastrService } from 'ngx-toastr';

import { BasicFunctions } from 'src/app/helpers/basicFunctions';
import { CustomValidators } from 'src/app/helpers/customValidators';
import { environment } from 'src/environments/environment';
import { GamesService } from 'src/app/services/games.service';
import { AccountService } from 'src/app/services/account.service';
import { EditComponent } from 'src/app/interfaces/edit-component';
import { Game } from 'src/app/models/game';
import { User } from 'src/app/models/user';
import { Review } from 'src/app/models/review';
import { ReviewsService } from 'src/app/services/reviews.service';
import { ConfirmService } from 'src/app/services/confirm.service';
import { Avatar } from 'src/app/models/avatar';
import { PlayersService } from 'src/app/services/players.service';

@Component({
  selector: 'app-game-edit',
  templateUrl: './game-edit.component.html',
  styleUrls: ['./game-edit.component.css']
})
export class GameEditComponent implements OnInit, OnDestroy, EditComponent {
  @HostListener('window:beforeunload', ['$event']) unloadNotification($event: any) {
    if (this.isDirty()) { $event.returnValue = true; }
  }
  editForm: FormGroup = new FormGroup({});
  initialForm: any;
  validationErrors: string[] | undefined;
  user: User | null = null;
  game: Game | undefined;
  currentTitle = "";
  uploader: FileUploader | undefined;
  baseUrl = environment.apiUrl;
  updating = false;
  reviews: Review[] = [];
  loadingReviews = false;
  playerDeletedSubscription;
  avatarUpdatedSubscription;
  gameDeletedSubscription;
  reviewAcceptedSubscription;
  reviewDeletedSubscription;

  constructor(
    private accountService: AccountService,
    private gamesService: GamesService, 
    private reviewsService: ReviewsService,
    private playersService: PlayersService,
    private toastr: ToastrService, 
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private location: Location,
    private confirmService: ConfirmService
  ) {
    this.playerDeletedSubscription = this.gamesService.playerDeleted$.subscribe(
      ({userName, userId}) => this.playerDeleted(userId)
    );
    this.avatarUpdatedSubscription = this.playersService.avatarUpdated$.subscribe(
      ({userId, avatar}) => this.avatarUpdated(userId, avatar)
    );
    this.gameDeletedSubscription = this.gamesService.gameDeleted$.subscribe(
      gameId => this.gameDeleted(gameId)
    );
    this.reviewAcceptedSubscription = this.gamesService.reviewAccepted$.subscribe(
      review => this.reviewAccepted(review)
    );
    this.reviewDeletedSubscription = this.gamesService.reviewDeleted$.subscribe(
      reviewId => this.reviewDeleted(reviewId)
    );
    this.accountService.currentUser$.pipe(take(1)).subscribe({
      next: user => this.user = user
    });
  }

  ngOnInit(): void {
    const title = this.route.snapshot.paramMap.get('title');
    if (!title) return;

    this.loadGame(title);
    this.loadReviews(title);
  }

  ngOnDestroy(): void {
    this.playerDeletedSubscription.unsubscribe();
    this.avatarUpdatedSubscription.unsubscribe();
    this.gameDeletedSubscription.unsubscribe();
    this.reviewAcceptedSubscription.unsubscribe();
    this.reviewDeletedSubscription.unsubscribe();
  }

  isDirty(): boolean {
    return !BasicFunctions.deepEqual(this.editForm.value, this.initialForm);
  }

  loadGame(title: string) {
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

  loadReviews(title: string) {
    this.loadingReviews = true;
    this.reviewsService.getReviewsForGame(title).subscribe({
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

  updateGame() {
    this.updating = true;
    this.gamesService.updateGame(this.editForm.value, this.currentTitle).subscribe({
      next: () => {
        this.currentTitle = this.editForm?.controls['title'].value;
        this.location.replaceState('/games/' + this.currentTitle + '/edit');
        this.toastr.success('Game updated');
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

  deleteGame() {
    this.confirmService.confirm(
      'Delete Game',
      'Are you sure you want to delete this game?',
      'Delete',
      'Cancel'
    ).subscribe({
      next: confirmed => {
        if (confirmed) {
          if (!this.game) return;
          this.gamesService.deleteGame(this.game.title).subscribe({
            next: () => this.router.navigateByUrl('/edit-profile')
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
      id: this.game?.id,
      title: [this.game?.title, [
        Validators.required,
        CustomValidators.whiteSpace(),
        CustomValidators.alphaNumericSpaceColon(),
        Validators.maxLength(32)
      ]],
      description: [this.game?.description, [
        Validators.maxLength(800)
      ]],
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
      }),
      video: [this.game?.video, CustomValidators.youtubeId()],
    }, 
    { validators: [
      CustomValidators.atLeastOneSelected('genres'),
      CustomValidators.atLeastOneSelected('platforms')]
    });
    
    this.initialForm = this.editForm.value;
  }

  initializeUploader() {
    this.uploader = new FileUploader({
      method: 'PUT',
      url: this.baseUrl + 'games/update-poster/' + this.game?.title,
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

  private playerDeleted(userId: number) {
    if (this.game) {
      this.game.likes = this.game.likes.filter(l => l !== userId);
    }
    this.reviews = this.reviews.filter(r => r.reviewerId !== userId);
  }
  
  private avatarUpdated(userId: number, avatar: Avatar) {
    this.reviews.forEach(r => {
      if (r.reviewerId === userId) r.reviewerAvatar = avatar;
    });
  }

  private gameDeleted(gameId: number) {
    if (this.game && this.game.id === gameId) {
      this.toastr.error('"' + this.game.title + '" was deleted');
      this.router.navigateByUrl('/edit-profile');
    }
  }

  private reviewAccepted(review: Review) {
    this.reviews.unshift(review);
  }

  private reviewDeleted(reviewId: number) {
    this.reviews = this.reviews.filter(r => r.id !== reviewId);
  }
}
