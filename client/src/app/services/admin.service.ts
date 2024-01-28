import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Subject, map } from 'rxjs';

import { environment } from 'src/environments/environment';
import { PaginationFunctions, PaginationParams } from '../helpers/pagination';
import { User } from '../models/user';
import { OrderType } from '../enums/orderType';
import { ReviewForModeration } from '../models/review';
import { Game } from '../models/game';
import { Poster } from '../models/poster';

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

  private gameUpdatedSource = new Subject<Game>();
  gameUpdated$ = this.gameUpdatedSource.asObservable();
  private posterUpdatedSource = new Subject<any>();
  posterUpdated$ = this.posterUpdatedSource.asObservable();
  private gameDeletedSource = new Subject<number>();
  gameDeleted$ = this.gameDeletedSource.asObservable();

  private reviewDeletedSource = new Subject<number>();
  reviewDeleted$ = this.reviewDeletedSource.asObservable();

  private newReviewsCountSource = new Subject<number>();
  newReviewsCount$ = this.newReviewsCountSource.asObservable();
  newReviewsCount = 0;
  private refreshReviewsSource = new Subject();
  refreshReviews$ = this.refreshReviewsSource.asObservable();
  
  private newGameCountSource = new Subject<number>();
  newGameCount$ = this.newGameCountSource.asObservable();
  newGameCount = 0;
  private refreshGamesSource = new Subject();
  refreshGames$ = this.refreshGamesSource.asObservable();

  constructor(private http: HttpClient) {
    this.usersPaginationParams = this.initializeUsersPaginationParams();
    this.gamesPaginationParams = this.initializeGamesPaginationParams();
    this.reviewsPaginationParams = this.initializeReviewsPaginationParams();
    this.newReviewsCountSource.next(0);
    this.newGameCountSource.next(0);
  }

  refresh() {
    if (this.newReviewsCount > 0) this.refreshReviewsSource.next(null);
    if (this.newGameCount > 0) this.refreshGamesSource.next(null);
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
    ).pipe(
      map(response => {
        this.newGameCount = 0;
        this.newGameCountSource.next(0);
        return response;
      })
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

  gamePublished() {
    this.newGameCount++;
    this.newGameCountSource.next(this.newGameCount);
  }

  gameUpdated(game: Game) {
    this.gameUpdatedSource.next(game);
  }

  posterUpdated(gameId: number, poster: Poster) {
    this.posterUpdatedSource.next({gameId, poster});
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
  
  updateGameData(currentGame: Game, updatedGame: Game) {
    currentGame.title = updatedGame.title;
    currentGame.description = updatedGame.description;
    currentGame.platforms.windows = updatedGame.platforms.windows;
    currentGame.platforms.macos = updatedGame.platforms.macos;
    currentGame.platforms.linux = updatedGame.platforms.linux;
    currentGame.genres.action = updatedGame.genres.action;
    currentGame.genres.adventure = updatedGame.genres.adventure;
    currentGame.genres.card = updatedGame.genres.card;
    currentGame.genres.educational = updatedGame.genres.educational;
    currentGame.genres.fighting = updatedGame.genres.fighting;
    currentGame.genres.horror = updatedGame.genres.horror;
    currentGame.genres.platformer = updatedGame.genres.platformer;
    currentGame.genres.puzzle = updatedGame.genres.puzzle;
    currentGame.genres.racing = updatedGame.genres.racing;
    currentGame.genres.rhythm = updatedGame.genres.rhythm;
    currentGame.genres.roleplay = updatedGame.genres.roleplay;
    currentGame.genres.shooter = updatedGame.genres.shooter;
    currentGame.genres.simulation = updatedGame.genres.simulation;
    currentGame.genres.sport = updatedGame.genres.sport;
    currentGame.genres.stealth = updatedGame.genres.stealth;
    currentGame.genres.strategy = updatedGame.genres.strategy;
    currentGame.genres.survival = updatedGame.genres.survival;
    currentGame.video = updatedGame.video;
  }

  updateReviewForModerationData(review: ReviewForModeration, game: Game) {
    review.gameTitle = game.title;
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
