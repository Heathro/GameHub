import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from 'src/environments/environment';
import { Title } from '../_models/title';

@Injectable({
  providedIn: 'root'
})
export class GamesService {
  baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getGame(title: string) {
    return this.http.get<Title>(this.baseUrl + 'games/' + title);
  }

  getGames() {
    return this.http.get<Title[]>(this.baseUrl + 'games');
  }
}
