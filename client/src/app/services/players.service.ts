import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { map, of } from 'rxjs';

import { environment } from 'src/environments/environment';
import { getPaginatedResult, getPaginationHeaders } from '../helpers/paginationHelper';
import { PaginationParams } from '../models/pagination';
import { Player } from '../models/player';
import { Friend } from '../models/friend';
import { FriendStatus } from '../helpers/friendStatus';
import { FriendRequestType } from '../helpers/friendRequestType';

@Injectable({
  providedIn: 'root'
})
export class PlayersService {
  baseUrl = environment.apiUrl;
  playersCache = new Map();
  activeFriends: Player[] = [];
  incomeRequests: Player[] = [];
  outcomeRequests: Player[] = [];
  friendsLoaded = false;
  paginationParams: PaginationParams;

  constructor(private http: HttpClient) {
    this.paginationParams = this.initializePaginationParams();
  }

  getPlayer(userName: string) {
    const player = [...this.playersCache.values()]
      .reduce((array, element) => array.concat(element.result), [])
      .find((player: Player) => player.userName === userName);

    if (player) return of(player);

    return this.http.get<Player>(this.baseUrl + 'friends/player/' + userName);
  }

  getPlayers() {
    const queryString = Object.values(this.paginationParams).join('-');
    
    const players = this.playersCache.get(queryString);
    if (players) return of(players);

    let params = getPaginationHeaders(this.paginationParams);
    return getPaginatedResult<Friend[]>(this.baseUrl + 'friends/players', params, this.http).pipe(
      map(players => {
        this.playersCache.set(queryString, players);
        return players;
      })
    );
  }

  updatePlayer(player: Player) {
    return this.http.put(this.baseUrl + 'users/edit-profile', player);
  }

  deletePlayer() {
    return this.http.delete(this.baseUrl + 'users/delete-user');
  }

  getFriends() {
    if (this.friendsLoaded) return of(
      {
        activeFriends: this.activeFriends,
        incomeRequests: this.incomeRequests,
        outcomeRequests: this.outcomeRequests
      }
    );
 
    return this.http.get<Player[]>(this.baseUrl + 'friends/list').pipe(
      map(friends => {        
        friends.forEach(f => {
          if (f.status === FriendStatus.active) {
            this.activeFriends.push(f);
          }
          else if (f.status === FriendStatus.pending) {
            if (f.type === FriendRequestType.income) {
              this.incomeRequests.push(f);
            }
            else if (f.type === FriendRequestType.outcome) {
              this.outcomeRequests.push(f);
            }
          }
        });
        this.friendsLoaded = true;
        return {
          activeFriends: this.activeFriends,
          incomeRequests: this.incomeRequests,
          outcomeRequests: this.outcomeRequests
        }
      })
    );
  }

  addFriend(userName: string) {
    return this.http.post<Player>(this.baseUrl + 'friends/add-friend/' + userName, {}).pipe(
      map(friend => {
        if (this.friendsLoaded) {
          this.outcomeRequests.push(friend);
        } 
        return friend;
      })
    );
  }

  deleteFriend(userName: string) {
    return this.http.delete<Player>(this.baseUrl + 'friends/delete-friend/' + userName).pipe(
      map(friend => {
        if (this.friendsLoaded) {
          this.activeFriends = this.activeFriends.filter((f: Player) => f.userName !== userName);
        }
        return friend;
      })
    );
  }

  acceptRequest(userName: string) {
    return this.http.post<Player>(
      this.baseUrl + 'friends/update-status/' + userName + '/' + FriendStatus.active, {}
    ).pipe(
      map(friend => {
        if (this.friendsLoaded) {
          this.incomeRequests = this.incomeRequests.filter((f: Player) => f.userName !== userName);
          this.activeFriends.push(friend);
        }
        return friend;
      })
    );
  }

  cancelRequest(userName: string) {
    return this.http.delete<Player>(this.baseUrl + 'friends/delete-friend/' + userName).pipe(
      map(friend => {
        if (this.friendsLoaded) {
          this.outcomeRequests = this.outcomeRequests.filter((f: Player) => f.userName !== userName)
        }
        return friend;
      }
    ));
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
    this.playersCache = new Map();
    this.activeFriends = [];
    this.incomeRequests = [];
    this.outcomeRequests = [];
    this.friendsLoaded = false;
    this.paginationParams = this.initializePaginationParams();
  }

  private initializePaginationParams() {
    return new PaginationParams(3, 'az');
  }
}
