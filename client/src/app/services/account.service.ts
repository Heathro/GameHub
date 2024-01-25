import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { BehaviorSubject, map } from 'rxjs';

import { environment } from 'src/environments/environment';
import { PresenceService } from './presence.service';
import { AdminService } from './admin.service';
import { GamesService } from './games.service';
import { MessagesService } from './messages.service';
import { PlayersService } from './players.service';
import { ReviewsService } from './reviews.service';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  baseUrl = environment.apiUrl;
  private currentUserSource = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSource.asObservable();

  constructor(
    private http: HttpClient,
    private presenceService: PresenceService,
    private adminService: AdminService,
    private gamesService: GamesService,
    private messagesService: MessagesService,
    private playerService: PlayersService,
    private reviewsService: ReviewsService,
    private router: Router
  ) {
    this.presenceService.logoutRequired$.subscribe(
      username => this.logoutRequired(username)
    );
  }

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

  logoutRequired(username: string) {
    if (this.currentUserSource.value && username === this.currentUserSource.value.userName) {
      this.logout();
    }
  }

  logout() {
    this.clearPrivateData();
    localStorage.removeItem('user');
    this.currentUserSource.next(null);
    this.presenceService.stopHubConnection();
    this.router.navigateByUrl('/');
  }

  setCurrentUser(user: User) {
    user.roles = [];
    const roles = this.getDecodetToken(user.token).role;
    Array.isArray(roles) ? user.roles = roles : user.roles.push(roles);

    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSource.next(user);
    this.gamesService.setCurrentUser(user);
    this.presenceService.createHubConnection(user);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('user');
  }

  clearPrivateData() {
    this.gamesService.clearPrivateData();
    this.messagesService.clearPrivateData();
    this.playerService.clearPrivateData();
    this.adminService.clearPrivateData();
    this.reviewsService.clearPrivateData();
  }

  private getDecodetToken(token: string) {
    return JSON.parse(atob(token.split('.')[1]));
  }
}
