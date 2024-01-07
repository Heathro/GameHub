import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from 'src/environments/environment';
import { getPaginatedResult, getPaginationHeaders } from '../helpers/paginationHelper';
import { PaginationParams } from '../helpers/pagination';
import { User } from '../models/user';
import { OrderType } from '../helpers/orderType';
import { ReviewForModeration } from '../models/review';
import { Game } from '../models/game';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  baseUrl = environment.apiUrl;
  usersPaginationParams: PaginationParams;  
  gamesPaginationParams: PaginationParams;
  reviewsPaginationParams: PaginationParams;

  constructor(private http: HttpClient) {
    this.usersPaginationParams = this.initializeUsersPaginationParams();
    this.gamesPaginationParams = this.initializeGamesPaginationParams();
    this.reviewsPaginationParams = this.initializeReviewsPaginationParams();
  }

  getUsersWithRoles() {
    let params = getPaginationHeaders(this.usersPaginationParams);
    return getPaginatedResult<User[]>(this.baseUrl + 'admin/users-with-roles', params, this.http);
  }

  editRoles(userName: string, roles: string) {
    return this.http.post<string[]>(this.baseUrl + 'admin/edit-roles/' + userName + '?roles=' + roles, {});
  }

  deleteUser(userName: string) {
    return this.http.delete(this.baseUrl + 'admin/delete-user/' + userName);
  }

  getGamesForModeration() {
    let params = getPaginationHeaders(this.gamesPaginationParams);
    return getPaginatedResult<Game[]>(this.baseUrl + 'admin/games-for-moderation', params, this.http);
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

  setGamesPaginationPage(currentPage: number) {
    this.gamesPaginationParams.currentPage = currentPage;
  }

  setGamesPaginationOrder(orderType: OrderType) {
    this.gamesPaginationParams.orderType = orderType;
  }

  getGamesPaginationParams() {
    return this.gamesPaginationParams;
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
    this.usersPaginationParams = this.initializeUsersPaginationParams();
    this.gamesPaginationParams = this.initializeGamesPaginationParams();
    this.reviewsPaginationParams = this.initializeReviewsPaginationParams();
  }

  private initializeUsersPaginationParams() {
    return new PaginationParams(7, OrderType.az);
  }

  private initializeGamesPaginationParams() {
    return new PaginationParams(7, OrderType.az);
  }

  private initializeReviewsPaginationParams() {
    return new PaginationParams(5, OrderType.az);
  }
}
