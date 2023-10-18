import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { map, of } from 'rxjs';

import { environment } from 'src/environments/environment';
import { Player } from '../_models/player';

@Injectable({
  providedIn: 'root'
})
export class PlayersService {
  baseUrl = environment.apiUrl;
  players: Player[] = [];

  constructor(private http: HttpClient) { }

  getPlayer(username: string) {
    const player = this.players.find(p => p.username === username);
    if (player) return of(player);

    return this.http.get<Player>(this.baseUrl + 'users/' + username);
  }

  getPlayers() {
    if (this.players.length > 0) return of(this.players);

    return this.http.get<Player[]>(this.baseUrl + 'users').pipe(
      map(players => this.players = players)
    );
  }

  updatePlayer(player: Player) {
    return this.http.put(this.baseUrl + 'users', player).pipe(
      map(() => {
        const index = this.players.indexOf(player);
        this.players[index] = {...this.players[index], ...player};
      })
    );
  }
}
