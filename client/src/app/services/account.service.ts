import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { BehaviorSubject, map } from 'rxjs';

import { environment } from 'src/environments/environment';
import { GamesService } from './games.service';
import { User } from '../models/user';
import { MessagesService } from './messages.service';
import { PlayersService } from './players.service';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  baseUrl = environment.apiUrl;
  private currentUserSource = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSource.asObservable();

  constructor(
    private http: HttpClient, 
    private gamesService: GamesService,
    private messagesService: MessagesService,
    private playerService: PlayersService
  ) { }

  login(model: any) {
    this.clearPrivateData();
    return this.http.post<User>(this.baseUrl + 'account/login', model).pipe(
      map((user) => {
        if (user) this.setCurrentUser(user);
      })
    );
  }

  register(model: any) {
    this.clearPrivateData();
    return this.http.post<User>(this.baseUrl + 'account/register', model).pipe(
      map(user => {
        if (user) this.setCurrentUser(user);
      })
    );
  }

  logout() {
    this.clearPrivateData();
    localStorage.removeItem('user');
    this.currentUserSource.next(null);
  }

  setCurrentUser(user: User) {
    user.roles = [];
    const roles = this.getDecodetToken(user.token).role;
    Array.isArray(roles) ? user.roles = roles : user.roles.push(roles);

    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSource.next(user);
    this.gamesService.setCurrentUser(user);
  }

  private getDecodetToken(token: string) {
    return JSON.parse(atob(token.split('.')[1]));
  }

  clearPrivateData() {
    this.gamesService.clearPrivateData();
    this.messagesService.clearPrivateData();
    this.playerService.clearPrivateData();
  }
}
