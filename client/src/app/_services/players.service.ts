import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from 'src/environments/environment';
import { Player } from '../_models/player';

@Injectable({
  providedIn: 'root'
})
export class PlayersService {
  baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getPlayer(username: string) {
    return this.http.get<Player>(this.baseUrl + 'users/' + username, this.getHttpOptions());
  }

  getPlayers() {
    return this.http.get<Player[]>(this.baseUrl + 'users', this.getHttpOptions());
  }

  getHttpOptions() {
    const userString = localStorage.getItem('user');
    if (!userString) return;

    const user = JSON.parse(userString);
    return { headers: new HttpHeaders({ Authorization: 'Bearer ' + user.token }) };
  }
}
