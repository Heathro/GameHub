import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { delay, map, of } from 'rxjs';

import { environment } from 'src/environments/environment';
import { PaginatedResult, PaginationFunctions, PaginationParams } from '../helpers/pagination';
import { OrderType } from '../enums/orderType';
import { Review, ReviewMenu } from '../models/review';

@Injectable({
  providedIn: 'root'
})
export class ReviewsService {  
  baseUrl = environment.apiUrl;
  reviewsCache = new Map();
  paginationParams: PaginationParams;

  constructor(private http: HttpClient) {
    this.paginationParams = this.initializePaginationParams();
  }
  
  getAllReviews() {
    const queryString = Object.values(this.paginationParams).join('-');

    const response = this.reviewsCache.get(queryString);
    if (response) return of(response);

    let params = PaginationFunctions.getPaginationHeaders(this.paginationParams);
    return PaginationFunctions.getPaginatedResult<Review[]>(
      this.baseUrl + 'reviews/list', params, this.http).pipe(
        map(reviews => {
          this.reviewsCache.set(queryString, reviews);
          return reviews;
        })
      );
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
    return this.http.delete(this.baseUrl + 'reviews/delete/' + id);
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

  private initializePaginationParams() {
    return new PaginationParams(5, OrderType.newest);
  }
}
