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
  playersCache = new Map();
  paginationParams: PaginationParams;

  constructor(private http: HttpClient) {
    this.paginationParams = new PaginationParams(3, 'az');
  }

  getPlayer(username: string) {
    const player = [...this.playersCache.values()]
      .reduce((array, element) => array.concat(element.result), [])
      .find((player: Player) => player.username === username);

    if (player) return of(player);

    return this.http.get<Player>(this.baseUrl + 'users/' + username);
  }

  getPlayers() {
    const queryString = Object.values(this.paginationParams).join('-');
    
    const response = this.playersCache.get(queryString);
    if (response) return of(response);

    let params = this.getPaginationHeaders(this.paginationParams);
    return this.getPaginatedResult<Player[]>(this.baseUrl + 'users/', params).pipe(
      map(response => {
        this.playersCache.set(queryString, response);
        return response;
      })
    );
  }

  updatePlayer(player: Player) {
    return this.http.put(this.baseUrl + 'users/edit-profile', player);
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
