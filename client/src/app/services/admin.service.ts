import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { map, of } from 'rxjs';

import { environment } from 'src/environments/environment';
import { getPaginatedResult, getPaginationHeaders } from '../helpers/paginationHelper';
import { PaginationParams } from '../models/pagination';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  baseUrl = environment.apiUrl;
  usersCache = new Map();
  paginationParams: PaginationParams;

  constructor(private http: HttpClient) {
    this.paginationParams = this.initializePaginationParams();
  }

  getUsersWithRoles() {
    const queryString = Object.values(this.paginationParams).join('-');
    
    const users = this.usersCache.get(queryString);
    if (users) return of(users);

    let params = getPaginationHeaders(this.paginationParams);
    return getPaginatedResult<User[]>(this.baseUrl + 'admin/users-with-roles', params, this.http).pipe(
      map(users => {
        this.usersCache.set(queryString, users);
        return users;
      })
    );
  }

  editRoles(userName: string, roles: string) {
    return this.http.post<string[]>(this.baseUrl + 'admin/edit-roles/' + userName + '?roles=' + roles, {});
  }

  deleteUser(userName: string) {
    return this.http.delete(this.baseUrl + 'admin/delete-user/' + userName);
  }

  getGamesForModeration() {

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

  clearPrivateData() {
    this.usersCache = new Map();
    this.paginationParams = this.initializePaginationParams();
  }

  private initializePaginationParams() {
    return new PaginationParams(7, 'az');
  }
}
