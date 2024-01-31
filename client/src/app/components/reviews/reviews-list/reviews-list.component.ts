import { Component, OnDestroy, OnInit } from '@angular/core';

import { ReviewsService } from 'src/app/services/reviews.service';
import { Pagination } from 'src/app/helpers/pagination';
import { OrderType } from 'src/app/enums/orderType';
import { Review } from 'src/app/models/review';
import { Game } from 'src/app/models/game';
import { Poster } from 'src/app/models/poster';

@Component({
  selector: 'app-reviews-list',
  templateUrl: './reviews-list.component.html',
  styleUrls: ['./reviews-list.component.css']
})
export class ReviewsListComponent implements OnInit, OnDestroy {
  reviews: Review[] = [];
  pagination: Pagination | undefined;
  loading = false;
  playerDeletedSubscription;
  gameUpdatedSubscription;
  gameDeletedSubscription;
  posterUpdatedSubscription;
  reviewDeletedSubscription;
  reviewRefreshSubscription;

  constructor(private reviewsService: ReviewsService) {
    this.playerDeletedSubscription = this.reviewsService.playerDeleted$.subscribe(
      ({userName, userId}) => this.playerDeleted(userName, userId)
    );
    this.gameUpdatedSubscription = this.reviewsService.gameUpdated$.subscribe(
      game => this.gameUpdated(game)
    );
    this.gameDeletedSubscription = this.reviewsService.gameDeleted$.subscribe(
      gameId => this.gameDeleted(gameId)
    );
    this.posterUpdatedSubscription = this.reviewsService.posterUpdated$.subscribe(
      ({gameId, poster}) => this.posterUpdated(gameId, poster)
    );
    this.reviewDeletedSubscription = this.reviewsService.reviewDeleted$.subscribe(
      reviewId => this.reviewDeleted(reviewId)
    );
    this.reviewRefreshSubscription = this.reviewsService.refreshReviews$.subscribe(
      () => this.loadReviews()
    );
  }

  ngOnInit(): void {
    this.loadReviews();
  }

  ngOnDestroy(): void {
    this.playerDeletedSubscription.unsubscribe();
    this.gameUpdatedSubscription.unsubscribe();
    this.gameDeletedSubscription.unsubscribe();
    this.posterUpdatedSubscription.unsubscribe();
    this.reviewDeletedSubscription.unsubscribe();
    this.reviewRefreshSubscription.unsubscribe();
  }

  loadReviews() {
    this.loading = true;
    this.reviewsService.getAllReviews().subscribe({
      next: response => {
        if (response.result && response.pagination) {
          this.reviews = response.result;
          this.pagination = {...response.pagination};
          this.loading = false;
        }
      }
    });
  }

  sortNewest() {
    this.sortReviews(OrderType.newest);
  }

  sortOldest() {
    this.sortReviews(OrderType.oldest);
  }

  sortMostLiked() {
    this.sortReviews(OrderType.mostLiked);
  }

  sortLessLiked() {
    this.sortReviews(OrderType.lessLiked);
  }

  sortReviews(orderType: OrderType) {
    this.reviewsService.setPaginationPage(1);
    this.reviewsService.setPaginationOrder(orderType);
    this.loadReviews();
  }

  pageChanged(event: any) {
    if (this.reviewsService.getPaginationParams().currentPage !== event.page) {
      this.reviewsService.setPaginationPage(event.page);
      this.loadReviews();
    }
  }  

  getSortingType() {
    switch (this.reviewsService.getPaginationParams().orderType) {
      case OrderType.mostLiked: return '<i class="bi bi-hand-thumbs-up-fill"></i>&ensp;' + 
                                       '<i class="bi bi-arrow-right"></i>&ensp;' + 
                                       '<i class="bi bi-hand-thumbs-up"></i>';
      case OrderType.lessLiked: return '<i class="bi bi-hand-thumbs-up"></i>&ensp;' + 
                                       '<i class="bi bi-arrow-right"></i>&ensp;' +
                                       '<i class="bi bi-hand-thumbs-up-fill"></i>';
      case OrderType.oldest:    return '<i class="bi bi-hourglass-split"></i>&ensp;' + 
                                       '<i class="bi bi-arrow-right"></i>&ensp;' +
                                       '<i class="bi bi-hourglass"></i>';
      default:                  return '<i class="bi bi-hourglass"></i>&ensp;' + 
                                       '<i class="bi bi-arrow-right"></i>&ensp;' + 
                                       '<i class="bi bi-hourglass-split"></i>';
    }
  }

  private playerDeleted(userName: string, userId: number) {
    this.reviews = this.reviews.filter(r => r.reviewerId !== userId);
  }

  private gameUpdated(game: Game) {
    this.reviews.forEach(r => {
      if (r.gameId === game.id) this.reviewsService.updateReviewsData(r, game);
    });
  }

  private gameDeleted(gameId: number) {
    this.reviews = this.reviews.filter(r => r.gameId !== gameId);
  }

  private posterUpdated(gameId: number, poster: Poster) {
    this.reviews.forEach((r: Review) => {
      if (r.gameId === gameId) r.gamePoster = poster;
    });
  }

  private reviewDeleted(reviewId: number) {
    this.reviews = this.reviews.filter(r => r.id !== reviewId);
  }
}