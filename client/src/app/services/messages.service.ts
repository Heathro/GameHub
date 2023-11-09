import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from 'src/environments/environment';
import { getPaginatedResult, getPaginationHeaders } from '../helpers/paginationHelper';
import { PaginationParams } from '../models/pagination';
import { Message } from '../models/message';

@Injectable({
  providedIn: 'root'
})
export class MessagesService {
  baseUrl = environment.apiUrl;
  paginationParams: PaginationParams;

  constructor(private http: HttpClient) {
    this.paginationParams = new PaginationParams(100);
  }

  getMessages() {
    let params = getPaginationHeaders(this.paginationParams);
    return getPaginatedResult<Message[]>(this.baseUrl + 'messages', params, this.http);
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
}
