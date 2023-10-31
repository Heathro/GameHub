import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { map, of } from 'rxjs';

import { environment } from 'src/environments/environment';
import { PaginatedResult, PaginationParams } from '../models/pagination';
import { Player } from '../models/player';

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

  getPlayers(paginationParams: PaginationParams) {
    let params = this.getPaginationHeaders(paginationParams);
    return this.getPaginatedResult<Player[]>(this.baseUrl + 'users/', params);
  }

  private getPaginationHeaders(paginationParams: PaginationParams) {
    let params = new HttpParams();
    params = params.append('currentPage', paginationParams.currentPage);
    params = params.append('itemsPerPage', paginationParams.itemsPerPage);
    params = params.append('orderBy', paginationParams.orderBy);
    return params;
  }

  getPaginatedResult<T>(url: string, params: HttpParams) {
    const paginationResult: PaginatedResult<T> = new PaginatedResult<T>;
    return this.http.get<T>(url, { observe: 'response', params }).pipe(
      map(response => {
        if (response.body) paginationResult.result = response.body;
        const pagination = response.headers.get('Pagination');
        if (pagination) paginationResult.pagination = JSON.parse(pagination);
        return paginationResult;
      })
    );
  }

  updatePlayer(player: Player) {
    return this.http.put(this.baseUrl + 'users/edit-profile', player).pipe(
      map(() => {
        for (let i = 0; i < this.players.length; i++) {
          if (this.players[i].id === player.id) {
            //this.players[i] = {...this.players[i], ...player};
            //break;
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
