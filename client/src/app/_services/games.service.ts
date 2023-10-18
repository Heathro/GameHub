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
}
