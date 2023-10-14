import { HttpClient, HttpHeaders } from '@angular/common/http';
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
    return this.http.get<Title>(this.baseUrl + 'games/' + title, this.getHttpOptions());
  }

  getGames() {
    return this.http.get<Title[]>(this.baseUrl + 'games', this.getHttpOptions());
  }
  
  getHttpOptions() {
    const userString = localStorage.getItem('user');
    if (!userString) return;

    const user = JSON.parse(userString);
    return { headers: new HttpHeaders({ Authorization: 'Bearer ' + user.token }) };
  }
}
