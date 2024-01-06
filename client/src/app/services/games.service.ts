import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { map, of } from 'rxjs';

import { environment } from 'src/environments/environment';
import { getFilteredPaginatedResult, getPaginationHeaders } from '../helpers/paginationHelper';
import { PaginationParams } from '../helpers/pagination';
import { Game } from '../models/game';
import { Filter } from '../models/filter';
import { User } from '../models/user';
import { OrderType } from '../helpers/orderType';

@Injectable({
  providedIn: 'root'
})
export class GamesService {
  baseUrl = environment.apiUrl;
  gamesCache = new Map();
  paginationParams: PaginationParams;
  filter: Filter | undefined;
  user: User | undefined;

  constructor(private http: HttpClient) {
    this.paginationParams = new PaginationParams(3, OrderType.az);
  }
  
  getGames() {
    const queryString = Object.values(this.paginationParams).join('-') + this.stringifyFilter(this.filter!);
    
    const response = this.gamesCache.get(queryString);
    if (response) {
      const copy = JSON.parse(JSON.stringify(response));
      return of(copy);
    }

    let params = getPaginationHeaders(this.paginationParams);
    return getFilteredPaginatedResult<Game[]>
      (this.baseUrl + 'games/list', params, this.http, this.filter!).pipe(
        map(response => {
          const copy1 = JSON.parse(JSON.stringify(response));
          const copy2 = JSON.parse(JSON.stringify(response));
          this.gamesCache.set(queryString, copy1);
          return copy2;
        })
      );
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
      map(() => {
        this.gamesCache = new Map(); //TODO
      })
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
      map(() => {
        this.gamesCache = new Map(); //TODO
      })
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
    this.paginationParams = new PaginationParams(3, OrderType.az);
    this.filter = undefined;
    this.user = undefined;
  }

  private stringifyFilter(filter: Filter): string {
    let result = "";

    const categoriesKeys = Object.keys(filter.categories);
    const categoriesValues = Object.values(filter.categories);
    const platformsKeys = Object.keys(filter.platforms);
    const platformsValues = Object.values(filter.platforms);
    const genresKeys = Object.keys(filter.genres);
    const genresValues = Object.values(filter.genres);

    for (let i = 0; i < categoriesKeys.length; i++) {
      result += '-' + categoriesKeys[i] + '-' + categoriesValues[i];
    }
    for (let i = 0; i < platformsKeys.length; i++) {
      result += '-' + platformsKeys[i] + '-' + platformsValues[i];
    }
    for (let i = 0; i < genresKeys.length; i++) {
      result += '-' + genresKeys[i] + '-' + genresValues[i];
    }

    return result;
  }
}
