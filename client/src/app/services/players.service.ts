import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Subject, delay, map, of } from 'rxjs';

import { environment } from 'src/environments/environment';
import { PaginationFunctions, PaginationParams } from '../helpers/pagination';
import { FriendRequestType } from '../enums/friendRequestType';
import { FriendStatus } from '../enums/friendStatus';
import { OrderType } from '../enums/orderType';
import { Player } from '../models/player';
import { Game } from '../models/game';
import { Review } from '../models/review';

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

  private playerDeletedSource = new Subject<string>();
  playerDeleted$ = this.playerDeletedSource.asObservable();

  private gamePublishedSource = new Subject<Game>();
  gamePublished$ = this.gamePublishedSource.asObservable();
  private gameDeletedSource = new Subject<number>();
  gameDeleted$ = this.gameDeletedSource.asObservable();

  private reviewAcceptedSource = new Subject<Review>();
  reviewAccepted$ = this.reviewAcceptedSource.asObservable();
  private reviewDeletedSource = new Subject<number>();
  reviewDeleted$ = this.reviewDeletedSource.asObservable();

  private friendshipRequestedSource = new Subject<Player>();
  friendshipRequested$ = this.friendshipRequestedSource.asObservable();
  private friendshipCancelledSource = new Subject<Player>();
  friendshipCancelled$ = this.friendshipCancelledSource.asObservable();
  private friendshipAcceptedSource = new Subject<Player>();
  friendshipAccepted$ = this.friendshipAcceptedSource.asObservable();

  constructor(private http: HttpClient) {
    this.paginationParams = this.initializePaginationParams();
  }

  getPlayers() {
    const queryString = Object.values(this.paginationParams).join('-');
    
    const response = this.playersCache.get(queryString);
    if (response) return of(response).pipe(delay(10));

    let params = PaginationFunctions.getPaginationHeaders(this.paginationParams);
    return PaginationFunctions.getPaginatedResult<Player[]>(this.baseUrl + 'users/list', params, this.http)
      .pipe(
        map(players => {
          this.playersCache.set(queryString, players);
          return players;
        })
      );
  }

  getPlayer(userName: string) {
    const player = [...this.playersCache.values()]
      .reduce((array, element) => array.concat(element.result), [])
      .find((player: Player) => player.userName === userName);

    if (player) return of(player);

    return this.http.get<Player>(this.baseUrl + 'users/' + userName);
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
        this.activeFriends = [];
        this.incomeRequests = [];
        this.outcomeRequests = [];

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

  setPaginationOrder(orderType: OrderType) {
    this.paginationParams.orderType = orderType;
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

  playerDeleted(username: string) {
    this.activeFriends = this.activeFriends.filter(f => f.userName !== username);
    this.incomeRequests = this.incomeRequests.filter(f => f.userName !== username);
    this.outcomeRequests = this.outcomeRequests.filter(f => f.userName !== username);
    this.playersCache.forEach(q => {
      q.result = q.result.filter((p: Player) => p.userName !== username);
    });
    this.playerDeletedSource.next(username);
  }

  gamePublished(game: Game) {
    this.activeFriends.forEach(f => f.publications.unshift(game));
    this.incomeRequests.forEach(f => f.publications.unshift(game));
    this.outcomeRequests.forEach(f => f.publications.unshift(game));
    this.playersCache.forEach(q => {
      q.result.forEach((p: Player) => p.publications.unshift(game));
    });
    this.gamePublishedSource.next(game);
  }

  gameDeleted(gameId: number) {
    this.activeFriends.forEach(f => {
      f.publications = f.publications.filter((p: Game) => p.id !== gameId);
    });
    this.incomeRequests.forEach(f => {
      f.publications = f.publications.filter((p: Game) => p.id !== gameId);
    });
    this.outcomeRequests.forEach(f => {
      f.publications = f.publications.filter((p: Game) => p.id !== gameId);
    });
    this.playersCache.forEach(q => {
      q.result.forEach((p: Player) => {
        p.publications = p.publications.filter((p: Game) => p.id !== gameId);
      });
    });
    this.gameDeletedSource.next(gameId);
  }

  reviewApproved(review: Review) {
    this.reviewAcceptedSource.next(review);
  }

  reviewDeleted(reviewId: number) {
    this.reviewDeletedSource.next(reviewId);
  }

  friendshipRequested(player: Player) {
    this.incomeRequests.push(player);
    this.updateFriendData(player);
    this.friendshipRequestedSource.next(player);
  }

  friendshipCancelled(player: Player) {
    this.activeFriends = this.activeFriends.filter(f => f.userName !== player.userName);
    this.incomeRequests = this.incomeRequests.filter(f => f.userName !== player.userName);
    this.updateFriendData(player);
    this.friendshipCancelledSource.next(player);
  }

  friendshipAccepted(player: Player) {
    this.outcomeRequests = this.outcomeRequests.filter(f => f.userName !== player.userName);
    this.activeFriends.push(player);
    this.updateFriendData(player);
    this.friendshipAcceptedSource.next(player);
  }

  updateFriendData(player: Player) {
    this.playersCache.forEach(q => {
      q.result.forEach((p: Player) => {
        p.status = player.status;
        p.type = player.type;
      });
    });
  }

  private initializePaginationParams() {
    return new PaginationParams(18, OrderType.az);
  }
}