import { HttpClient } from '@angular/common/http';
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
    return this.http.get<Player>(this.baseUrl + 'users/' + username);
  }

  getPlayers() {
    return this.http.get<Player[]>(this.baseUrl + 'users');
  }
}
