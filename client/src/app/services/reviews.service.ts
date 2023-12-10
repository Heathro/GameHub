import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from 'src/environments/environment';
import { PaginationParams } from '../helpers/pagination';
import { OrderType } from '../helpers/orderType';
import { getPaginatedResult, getPaginationHeaders } from '../helpers/paginationHelper';
import { Review } from '../models/review';
import { map, of } from 'rxjs';

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
    return getPaginatedResult<Review[]>(this.baseUrl + 'reviews/' + gameId, params, this.http);
  }

  postReview(title: string, content: string) {
    const reviewDto = { gameTitle: title, content };
    return this.http.post<Review>(this.baseUrl + 'reviews/new', reviewDto);
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
