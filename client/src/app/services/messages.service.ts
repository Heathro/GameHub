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
  lastConversant = '';
  paginationParams: PaginationParams;
  companions: Player[] = [];
  companionsInitialLoad = false;

  constructor(private http: HttpClient, private playersService: PlayersService) {
    this.paginationParams = this.initializePaginationParams();
  }

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

  getPaginatedMessages() {
    let params = getPaginationHeaders(this.paginationParams);
    return getPaginatedResult<Message[]>(this.baseUrl + 'messages', params, this.http);
  }

  getMessages(username: string) {
    this.lastConversant = username;
    
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
    const messageDto = { recipientUsername: this.lastConversant, content };
    return this.http.post<Message>(this.baseUrl + 'messages', messageDto).pipe(
      map(message => {
        if (!this.companions.find(c => c.userName === this.lastConversant)) {
          this.playersService.getPlayer(message.recipientUsername).subscribe({
            next: player => this.companions.push(player)
          });
        }
        return message;
      })
    );
  }

  deleteMessage(id: number) {
    return this.http.delete(this.baseUrl + 'messages/' + id).pipe(
      map(() => {
        this.messagesCache.set(this.lastConversant, 
          this.messagesCache.get(this.lastConversant).filter((m: Message) => m.id !== id)
        );
      })
    );
  }

  deleteMessages() {
    return this.http.delete(this.baseUrl + 'messages/' + this.lastConversant).pipe(
      map(() => {
        this.messagesCache.set(this.lastConversant, []);
      })
    );
  }

  setLastConversant(username: string) {
    this.lastConversant = username;
  }

  getLastConversant() {
    return this.lastConversant;
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
    this.messagesCache = new Map();
    this.lastConversant = '';
    this.paginationParams = this.initializePaginationParams();
    this.companions.length = 0;
    this.companionsInitialLoad = false;
  }

  private initializePaginationParams() {
    return new PaginationParams(100);
  }
}
