import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Subject, delay, map, of } from 'rxjs';

import { environment } from 'src/environments/environment';
import { PaginatedResult, PaginationFunctions, PaginationParams } from '../helpers/pagination';
import { OrderType } from '../enums/orderType';
import { Review, ReviewMenu } from '../models/review';
import { Game } from '../models/game';

@Injectable({
  providedIn: 'root'
})
export class ReviewsService {  
  baseUrl = environment.apiUrl;
  reviewsCache = new Map();
  paginationParams: PaginationParams;

  private playerDeletedSource = new Subject<string>();
  playerDeleted$ = this.playerDeletedSource.asObservable();

  private gameUpdatedSource = new Subject<Game>();
  gameUpdated$ = this.gameUpdatedSource.asObservable();
  private gameDeletedSource = new Subject<number>();
  gameDeleted$ = this.gameDeletedSource.asObservable();

  private reviewDeletedSource = new Subject<number>();
  reviewDeleted$ = this.reviewDeletedSource.asObservable();  
  private reviewApprovedSource = new Subject<Review>();
  reviewApproved$ = this.reviewApprovedSource.asObservable();
  
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
    const firstElement: PaginatedResult<Review[]> = this.reviewsCache.values().next().value;
    if (firstElement && firstElement.result) {
      return of(firstElement.result.filter(r => r.gameTitle !== title));
    }

    return this.http.get<Review[]>(this.baseUrl + 'reviews/game/' + title);
  }

  getReviewsForPlayer(username: string) {
    const firstElement: PaginatedResult<Review[]> = this.reviewsCache.values().next().value;
    if (firstElement && firstElement.result) {
      return of(firstElement.result.filter(r => r.reviewerUsername !== username));
    }

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
  
  playerDeleted(username: string) {
    this.reviewsCache.forEach(q => {
      q.result = q.result.filter((r: Review) => r.reviewerUsername !== username);
    });
    this.playerDeletedSource.next(username);
  }

  gameUpdated(game: Game) {
    this.reviewsCache.forEach(q => this.updateReviewsData(q.result, game));
    this.gameUpdatedSource.next(game);
  }

  gameDeleted(gameId: number) {
    this.reviewsCache.forEach(q => {
      q.result = q.result.filter((r: Review) => r.gameId !== gameId);
    });
    this.gameDeletedSource.next(gameId);
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
    this.reviewDeletedSource.next(reviewId);
  }

  updateReviewsData(reviews: Review[], game: Game) {
    reviews.forEach(r => {
      if (r.gameId === game.id) r.gameTitle = game.title;
    });
  }

  updateReviewMenuData(reviewMenu: ReviewMenu, game: Game) {
    if (reviewMenu.game.id === game.id) {
      reviewMenu.game.title = game.title;
    }
  }

  private initializePaginationParams() {
    return new PaginationParams(10, OrderType.newest);
  }
}
