import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { map, of, take } from 'rxjs';

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
  gamesCache = new Map();
  paginationParams: PaginationParams;
  filter: Filter | undefined;
  user: User | undefined;

  constructor(private http: HttpClient) {
    this.paginationParams = this.initializePaginationParams();
  }

  setCurrentUser(user: User) {
    this.user = user;
  }

  getGame(title: string) {
    const game = [...this.gamesCache.values()]
      .reduce((array, element) => array.concat(element.result), [])
      .find((game: Game) => game.title === title);

    if (game) return of(game);

    return this.http.get<Game>(this.baseUrl + 'games/' + title);
  }
  
  getGames(filter: Filter) {
    const queryString = Object.values(this.paginationParams).join('-') + this.stringifyFilter(filter);

    const response = this.gamesCache.get(queryString);
    if (response) return of(response);

    let params = getPaginationHeaders(this.paginationParams);

    return getFilteredPaginatedResult<Game[]>(this.baseUrl + 'games', params, this.http, filter).pipe(
      map(response => {
        this.gamesCache.set(queryString, response);
        return response;
      })
    );
  }

  isGameLiked(game: Game) {
    if (!this.user) return false;
    return game.likes.includes(this.user.id);
  }

  likeGame(gameId: number) {
    return this.http.post<number>(this.baseUrl + 'likes/' + gameId, {}).pipe(
      map(gameId => {
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

  updateGame(game: Game, title: string) {
    return this.http.put(this.baseUrl + 'games/' + title + '/edit-game', game).pipe(
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
            }
          });
        });
      })
    );
  }

  deleteScreenshot(game: Game, screenshotId: number) {
    return this.http.delete(this.baseUrl + 'games/' + game.title + '/delete-screenshot/' + screenshotId);
  }

  setPaginationPage(currentPage: number) {
    this.paginationParams.currentPage = currentPage;
  }

  setPaginationOrder(orderBy: string) {
    this.paginationParams.orderBy = orderBy;
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

  clearPrivateData() {
    this.gamesCache = new Map();
    this.paginationParams = this.initializePaginationParams();
    this.filter = undefined;
    this.user = undefined;
  }

  private initializePaginationParams() {
    return new PaginationParams(4, 'az');
  }

  private stringifyFilter(filters: Filter): string {
    let result = "";

    const platformsKeys = Object.keys(filters.platforms);
    const platformsValues = Object.values(filters.platforms);
    const genresKeys = Object.keys(filters.genres);
    const genresValues = Object.values(filters.genres);

    for (let i = 0; i < platformsKeys.length; i++) {
      result += '-' + platformsKeys[i] + '-' + platformsValues[i];
    }
    for (let i = 0; i < genresKeys.length; i++) {
      result += '-' + genresKeys[i] + '-' + genresValues[i];
    }

    return result;
  }
}
