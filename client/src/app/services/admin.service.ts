import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { map, of } from 'rxjs';

import { environment } from 'src/environments/environment';
import { getPaginatedResult, getPaginationHeaders } from '../helpers/paginationHelper';
import { PaginationParams } from '../helpers/pagination';
import { User } from '../models/user';
import { OrderType } from '../helpers/orderType';
import { ReviewForModeration } from '../models/review';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  baseUrl = environment.apiUrl;
  usersCache = new Map();
  usersPaginationParams: PaginationParams;
  reviewsPaginationParams: PaginationParams;

  constructor(private http: HttpClient) {
    this.usersPaginationParams = this.initializeUsersPaginationParams();
    this.reviewsPaginationParams = this.initializeReviewsPaginationParams();
  }

  getUsersWithRoles() {
    const queryString = Object.values(this.usersPaginationParams).join('-');
    
    const users = this.usersCache.get(queryString);
    if (users) return of(users);

    let params = getPaginationHeaders(this.usersPaginationParams);
    return getPaginatedResult<User[]>(this.baseUrl + 'admin/users-with-roles', params, this.http).pipe(
      map(users => {
        this.usersCache.set(queryString, users);
        return users;
      })
    );
  }

  editRoles(userName: string, roles: string) {
    return this.http.post<string[]>(this.baseUrl + 'admin/edit-roles/' + userName + '?roles=' + roles, {});
  }

  deleteUser(userName: string) {
    return this.http.delete(this.baseUrl + 'admin/delete-user/' + userName);
  }

  getGamesForModeration() {

  }

  getReviewsForModeration() {
    let params = getPaginationHeaders(this.reviewsPaginationParams);
    return getPaginatedResult<ReviewForModeration[]>(
      this.baseUrl + 'admin/reviews-for-moderation', params, this.http
    );
  }

  approveReview(reviewId: number) {
    return this.http.put(this.baseUrl + 'admin/approve-review/' + reviewId, {});
  }

  setUsersPaginationPage(currentPage: number) {
    this.usersPaginationParams.currentPage = currentPage;
  }

  setUsersPaginationOrder(orderType: OrderType) {
    this.usersPaginationParams.orderType = orderType;
  }

  getUsersPaginationParams() {
    return this.usersPaginationParams;
  }  

  setReviewsPaginationPage(currentPage: number) {
    this.reviewsPaginationParams.currentPage = currentPage;
  }

  setReviewsPaginationOrder(orderType: OrderType) {
    this.reviewsPaginationParams.orderType = orderType;
  }

  getReviewsPaginationParams() {
    return this.reviewsPaginationParams;
  }

  clearPrivateData() {
    this.usersCache = new Map();
    this.usersPaginationParams = this.initializeUsersPaginationParams();
    this.reviewsPaginationParams = this.initializeReviewsPaginationParams();
  }

  private initializeUsersPaginationParams() {
    return new PaginationParams(7, OrderType.az);
  }

  private initializeReviewsPaginationParams() {
    return new PaginationParams(4, OrderType.az);
  }
}
