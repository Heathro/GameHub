import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { map, of } from 'rxjs';

import { environment } from 'src/environments/environment';
import { Game } from '../_models/game';
import { PaginatedResult } from '../_models/pagination';

@Injectable({
  providedIn: 'root'
})
export class GamesService {
  baseUrl = environment.apiUrl;
  games: Game[] = [];
  paginationResult: PaginatedResult<Game[]> = new PaginatedResult<Game[]>;

  constructor(private http: HttpClient) { }

  getGame(title: string) {
    const game = this.games.find(p => p.title === title);
    if (game) return of(game);

    return this.http.get<Game>(this.baseUrl + 'games/' + title);
  }
  
  getGames(page?: number, itemsPerPage?: number) {
    let params = new HttpParams();

    if (page && itemsPerPage) {
      params = params.append('pageNumber', page);
      params = params.append('pageSize', itemsPerPage);
    }

    return this.http.get<Game[]>(this.baseUrl + 'games', {observe: 'response', params}).pipe(
      map(response => {
        if (response.body) {
          this.paginationResult.result = response.body;
        }
        const pagination = response.headers.get('Pagination');
        if (pagination) {
          this.paginationResult.pagination = JSON.parse(pagination);
        }
        return this.paginationResult;
      })
    );
  }

  updateGame(game: Game, title: string) {
    return this.http.put(this.baseUrl + 'games/' + title + '/edit-game', game).pipe(
      map(() => {
        for (let i = 0; i < this.games.length; i++) {
          if (this.games[i].id === game.id) {
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
