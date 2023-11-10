import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { map, of } from 'rxjs';

import { environment } from 'src/environments/environment';
import { getPaginatedResult, getPaginationHeaders } from '../helpers/paginationHelper';
import { PaginationParams } from '../models/pagination';
import { Message } from '../models/message';

@Injectable({
  providedIn: 'root'
})
export class MessagesService {
  baseUrl = environment.apiUrl;
  messagesCache = new Map();
  lastConversant = '';
  paginationParams: PaginationParams;

  constructor(private http: HttpClient) {
    this.paginationParams = this.initializePaginationParams();
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
    return this.http.post<Message>(
      this.baseUrl + 'messages', {recipientUsername: this.lastConversant, content});
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
  }

  private initializePaginationParams() {
    return new PaginationParams(100);
  }
}
