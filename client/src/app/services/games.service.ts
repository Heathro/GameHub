import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { map, of } from 'rxjs';

import { environment } from 'src/environments/environment';
import { PaginatedResult, PaginationParams } from '../models/pagination';
import { Game } from '../models/game';
import { Filter } from '../models/filter';

@Injectable({
  providedIn: 'root'
})
export class GamesService {
  baseUrl = environment.apiUrl;
  games: Game[] = [];

  constructor(private http: HttpClient) { }

  getGame(title: string) {
    const game = this.games.find(p => p.title === title);
    if (game) return of(game);

    return this.http.get<Game>(this.baseUrl + 'games/' + title);
  }
  
  getGames(filter: Filter, paginationParams: PaginationParams) {
    let params = this.getPaginationHeaders(paginationParams);
    return this.getPaginatedResult<Game[]>(this.baseUrl + 'games', filter, params);
  }

  getPaginationHeaders(paginationParams: PaginationParams) {
    let params = new HttpParams();
    params = params.append('currentPage', paginationParams.currentPage);
    params = params.append('itemsPerPage', paginationParams.itemsPerPage);
    params = params.append('orderBy', paginationParams.orderBy);
    return params;
  }
  
  getPaginatedResult<T>(url: string, filter: Filter, params: HttpParams) {
    const paginationResult: PaginatedResult<T> = new PaginatedResult<T>;
    return this.http.post<T>(url, filter, { observe: 'response', params }).pipe(
      map(response => {
        if (response.body) paginationResult.result = response.body;
        const pagination = response.headers.get('Pagination');
        if (pagination) paginationResult.pagination = JSON.parse(pagination);
        return paginationResult;
      })
    );
  }

  updateGame(game: Game, title: string) {
    return this.http.put(this.baseUrl + 'games/' + title + '/edit-game', game).pipe(
      map(() => {
        for (let i = 0; i < this.games.length; i++) {
          if (this.games[i].id === game.id) {
            //this.games[i] = {...this.games[i], ...game};
            //break;
            this.games[i].title = game.title;
            this.games[i].description = game.description;
            this.games[i].platforms.windows = game.platforms.windows;
            this.games[i].platforms.macos = game.platforms.macos;
            this.games[i].platforms.linux = game.platforms.linux;
            this.games[i].genres.action = game.genres.action;
            this.games[i].genres.adventure = game.genres.adventure;
            this.games[i].genres.card = game.genres.card;
            this.games[i].genres.educational = game.genres.educational;
            this.games[i].genres.fighting = game.genres.fighting;
            this.games[i].genres.horror = game.genres.horror;
            this.games[i].genres.platformer = game.genres.platformer;
            this.games[i].genres.puzzle = game.genres.puzzle;
            this.games[i].genres.racing = game.genres.racing;
            this.games[i].genres.rhythm = game.genres.rhythm;
            this.games[i].genres.roleplay = game.genres.roleplay;
            this.games[i].genres.shooter = game.genres.shooter;
            this.games[i].genres.simulation = game.genres.simulation;
            this.games[i].genres.sport = game.genres.sport;
            this.games[i].genres.stealth = game.genres.stealth;
            this.games[i].genres.strategy = game.genres.strategy;
            this.games[i].genres.survival = game.genres.survival;
          }
        }
      })
    );
  }

  deleteScreenshot(game: Game, screenshotId: number) {
    return this.http.delete(this.baseUrl + 'games/' + game.title + '/delete-screenshot/' + screenshotId);
  }
}
