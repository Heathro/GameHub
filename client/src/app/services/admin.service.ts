import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Subject, map } from 'rxjs';

import { environment } from 'src/environments/environment';
import { PaginationFunctions, PaginationParams } from '../helpers/pagination';
import { User } from '../models/user';
import { OrderType } from '../enums/orderType';
import { Review, ReviewForModeration } from '../models/review';
import { Game } from '../models/game';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  baseUrl = environment.apiUrl;
  usersPaginationParams: PaginationParams;  
  gamesPaginationParams: PaginationParams;
  reviewsPaginationParams: PaginationParams;
  private playerDeletedSource = new Subject<string>();
  playerDeleted$ = this.playerDeletedSource.asObservable();
  private gameDeletedSource = new Subject<number>();
  gameDeleted$ = this.gameDeletedSource.asObservable();
  private reviewDeletedSource = new Subject<number>();
  reviewDeleted$ = this.reviewDeletedSource.asObservable();
  private newReviewsCountSource = new Subject<number>();
  newReviewsCount$ = this.newReviewsCountSource.asObservable();
  newReviewsCount = 0;
  private refreshReviewsSource = new Subject();
  refreshReviews$ = this.refreshReviewsSource.asObservable();

  constructor(private http: HttpClient) {
    this.usersPaginationParams = this.initializeUsersPaginationParams();
    this.gamesPaginationParams = this.initializeGamesPaginationParams();
    this.reviewsPaginationParams = this.initializeReviewsPaginationParams();
    this.newReviewsCountSource.next(0);
  }

  getUsersWithRoles() {
    let params = PaginationFunctions.getPaginationHeaders(this.usersPaginationParams);
    return PaginationFunctions.getPaginatedResult<User[]>(
      this.baseUrl + 'admin/users-with-roles', params, this.http
    );
  }

  editRoles(userName: string, roles: string) {
    return this.http.post<string[]>(this.baseUrl + 'admin/edit-roles/' + userName + '?roles=' + roles, {});
  }

  deleteUser(userName: string) {
    return this.http.delete(this.baseUrl + 'admin/delete-user/' + userName);
  }

  getGamesForModeration() {
    let params = PaginationFunctions.getPaginationHeaders(this.gamesPaginationParams);
    return PaginationFunctions.getPaginatedResult<Game[]>(
      this.baseUrl + 'admin/games-for-moderation', params, this.http
    );
  } 
  
  deleteGame(userName: string) {
    return this.http.delete(this.baseUrl + 'admin/delete-game/' + userName);
  }

  getReviewsForModeration() {
    let params = PaginationFunctions.getPaginationHeaders(this.reviewsPaginationParams);
    return PaginationFunctions.getPaginatedResult<ReviewForModeration[]>(
      this.baseUrl + 'admin/reviews-for-moderation', params, this.http
    ).pipe(
      map(response => {
        this.newReviewsCount = 0;
        this.newReviewsCountSource.next(0);
        return response;
      })
    );
  }

  refreshReviews() {
    if (this.newReviewsCount > 0) {
      this.refreshReviewsSource.next(null);
    }
  }

  approveReview(reviewId: number) {
    return this.http.put(this.baseUrl + 'admin/approve-review/' + reviewId, {});
  }  
  
  rejectReview(reviewId: number) {
    return this.http.delete(this.baseUrl + 'admin/reject-review/' + reviewId);
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
  
  playerDeleted(username: string) {
    this.playerDeletedSource.next(username);
  }

  gameDeleted(gameId: number) {
    this.gameDeletedSource.next(gameId);
  }

  reviewPosted() {
    this.newReviewsCount++;
    this.newReviewsCountSource.next(this.newReviewsCount);
  }

  reviewDeleted(reviewId: number) {
    this.reviewDeletedSource.next(reviewId);
  }

  private initializeUsersPaginationParams() {
    return new PaginationParams(10, OrderType.az);
  }

  private initializeGamesPaginationParams() {
    return new PaginationParams(10, OrderType.az);
  }

  private initializeReviewsPaginationParams() {
    return new PaginationParams(10, OrderType.az);
  }
}
