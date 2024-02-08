import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Subject, delay, map, of } from 'rxjs';

import { environment } from 'src/environments/environment';
import { PaginatedResult, PaginationFunctions, PaginationParams } from '../helpers/pagination';
import { OrderType } from '../enums/orderType';
import { Review, ReviewMenu } from '../models/review';
import { Game } from '../models/game';
import { Poster } from '../models/poster';
import { Avatar } from '../models/avatar';

@Injectable({
  providedIn: 'root'
})
export class ReviewsService {  
  baseUrl = environment.apiUrl;
  reviewsCache = new Map();
  paginationParams: PaginationParams;

  private reviewApprovedSource = new Subject<Review>();
  reviewApproved$ = this.reviewApprovedSource.asObservable();
  private reviewDeletedSource = new Subject<number>();
  reviewDeleted$ = this.reviewDeletedSource.asObservable();
  
  private newReviewsCountSource = new Subject<number>();
  newReviewsCount$ = this.newReviewsCountSource.asObservable();
  newReviewsCount = 0;
  private refreshReviewsSource = new Subject();
  refreshReviews$ = this.refreshReviewsSource.asObservable();

  constructor(private http: HttpClient) {
    this.paginationParams = this.initializePaginationParams();
    this.newReviewsCountSource.next(0);
  }
  
  getAllReviews() {
    const queryString = Object.values(this.paginationParams).join('-');

    const response = this.reviewsCache.get(queryString);
    if (response) return of(response).pipe(delay(10));

    let params = PaginationFunctions.getPaginationHeaders(this.paginationParams);
    return PaginationFunctions.getPaginatedResult<Review[]>(this.baseUrl + 'reviews/list', params, this.http)
      .pipe(
        map(reviews => {
          this.newReviewsCount = 0;
          this.newReviewsCountSource.next(0);
          this.reviewsCache.set(queryString, reviews);
          return reviews;
        })
      );
  }

  refreshReviews() {
    if (this.newReviewsCount > 0) {
      this.reviewsCache = new Map();
      this.refreshReviewsSource.next(null);
    }
  }

  getReviewsForGame(title: string) {
    return this.http.get<Review[]>(this.baseUrl + 'reviews/game/' + title);
  }

  getReviewsForPlayer(username: string) {
    return this.http.get<Review[]>(this.baseUrl + 'reviews/player/' + username);
  }

  getReviewMenu(title: string) {
    return this.http.get<ReviewMenu>(this.baseUrl + 'reviews/menu/' + title);
  }

  postReview(title: string, content: string) {
    const reviewDto = { gameTitle: title, content };
    return this.http.post<Review>(this.baseUrl + 'reviews/new', reviewDto);
  }

  deleteReview(id: number) {
    return this.http.delete(this.baseUrl + 'reviews/delete/' + id).pipe(
      map(() => this.reviewsCache = new Map())
    );
  }

  resetPagination() {
    this.paginationParams = this.initializePaginationParams();
  }

  setPaginationPage(currentPage: number) {
    this.paginationParams.currentPage = currentPage;
  }

  setPaginationOrder(orderType: OrderType) {
    this.paginationParams.orderType = orderType;
  }

  getPaginationParams() {
    return this.paginationParams;
  }

  clearPrivateData() {
    this.reviewsCache = new Map();
    this.paginationParams = this.initializePaginationParams();
  }
  
  playerDeleted(userId: number) {
    this.reviewsCache.forEach(q => {
      q.result = q.result.filter((r: Review) => r.reviewerId !== userId);
    });
  }
  
  avatarUpdated(userId: number, avatar: Avatar) {
    this.reviewsCache.forEach(q => {
      q.result.forEach((r: Review) => {
        if (r.reviewerId === userId) r.reviewerAvatar = avatar;
      });
    });
  }

  gameUpdated(game: Game) {
    this.reviewsCache.forEach(q => {
      q.result.forEach((r: Review) => {
        if (r.gameId === game.id) this.updateReviewsData(r, game);
      });
    });
  }

  posterUpdated(gameId: number, poster: Poster) {
    this.reviewsCache.forEach(q => {
      q.result.forEach((r: Review) => {
        if (r.gameId === gameId) r.gamePoster = poster;
      });
    });
  }

  gameDeleted(gameId: number) {
    this.reviewsCache.forEach(q => {
      q.result = q.result.filter((r: Review) => r.gameId !== gameId);
    });
  }

  reviewApproved(review: Review) {
    this.newReviewsCount++;
    this.newReviewsCountSource.next(this.newReviewsCount);
    this.reviewApprovedSource.next(review);
  }

  reviewDeleted(reviewId: number) {
    this.reviewsCache.forEach(q => {
      q.result = q.result.filter((r: Review) => r.id !== reviewId);
    });
  }

  updateReviewsData(review: Review, game: Game) {
    review.gameTitle = game.title;
  }

  updateReviewMenuData(reviewMenu: ReviewMenu, game: Game) {
    reviewMenu.gameTitle = game.title;
  }

  private initializePaginationParams() {
    return new PaginationParams(10, OrderType.newest);
  }
}
