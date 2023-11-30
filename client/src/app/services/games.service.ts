import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { map, of } from 'rxjs';

import { environment } from 'src/environments/environment';
import { getFilteredPaginatedResult, getPaginationHeaders } from '../helpers/paginationHelper';
import { PaginationParams } from '../models/pagination';
import { Game } from '../models/game';
import { Filter } from '../models/filter';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class GamesService {
  baseUrl = environment.apiUrl;
  storeGamesCache = new Map();
  storePaginationParams: PaginationParams;
  storeFilter: Filter | undefined;
  libraryGamesCache = new Map();
  libraryPaginationParams: PaginationParams;  
  libraryFilter: Filter | undefined;
  user: User | undefined;

  constructor(private http: HttpClient) {
    this.storePaginationParams = new PaginationParams(4, 'az', 'all');
    this.libraryPaginationParams = new PaginationParams(4, 'az', 'bookmarked');
  }

  setCurrentUser(user: User) {
    this.user = user;
  }
  
  getAllGames(filter: Filter) {
    const queryString = Object.values(this.storePaginationParams).join('-') + this.stringifyFilter(filter);

    const response = this.storeGamesCache.get(queryString);
    if (response) return of(response);

    let params = getPaginationHeaders(this.storePaginationParams);

    return getFilteredPaginatedResult<Game[]>(this.baseUrl + 'games/list', params, this.http, filter).pipe(
      map(response => {
        this.storeGamesCache.set(queryString, response);
        return response;
      })
    );
  }

  getBookmarkedGames(filter: Filter) {
    const queryString = Object.values(this.libraryPaginationParams).join('-') + this.stringifyFilter(filter);

    const response = this.libraryGamesCache.get(queryString);
    if (response) return of(response);

    let params = getPaginationHeaders(this.libraryPaginationParams);

    return getFilteredPaginatedResult<Game[]>(this.baseUrl + 'games/list', params, this.http, filter).pipe(
      map(response => {
        this.libraryGamesCache.set(queryString, response);
        return response;
      })
    );
  }

  getGame(title: string) {
    let game = [...this.storeGamesCache.values()]
      .reduce((array, element) => array.concat(element.result), [])
      .find((game: Game) => game.title === title);
    if (game) return of(game);

    game = [...this.libraryGamesCache.values()]
      .reduce((array, element) => array.concat(element.result), [])
      .find((game: Game) => game.title === title);
    if (game) return of(game);

    return this.http.get<Game>(this.baseUrl + 'games/' + title);
  }

  publishGame(publication: any) {
    return this.http.post(this.baseUrl + 'publications/new', publication).pipe(
      map(() => {
        this.storeGamesCache = new Map();
        this.libraryGamesCache = new Map(); //TODO
      })
    );
  }

  isGameOwned(game: Game) {
    if (!this.user) return false; 
    return game.publisher === this.user.userName;
  }

  likeGame(gameId: number) {
    return this.http.post(this.baseUrl + 'likes/' + gameId, {}).pipe(
      map(() => {
        if (!this.user) return;
        const userId = this.user.id;

        this.storeGamesCache.forEach(q => {
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

        this.libraryGamesCache.forEach(q => {
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

        this.storeGamesCache.forEach(q => {
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

        this.libraryGamesCache.forEach(q => {
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
        this.storeGamesCache.forEach(q => {
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
            }
          });
        });

        this.libraryGamesCache.forEach(q => {
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
            }
          });
        });
      })
    );
  }

  deleteGame(game: Game) {
    return this.http.delete(this.baseUrl + 'games/delete-game/' + game.title).pipe(
      map(() => {
        this.storeGamesCache = new Map();
        this.libraryGamesCache = new Map(); //TODO
      })
    );
  }

  deleteScreenshot(game: Game, screenshotId: number) {
    return this.http.delete(this.baseUrl + 'games/delete-screenshot/' + game.title + '/' + screenshotId).pipe(
      map(() => {
        this.storeGamesCache.forEach(q => {
          q.result.forEach((g: Game) => {
            if (g.id === game.id) {
              g.screenshots = g.screenshots.filter(s => s.id === screenshotId);
            }
          });
        });

        this.libraryGamesCache.forEach(q => {
          q.result.forEach((g: Game) => {
            if (g.id === game.id) {
              g.screenshots = g.screenshots.filter(s => s.id === screenshotId);
            }
          });
        });
      })
    );
  }

  setStorePaginationPage(currentPage: number) {
    this.storePaginationParams.currentPage = currentPage;
  }

  setStorePaginationOrder(orderBy: string) {
    this.storePaginationParams.orderBy = orderBy;
  }

  getStorePaginationParams() {
    return this.storePaginationParams;
  }

  setStoreFilter(filter: Filter) {
    this.storeFilter = filter;
  }

  getStoreFilter() {
    return this.storeFilter;
  }

  setLibraryPaginationPage(currentPage: number) {
    this.libraryPaginationParams.currentPage = currentPage;
  }

  setLibraryPaginationOrder(orderBy: string) {
    this.libraryPaginationParams.orderBy = orderBy;
  }

  getLibraryPaginationParams() {
    return this.libraryPaginationParams;
  }

  setLibraryFilter(filter: Filter) {
    this.libraryFilter = filter;
  }

  getLibraryFilter() {
    return this.libraryFilter;
  }

  clearPrivateData() {
    this.storeGamesCache = new Map();
    this.libraryGamesCache = new Map();
    this.storePaginationParams = new PaginationParams(4, 'az', 'all');
    this.libraryPaginationParams = new PaginationParams(4, 'az', 'bookmarked');
    this.storeFilter = undefined;
    this.libraryFilter = undefined;
    this.user = undefined;
  }

  private stringifyFilter(filter: Filter): string {
    let result = "";

    const platformsKeys = Object.keys(filter.platforms);
    const platformsValues = Object.values(filter.platforms);
    const genresKeys = Object.keys(filter.genres);
    const genresValues = Object.values(filter.genres);

    for (let i = 0; i < platformsKeys.length; i++) {
      result += '-' + platformsKeys[i] + '-' + platformsValues[i];
    }
    for (let i = 0; i < genresKeys.length; i++) {
      result += '-' + genresKeys[i] + '-' + genresValues[i];
    }

    return result;
  }
}
