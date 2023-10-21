import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { map, of } from 'rxjs';

import { environment } from 'src/environments/environment';
import { Game } from '../_models/game';

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

  getGames() {
    if (this.games.length > 0) return of(this.games);

    return this.http.get<Game[]>(this.baseUrl + 'games').pipe(
      map(games => this.games = games)
    );
  }

  updateGame(game: Game, title: string) {
    return this.http.put(this.baseUrl + 'games/' + title + '/edit-game', game).pipe(
      map(() => {
        const index = this.games.indexOf(game);
        this.games[index] = {...this.games[index], ...game};
      })
    );
  }

  deleteScreenshot(game: Game, screenshotId: number) {
    return this.http.delete(this.baseUrl + 'games/' + game.title + '/delete-screenshot/' + screenshotId);
  }
}
