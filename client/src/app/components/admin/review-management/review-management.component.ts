import { Component, OnDestroy, OnInit } from '@angular/core';

import { AdminService } from 'src/app/services/admin.service';
import { Pagination } from 'src/app/helpers/pagination';
import { ReviewForModeration } from 'src/app/models/review';
import { Game } from 'src/app/models/game';

@Component({
  selector: 'app-review-management',
  templateUrl: './review-management.component.html',
  styleUrls: ['./review-management.component.css']
})
export class ReviewManagementComponent implements OnInit, OnDestroy {
  reviews: ReviewForModeration[] = [];
  pagination: Pagination | undefined;
  loading = false;
  playerDeletedSubscription;
  gameUpdatedSubscription;
  gameDeletedSubscription;
  reviewDeletedSubscription;
  reviewRefreshSubscription;

  constructor(private adminService: AdminService) {
    this.playerDeletedSubscription = this.adminService.playerDeleted$.subscribe(
      username => this.playerDeleted(username)
    );
    this.gameUpdatedSubscription = this.adminService.gameUpdated$.subscribe(
      game => this.gameUpdated(game)
    );
    this.gameDeletedSubscription = this.adminService.gameDeleted$.subscribe(
      gameId => this.gameDeleted(gameId)
    );
    this.reviewDeletedSubscription = this.adminService.reviewDeleted$.subscribe(
      reviewId => this.reviewDeleted(reviewId)
    );
    this.reviewRefreshSubscription = this.adminService.refreshReviews$.subscribe(
      () => this.loadReviewsForModeration()
    );
  }

  ngOnInit(): void {
    this.loadReviewsForModeration();
  }

  ngOnDestroy(): void {
    this.playerDeletedSubscription.unsubscribe();
    this.gameUpdatedSubscription.unsubscribe();
    this.gameDeletedSubscription.unsubscribe();
    this.reviewDeletedSubscription.unsubscribe();
    this.reviewRefreshSubscription.unsubscribe();
  }

  loadReviewsForModeration() {
    this.loading = true;
    this.adminService.getReviewsForModeration().subscribe({
      next: response => {
        if (response.result && response.pagination) {
          this.reviews = response.result;
          this.pagination = response.pagination;
          this.loading = false;
        }
      }
    });
  }  

  approveReview(reviewId: number) {
    this.adminService.approveReview(reviewId).subscribe({
      next: () => this.reviews = this.reviews.filter(r => r.id !== reviewId)
    });
  }

  rejectReview(reviewId: number) {
    this.adminService.rejectReview(reviewId).subscribe({
      next: () => this.reviews = this.reviews.filter(r => r.id !== reviewId)
    });
  }

  pageChanged(event: any) {
    if (this.adminService.getUsersPaginationParams().currentPage !== event.page) {
      this.adminService.setReviewsPaginationPage(event.page);
      this.loadReviewsForModeration();
    }
  }

  private playerDeleted(username: string) {
    this.reviews = this.reviews.filter(r => r.reviewerUsername !== username);
  }

  private gameUpdated(game: Game) {
    this.reviews.forEach(r => {
      if (r.gameId === game.id) this.adminService.updateReviewForModerationData(r, game);
    });
  }

  private gameDeleted(gameId: number) {
    this.reviews = this.reviews.filter(r => r.gameId !== gameId);
  }

  private reviewDeleted(reviewId: number) {
    this.reviews = this.reviews.filter(r => r.id !== reviewId);
  }
}
