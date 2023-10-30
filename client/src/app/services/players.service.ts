import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { map, of } from 'rxjs';

import { environment } from 'src/environments/environment';
import { PaginatedResult } from '../models/pagination';
import { Player } from '../models/player';

@Injectable({
  providedIn: 'root'
})
export class PlayersService {
  baseUrl = environment.apiUrl;
  players: Player[] = [];
  paginationResult: PaginatedResult<Player[]> = new PaginatedResult<Player[]>;

  constructor(private http: HttpClient) { }

  getPlayer(username: string) {
    const player = this.players.find(p => p.username === username);
    if (player) return of(player);

    return this.http.get<Player>(this.baseUrl + 'users/' + username);
  }

  getPlayers(currentPage?: number, itemsPerPage?: number) {
    let params = new HttpParams();

    if (currentPage && itemsPerPage) {
      params = params.append('currentPage', currentPage);
      params = params.append('itemsPerPage', itemsPerPage);
    }

    return this.http.get<Player[]>(this.baseUrl + 'users', {observe: 'response', params}).pipe(
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

  updatePlayer(player: Player) {
    return this.http.put(this.baseUrl + 'users/edit-profile', player).pipe(
      map(() => {
        for (let i = 0; i < this.players.length; i++) {
          if (this.players[i].id === player.id) {
            this.players[i].realname = player.realname;
            this.players[i].summary = player.summary;
            this.players[i].country = player.country;
            this.players[i].city = player.city;
          }
        }
      })
    );
  }
}
