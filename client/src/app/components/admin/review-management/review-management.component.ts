import { Component, OnDestroy, OnInit } from '@angular/core';

import { Pagination } from 'src/app/helpers/pagination';
import { AdminService } from 'src/app/services/admin.service';
import { GamesService } from 'src/app/services/games.service';
import { PlayersService } from 'src/app/services/players.service';
import { ReviewsService } from 'src/app/services/reviews.service';
import { Game } from 'src/app/models/game';
import { Avatar } from 'src/app/models/avatar';
import { ReviewForModeration } from 'src/app/models/review';

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
  avatarUpdatedSubscription;
  gameUpdatedSubscription;
  gameDeletedSubscription;
  reviewDeletedSubscription;
  reviewRefreshSubscription;

  constructor(
    private adminService: AdminService,
    private reviewsService: ReviewsService,
    private gamesService: GamesService,
    private playersService: PlayersService
  ) {
    this.playerDeletedSubscription = this.playersService.playerDeleted$.subscribe(
      ({userName, userId}) => this.playerDeleted(userId)
    );
    this.avatarUpdatedSubscription = this.playersService.avatarUpdated$.subscribe(
      ({userId, avatar}) => this.avatarUpdated(userId, avatar)
    );
    this.gameUpdatedSubscription = this.gamesService.gameUpdated$.subscribe(
      game => this.gameUpdated(game)
    );
    this.gameDeletedSubscription = this.gamesService.gameDeleted$.subscribe(
      gameId => this.gameDeleted(gameId)
    );
    this.reviewDeletedSubscription = this.reviewsService.reviewDeleted$.subscribe(
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
    this.avatarUpdatedSubscription.unsubscribe();
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

  private playerDeleted(userId: number) {
    this.reviews = this.reviews.filter(r => r.reviewerId !== userId);
  }
  
  private avatarUpdated(userId: number, avatar: Avatar) {
    this.reviews.forEach(r => {
      if (r.reviewerId === userId) r.reviewerAvatar = avatar;
    });
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
