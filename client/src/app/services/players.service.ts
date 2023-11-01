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
  playersCache = new Map();
  paginationParams: PaginationParams;

  constructor(private http: HttpClient) {
    this.paginationParams = new PaginationParams(3, 'az');
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

  getPlayer(username: string) {
    const player = [...this.playersCache.values()]
      .reduce((array, element) => array.concat(element.result), [])
      .find((player: Player) => player.username === username);

    if (player) return of(player);

    return this.http.get<Player>(this.baseUrl + 'users/' + username);
  }

  getPlayers() {
    const response = this.playersCache.get(Object.values(this.paginationParams).join('-'));
    if (response) return of(response);

    let params = this.getPaginationHeaders(this.paginationParams);
    return this.getPaginatedResult<Player[]>(this.baseUrl + 'users/', params).pipe(
      map(response => {
        this.playersCache.set(Object.values(this.paginationParams).join('-'), response);
        return response;
      })
    );
  }

  updatePlayer(player: Player) {
    return this.http.put(this.baseUrl + 'users/edit-profile', player);
    // .pipe(
    //   map(() => {
    //     for (let i = 0; i < this.players.length; i++) {
    //       if (this.players[i].id === player.id) {
    //         //this.players[i] = {...this.players[i], ...player};
    //         //break;
    //         this.players[i].realname = player.realname;
    //         this.players[i].summary = player.summary;
    //         this.players[i].country = player.country;
    //         this.players[i].city = player.city;
    //       }
    //     }
    //   })
    // );
  }

  private getPaginationHeaders(paginationParams: PaginationParams) {
    let params = new HttpParams();
    params = params.append('currentPage', paginationParams.currentPage);
    params = params.append('itemsPerPage', paginationParams.itemsPerPage);
    params = params.append('orderBy', paginationParams.orderBy);
    return params;
  }

  private getPaginatedResult<T>(url: string, params: HttpParams) {
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
}
