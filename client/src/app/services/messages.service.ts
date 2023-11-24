import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { map, of } from 'rxjs';

import { environment } from 'src/environments/environment';
import { getPaginatedResult, getPaginationHeaders } from '../helpers/paginationHelper';
import { PaginationParams } from '../models/pagination';
import { Message } from '../models/message';
import { Player } from '../models/player';
import { PlayersService } from './players.service';

@Injectable({
  providedIn: 'root'
})
export class MessagesService {
  baseUrl = environment.apiUrl;
  messagesCache = new Map();
  lastCompanion = '';
  companions: Player[] = [];
  companionsInitialLoad = false;

  constructor(private http: HttpClient, private playersService: PlayersService) { }

  getCompanions() {
    if (this.companionsInitialLoad) return of(this.companions);
    return this.http.get<Player[]>(this.baseUrl + 'messages/companions').pipe(
      map(companions => {
        this.companionsInitialLoad = true;
        this.companions = companions;
        return companions;
      })
    );
  }

  setLastCompanion(userName: string) {
    this.lastCompanion = userName;
    if (!this.companions.find(c => c.userName === userName)) {
      this.playersService.getPlayer(userName).subscribe({
        next: player => this.companions.unshift(player)
      });
    }
  }

  getLastCompanion() {
    return this.lastCompanion;
  }

  deleteCompanion() {
    return this.http.delete(this.baseUrl + 'messages/' + this.lastCompanion).pipe(
      map(() => {
        this.companions = this.companions.filter(c => c.userName !== this.lastCompanion);
        this.messagesCache.delete(this.lastCompanion);
        this.lastCompanion = this.companions.length > 0 ? this.companions[0].userName : '';
      })
    );
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
    return this.http.delete(this.baseUrl + 'messages/' + id);
  }

  deleteMessages() {
    return this.http.delete(this.baseUrl + 'messages/' + this.lastCompanion);
  }

  clearPrivateData() {
    this.messagesCache = new Map();
    this.lastCompanion = '';
    this.companions.length = 0;
    this.companionsInitialLoad = false;
  }
}
