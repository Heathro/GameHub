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
import { Poster } from '../models/poster';
import { Screenshot } from '../models/screenshot';

@Injectable({
  providedIn: 'root'
})
export class GamesService {
  baseUrl = environment.apiUrl;
  gamesCache = new Map();
  paginationParams: PaginationParams;
  filter: Filter | undefined;
  user: User | undefined;

  private playerDeletedSource = new Subject<any>();
  playerDeleted$ = this.playerDeletedSource.asObservable();

  private gameUpdatedSource = new Subject<Game>();
  gameUpdated$ = this.gameUpdatedSource.asObservable();
  private gameDeletedSource = new Subject<number>();
  gameDeleted$ = this.gameDeletedSource.asObservable();
  
  private gameLikedSource = new Subject<any>();
  gameLiked$ = this.gameLikedSource.asObservable();
  private gameUnlikedSource = new Subject<any>();
  gameUnliked$ = this.gameUnlikedSource.asObservable();

  private posterUpdatedSource = new Subject<any>();
  posterUpdated$ = this.posterUpdatedSource.asObservable();
  private screenshotAddedSource = new Subject<any>();
  screenshotAdded$ = this.screenshotAddedSource.asObservable();
  private screenshotDeletedSource = new Subject<any>();
  screenshotDeleted$ = this.screenshotDeletedSource.asObservable();

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

        return userId;
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
            if (g.id === game.id) this.updateGameData(g, game);
          })
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
              g.screenshots = g.screenshots.filter(s => s.id !== screenshotId);
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
  
  playerDeleted(userName: string, userId: number) {
    this.gamesCache.forEach(q => {
      q.result = q.result.forEach((g: Game) => {
        g.likes = g.likes.filter(l => l !== userId);
      });
    });
    this.playerDeletedSource.next({userName, userId});
  }

  gamePublished() {
    this.newGamesCount++;
    this.newGamesCountSource.next(this.newGamesCount);
  }

  gameUpdated(game: Game) {
    this.gamesCache.forEach(q => {
      q.result.forEach((g: Game) => {
        if (g.id === game.id) this.updateGameData(g, game);
      });
    });
    this.gameUpdatedSource.next(game);
  }

  gameDeleted(gameId: number) {
    this.gamesCache.forEach(q => {
      q.result = q.result.filter((g: Game) => g.id !== gameId);
    });
    this.gameDeletedSource.next(gameId);
  }

  gameLiked(gameId: number, playerId: number) {
    this.gamesCache.forEach(q => {
      q.result.forEach((g: Game) => {
        if (g.id === gameId && !g.likes.includes(playerId)) g.likes.push(playerId);
      });
    });
    this.gameLikedSource.next({gameId, playerId});
  }
  
  gameUnliked(gameId: number, playerId: number) {
    this.gamesCache.forEach(q => {
      q.result.forEach((g: Game) => {
        if (g.id === gameId) g.likes = g.likes.filter(l => l !== playerId);
      });
    });
    this.gameUnlikedSource.next({gameId, playerId});
  }

  posterUpdated(gameId: number, poster: Poster) {
    this.gamesCache.forEach(q => {
      q.result.forEach((g: Game) => {
        if (g.id === gameId) g.poster = poster;
      });
    });
    this.posterUpdatedSource.next({gameId, poster});
  }

  screenshotAdded(gameId: number, screenshot: Screenshot) {
    this.gamesCache.forEach(q => {
      q.result.forEach((g: Game) => {
        if (g.id === gameId) g.screenshots.push(screenshot);
      });
    });
    this.screenshotAddedSource.next({gameId, screenshot});
  }
  
  screenshotDeleted(gameId: number, screenshotId: number) {
    this.gamesCache.forEach(q => {
      q.result.forEach((g: Game) => {
        if (g.id === gameId) {
          g.screenshots = g.screenshots.filter(s => s.id !== screenshotId);
        }
      });
    });
    this.screenshotDeletedSource.next({gameId, screenshotId});
  }

  reviewApproved(review: Review) {
    this.reviewAcceptedSource.next(review);
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
