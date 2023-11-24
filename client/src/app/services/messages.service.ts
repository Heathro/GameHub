import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { EMPTY, map, of } from 'rxjs';

import { environment } from 'src/environments/environment';
import { getPaginatedResult, getPaginationHeaders } from '../helpers/paginationHelper';
import { PaginationParams } from '../models/pagination';
import { Message } from '../models/message';
import { Player } from '../models/player';
import { PlayersService } from './players.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class MessagesService {
  baseUrl = environment.apiUrl;
  messagesCache = new Map();
  lastCompanion = '';
  companions: Player[] = [];
  companionsLoaded = false;

  constructor(
    private http: HttpClient, 
    private playersService: PlayersService,
    private router: Router
  ) { }

  getCompanions() {
    if (this.companionsLoaded) return of(this.companions);
    return this.http.get<Player[]>(this.baseUrl + 'messages/companions').pipe(
      map(companions => {
        this.companionsLoaded = true;
        this.companions = companions;
        return companions;
      })
    );
  }
  
  getLastCompanion() {
    return this.lastCompanion;
  }

  startChat(player: Player) {
    this.lastCompanion = player.userName;
    if (this.companionsLoaded) {
      if (!this.companions.find(c => c.userName === player.userName)) {
        this.companions.unshift(player);
      }
      return of(void 0);
    }
    else {
      return this.http.get<Player[]>(this.baseUrl + 'messages/companions').pipe(
        map(companions => {
          this.companionsLoaded = true;
          this.companions = companions;
          if (!this.companions.find(c => c.userName === player.userName)) {
            this.companions.unshift(player);
          }
        })
      );
    }
  }

  deleteCompanion(deleteMessages: boolean) {
    if (deleteMessages) {
      return this.http.delete(this.baseUrl + 'messages/delete-messages/' + this.lastCompanion).pipe(
        map(() => {
          this.companions = this.companions.filter(c => c.userName !== this.lastCompanion);
          this.messagesCache.delete(this.lastCompanion);
          this.lastCompanion = this.companions.length > 0 ? this.companions[0].userName : '';
        })
      );
    }
    else {
      this.companions = this.companions.filter(c => c.userName !== this.lastCompanion);
      this.messagesCache.delete(this.lastCompanion);
      this.lastCompanion = this.companions.length > 0 ? this.companions[0].userName : '';
      return of(void 0);
    }
  }

  getMessages(username: string) {
    this.lastCompanion = username;

    const response = this.messagesCache.get(username);
    if (response) return of(response);

    return this.http.get<Message[]>(this.baseUrl + 'messages/thread/' + username).pipe(
      map(response => {
        this.messagesCache.set(username, response);
        return response;
      })
    );
  }

  sendMessage(content: string) {
    const messageDto = { recipientUsername: this.lastCompanion, content };
    return this.http.post<Message>(this.baseUrl + 'messages/new', messageDto);
  }

  deleteMessage(id: number) {
    return this.http.delete(this.baseUrl + 'messages/delete-message/' + id);
  }

  deleteMessages() {
    return this.http.delete(this.baseUrl + 'messages/delete-messages/' + this.lastCompanion);
  }

  clearPrivateData() {
    this.messagesCache = new Map();
    this.lastCompanion = '';
    this.companions.length = 0;
    this.companionsLoaded = false;
  }
}
