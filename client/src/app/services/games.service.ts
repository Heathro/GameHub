import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Subject, delay, map, of } from 'rxjs';

import { environment } from 'src/environments/environment';
import { PaginationFunctions, PaginationParams } from '../helpers/pagination';
import { Game } from '../models/game';
import { Filter } from '../models/filter';
import { User } from '../models/user';
import { OrderType } from '../enums/orderType';
import { Review } from '../models/review';

@Injectable({
  providedIn: 'root'
})
export class GamesService {
  baseUrl = environment.apiUrl;
  gamesCache = new Map();
  paginationParams: PaginationParams;
  filter: Filter | undefined;
  user: User | undefined;

  private playerDeletedSource = new Subject<string>();
  playerDeleted$ = this.playerDeletedSource.asObservable();

  private gameDeletedSource = new Subject<number>();
  gameDeleted$ = this.gameDeletedSource.asObservable();

  private reviewAcceptedSource = new Subject<Review>();
  reviewAccepted$ = this.reviewAcceptedSource.asObservable();
  private reviewDeletedSource = new Subject<number>();
  reviewDeleted$ = this.reviewDeletedSource.asObservable();
  
  private newGamesCountSource = new Subject<number>();
  newGamesCount$ = this.newGamesCountSource.asObservable();
  newGamesCount = 0;
  private refreshGamesSource = new Subject();
  refreshGames$ = this.refreshGamesSource.asObservable();

  constructor(private http: HttpClient) {
    this.paginationParams = this.initializePaginationParams();
    this.newGamesCountSource.next(0);
  }
  
  getGames() {
    const queryString = Object.values(this.paginationParams).join('-') + this.stringifyFilter(this.filter!);
      
    const response = this.gamesCache.get(queryString);
    if (response) return of(response).pipe(delay(10));

    let params = PaginationFunctions.getPaginationHeaders(this.paginationParams);
    return PaginationFunctions.getFilteredPaginatedResult<Game[]>(
      this.baseUrl + 'games/list', params, this.http, this.filter!).pipe(
        map(response => {
          this.newGamesCount = 0;
          this.newGamesCountSource.next(0);
          this.gamesCache.set(queryString, response);
          return response;
        })
      );
  }

  refreshGames() {
    if (this.newGamesCount > 0) {
      this.gamesCache = new Map();
      this.refreshGamesSource.next(null);
    }
  }

  getGame(title: string) {
    let game = [...this.gamesCache.values()]
      .reduce((array, element) => array.concat(element.result), [])
      .find((game: Game) => game.title === title);

    if (game) return of(game);
    
    return this.http.get<Game>(this.baseUrl + 'games/' + title);
  }

  publishGame(publication: any) {
    return this.http.post(this.baseUrl + 'publications/new', publication).pipe(
      map(() => this.gamesCache = new Map())
    );
  }

  isGamePublished(game: Game) {
    if (!this.user) return false; 
    return game.publisher === this.user.userName;
  }

  likeGame(gameId: number) {
    return this.http.post(this.baseUrl + 'likes/' + gameId, {}).pipe(
      map(() => {
        if (!this.user) return;
        const userId = this.user.id;

        this.gamesCache.forEach(q => {
          q.result.forEach((g: Game) => {
            if (g.id === gameId) {
              if (this.isGameLiked(g)) {
                g.likes = g.likes.filter(l => l !== userId);
              } else {
                g.likes.push(userId);
              }
            }
          });
        });
      })
    );
  }

  isGameLiked(game: Game) {
    if (!this.user) return false;
    return game.likes.includes(this.user.id);
  }

  bookmarkGame(gameId: number) {
    return this.http.post(this.baseUrl + 'bookmarks/' + gameId, {}).pipe(
      map(() => {
        if (!this.user) return;
        const userId = this.user.id;

        this.gamesCache.forEach(q => {
          q.result.forEach((g: Game) => {
            if (g.id === gameId) {
              if (this.isGameBookmarked(g)) {
                g.bookmarks = g.bookmarks.filter(b => b !== userId);
              } else {
                g.bookmarks.push(userId);
              }
            }
          });
        });
      })
    );
  }

  isGameBookmarked(game: Game) {
    if (!this.user) return false;
    return game.bookmarks.includes(this.user.id);
  }

  updateGame(game: Game, title: string) {
    return this.http.put(this.baseUrl + 'games/update-game/' + title, game).pipe(
      map(() => {
        this.gamesCache.forEach(q => {
          q.result.forEach((g: Game) => {
            if (g.id === game.id) {              
              g.title = game.title;
              g.description = game.description;
              g.platforms.windows = game.platforms.windows;
              g.platforms.macos = game.platforms.macos;
              g.platforms.linux = game.platforms.linux;
              g.genres.action = game.genres.action;
              g.genres.adventure = game.genres.adventure;
              g.genres.card = game.genres.card;
              g.genres.educational = game.genres.educational;
              g.genres.fighting = game.genres.fighting;
              g.genres.horror = game.genres.horror;
              g.genres.platformer = game.genres.platformer;
              g.genres.puzzle = game.genres.puzzle;
              g.genres.racing = game.genres.racing;
              g.genres.rhythm = game.genres.rhythm;
              g.genres.roleplay = game.genres.roleplay;
              g.genres.shooter = game.genres.shooter;
              g.genres.simulation = game.genres.simulation;
              g.genres.sport = game.genres.sport;
              g.genres.stealth = game.genres.stealth;
              g.genres.strategy = game.genres.strategy;
              g.genres.survival = game.genres.survival;
              g.video = game.video;
            }
          });
        });
      })
    );
  }

  deleteGame(title: string) {
    return this.http.delete(this.baseUrl + 'games/delete-game/' + title).pipe(
      map(() => this.gamesCache = new Map())
    );
  }

  deleteScreenshot(game: Game, screenshotId: number) {
    return this.http.delete(this.baseUrl + 'games/delete-screenshot/' + game.title + '/' + screenshotId).pipe(
      map(() => {
        this.gamesCache.forEach(q => {
          q.result.forEach((g: Game) => {
            if (g.id === game.id) {
              g.screenshots = g.screenshots.filter(s => s.id === screenshotId);
            }
          });
        });
      })
    );
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

  setFilter(filter: Filter) {
    this.filter = filter;
  }

  getFilter() {
    return this.filter;
  }

  setCurrentUser(user: User) {
    this.user = user;
  }

  clearPrivateData() {
    this.gamesCache = new Map();
    this.paginationParams = this.initializePaginationParams();
    this.filter = undefined;
    this.user = undefined;
  }  
  
  playerDeleted(username: string) {
    this.gamesCache.forEach(q => {
      q.result = q.result.forEach((g: Game) => {
        // TODO: likes and bookmarks
      });
    });
    this.playerDeletedSource.next(username);
  }

  gamePublished() {
    this.newGamesCount++;
    this.newGamesCountSource.next(this.newGamesCount);
  }

  gameDeleted(gameId: number) {
    this.gamesCache.forEach(q => {
      q.result = q.result.filter((g: Game) => g.id !== gameId);
    });
    this.gameDeletedSource.next(gameId);
  }

  reviewApproved(review: Review) {
    this.reviewAcceptedSource.next(review);
  }

  reviewDeleted(reviewId: number) {
    this.reviewDeletedSource.next(reviewId);
  }

  private stringifyFilter(filter: Filter): string {
    let result = "";

    const categoriesValues = Object.values(filter.categories);
    const platformsValues = Object.values(filter.platforms);
    const genresValues = Object.values(filter.genres);

    for (let i = 0; i < categoriesValues.length; i++) {
      result += '-' + (categoriesValues[i] ? 1 : 0);
    }
    for (let i = 0; i < platformsValues.length; i++) {
      result += '-' + (platformsValues[i] ? 1 : 0);
    }
    for (let i = 0; i < genresValues.length; i++) {
      result += '-' + (genresValues[i] ? 1 : 0);
    }

    return result;
  }

  private initializePaginationParams() {
    return new PaginationParams(4, OrderType.newest);
  }
}
