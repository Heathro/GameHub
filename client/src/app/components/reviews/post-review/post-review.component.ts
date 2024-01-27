import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ToastrService } from 'ngx-toastr';

import { CustomValidators } from 'src/app/helpers/customValidators';
import { ConfirmService } from 'src/app/services/confirm.service';
import { EditComponent } from 'src/app/interfaces/edit-component';
import { ReviewsService } from 'src/app/services/reviews.service';
import { ReviewMenu } from 'src/app/models/review';
import { Game } from 'src/app/models/game';

@Component({
  selector: 'app-post-review',
  templateUrl: './post-review.component.html',
  styleUrls: ['./post-review.component.css']
})
export class PostReviewComponent implements OnInit, OnDestroy, EditComponent {
  @HostListener('window:beforeunload', ['$event']) unloadNotification($event: any) {
    if (this.isDirty()) { $event.returnValue = true; }
  }
  reviewForm: FormGroup = new FormGroup({});
  validationErrors: string[] | undefined;
  reviewMenu: ReviewMenu | undefined;
  initialContent = "";
  posting = false;
  finished = false;
  gameUpdatedSubscription;
  gameDeletedSubscription;
  reviewDeletedSubscription;

  constructor(
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private router: Router,  
    private confirmService: ConfirmService,
    private reviewsService: ReviewsService
  ) {
    this.gameUpdatedSubscription = this.reviewsService.gameUpdated$.subscribe(
      game => this.gameUpdated(game)
    );
    this.gameDeletedSubscription = this.reviewsService.gameDeleted$.subscribe(
      gameId => this.gameDeleted(gameId)
    );
    this.reviewDeletedSubscription = this.reviewsService.reviewDeleted$.subscribe(
      reviewId => this.reviewDeleted(reviewId)
    );
  }

  isDirty(): boolean {
    if (this.finished) return false;

    const content: string = this.reviewForm.value.content;
    if (this.initialContent === content) return false;
    return content.length > 0 && !/^[ \t\n]*$/.test(content);
  }

  ngOnInit(): void {
    this.loadReview();
  }

  ngOnDestroy(): void {
    this.gameUpdatedSubscription.unsubscribe();
    this.gameDeletedSubscription.unsubscribe();
    this.reviewDeletedSubscription.unsubscribe();
  }

  loadReview() {
    const title = this.route.snapshot.paramMap.get('title');
    if (!title) return;
    this.reviewsService.getReviewMenu(title).subscribe({
      next: reviewMenu => {
        this.reviewMenu = reviewMenu;
        this.initialContent = this.reviewMenu.content;
        this.initializeFrom();
        console.log(reviewMenu)
      }
    });
  }

  postReview() {
    if (!this.reviewMenu) return;
    this.posting = true;
    this.reviewsService.postReview(this.reviewMenu.game.title, this.reviewForm.value.content).subscribe({
      next: () => {
        if (!this.reviewMenu) return;
        this.finished = true;
        this.posting = false;
        this.router.navigateByUrl('/games/' + this.reviewMenu?.game.title);
        this.toastr.success('Review awaiting moderation');
      },
      error: error => {
        this.finished = true;
        this.posting = false;
        this.validationErrors = error;
      }
    });
  }

  deleteReview() {
    this.confirmService.confirm(
      'Delete Review',
      'Are you sure you want to delete this review?',
      'Delete',
      'Cancel'
    ).subscribe({
      next: confirmed => {
        if (confirmed) {
          if (!this.reviewMenu) return;
          this.reviewsService.deleteReview(this.reviewMenu.id).subscribe({
            next: () => {
              if (!this.reviewMenu) return;
              this.finished = true;
              this.reviewMenu.posted = false;
              this.reviewMenu.content = "";
              this.router.navigateByUrl('/games/' + this.reviewMenu.game.title);
              this.toastr.success('Delete successful');
              this.posting = false;
            }
          });
        }
      }
    });
  }

  initializeFrom() {
    if (!this.reviewMenu) return;
    this.reviewForm = this.formBuilder.group({
      content: [this.reviewMenu.content, [
        Validators.required,
        Validators.maxLength(800),
        CustomValidators.onlyWhiteSpace()
      ]]
    });
  }

  private gameUpdated(game: Game) {
    if (this.reviewMenu) this.reviewsService.updateReviewMenuData(this.reviewMenu, game);
  }

  private gameDeleted(gameId: number) {
    if (this.reviewMenu && this.reviewMenu.game.id === gameId) {
      this.toastr.warning("Game was deleted");
      this.router.navigateByUrl('/games');
    }
  } 
  
  private reviewDeleted(reviewId: number) {
    if (this.reviewMenu && this.reviewMenu.id === reviewId) {
      this.toastr.warning("Review was deleted");
      this.loadReview();
    }
  }
}
