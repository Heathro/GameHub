import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { map, of } from 'rxjs';

import { environment } from 'src/environments/environment';
import { PaginationParams } from '../helpers/pagination';
import { getPaginatedResult, getPaginationHeaders } from '../helpers/paginationHelper';
import { OrderType } from '../helpers/orderType';
import { Review } from '../models/review';
import { ReviewMenu } from '../models/reviewMenu';

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
    
    const reviews = this.reviewsCache.get(queryString);
    if (reviews) return of(reviews);

    let params = getPaginationHeaders(this.paginationParams);
    return getPaginatedResult<Review[]>(this.baseUrl + 'reviews/list', params, this.http).pipe(
      map(reviews => {
        this.reviewsCache.set(queryString, reviews);
        return reviews;
      })
    );
  }

  getReviewsForGame(gameId: number) {
    let params = getPaginationHeaders(this.paginationParams);
    return getPaginatedResult<Review[]>(this.baseUrl + 'reviews/game/' + gameId, params, this.http);
  }

  getReviewMenu(title: string) {
    return this.http.get<ReviewMenu>(this.baseUrl + 'reviews/menu/' + title);
  }

  postReview(title: string, content: string) {
    const reviewDto = { gameTitle: title, content };
    return this.http.post<Review>(this.baseUrl + 'reviews/new', reviewDto);
  }

  deleteReview(gameId: number) {
    return this.http.delete(this.baseUrl + 'reviews/delete/' + gameId);
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
