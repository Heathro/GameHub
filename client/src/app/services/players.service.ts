import { HttpClient, HttpParams } from '@angular/common/http';
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
  activeFriends: Friend[] = [];
  activeFriendsInitialLoad = false;
  incomeRequests: Friend[] = [];
  incomeRequestsInitialLoad = false;
  outcomeRequests: Friend[] = [];
  outcomeRequestsInitialLoad = false;
  playersCache = new Map();
  paginationParams: PaginationParams;

  constructor(private http: HttpClient) {
    this.paginationParams = this.initializePaginationParams();
  }

  getPlayer(username: string) {
    const player = [...this.playersCache.values()]
      .reduce((array, element) => array.concat(element.result), [])
      .find((player: Player) => player.userName === username);

    if (player) return of(player);

    return this.http.get<Player>(this.baseUrl + 'users/' + username);
  }

  getPlayers() {
    const queryString = Object.values(this.paginationParams).join('-');
    
    const response = this.playersCache.get(queryString);
    if (response) return of(response);

    let params = getPaginationHeaders(this.paginationParams);

    return getPaginatedResult<Player[]>(this.baseUrl + 'users/', params, this.http).pipe(
      map(players => {
        this.playersCache.set(queryString, players);
        return players;
      })
    );
  }

  isIncomeRequest(userName: string) {
    return this.incomeRequests.find((friend: Friend) => friend.player.userName === userName);
  }

  addFriend(userName: string) {
    return this.http.post<Friend>(this.baseUrl + 'friends/add-friend/' + userName, {}).pipe(
      map(friend => {
        this.outcomeRequests.push(friend);
        return friend;
      })
    );
  }

  deleteFriend(userName: string) {
    return this.http.post<Friend>(this.baseUrl + 'friends/add-friend/' + userName, {}).pipe(
      map(friend => {
        this.activeFriends = this.activeFriends.filter(f => f.player.userName !== userName);
        return friend;
      })
    );
  }

  acceptRequest(userName: string) {
    this.incomeRequests = this.incomeRequests.filter(f => f.player.userName !== userName);
    return this.http.post<Friend>(
      this.baseUrl + 'friends/update-status/' + userName + '/' + FriendStatus.active, {}
    ).pipe(
      map(friend => {
        this.activeFriends.push(friend);
        return friend;
      })
    );
  }

  cancelRequest(userName: string) {
    return this.http.post<Friend>(this.baseUrl + 'friends/add-friend/' + userName, {}).pipe(
      map(friend => {
        this.outcomeRequests = this.outcomeRequests.filter(f => f.player.userName !== userName);
        return friend;
      }
    ));
  }

  getFriend(userName: string) {
    const activeFriend = this.activeFriends.find((friend: Friend) => friend.player.userName === userName);
    if (activeFriend) return of(activeFriend);

    const incomeRequest = this.incomeRequests.find((friend: Friend) => friend.player.userName === userName);
    if (incomeRequest) return of(incomeRequest);

    const outcomeRequest = this.outcomeRequests.find((friend: Friend) => friend.player.userName === userName);
    if (outcomeRequest) return of(outcomeRequest);

    const player: Player = [...this.playersCache.values()]
      .reduce((array, element) => array.concat(element.result), [])
      .find((player: Player) => player.userName === userName);

    if (player) return of({
      player: player,
      status: FriendStatus.none
    });
    
    return this.http.get<Friend>(this.baseUrl + 'friends/candidate/' + userName).pipe(
      map(friend => {
        return friend;
      })
    );
  }

  getFriends(status: FriendStatus, type: FriendRequestType) {
    if (status === FriendStatus.active && this.activeFriendsInitialLoad) {
      return of(this.activeFriends);
    }
    else if (status === FriendStatus.pending) {
      if (type === FriendRequestType.income && this.incomeRequestsInitialLoad) {
        return of(this.incomeRequests);
      }
      else if (type === FriendRequestType.outcome && this.outcomeRequestsInitialLoad) {
        return of(this.outcomeRequests);
      }
    }

    return this.http.get<Friend[]>(this.baseUrl + 'friends/list/' + status + '/' + type).pipe(
      map(friends => {
        if (status === FriendStatus.active) {
          this.activeFriendsInitialLoad = true;
          this.activeFriends = friends;
        }
        else if (status === FriendStatus.pending) {
          if (type == FriendRequestType.income) {
            this.incomeRequestsInitialLoad = true;
            this.incomeRequests = friends;
          }
          else if (type === FriendRequestType.outcome) {
            this.outcomeRequestsInitialLoad = true;
            this.outcomeRequests = friends;
          }
        }
        return friends;
      })
    );
  }

  updatePlayer(player: Player) {
    return this.http.put(this.baseUrl + 'users/edit-profile', player);
  }

  deletePlayer() {
    return this.http.delete(this.baseUrl + 'users/delete-user');
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
    this.activeFriends.length = 0;
    this.incomeRequests.length = 0;
    this.outcomeRequests.length = 0;
    this.playersCache = new Map();
    this.paginationParams = this.initializePaginationParams();
  }

  private initializePaginationParams() {
    return new PaginationParams(3, 'az');
  }
}
