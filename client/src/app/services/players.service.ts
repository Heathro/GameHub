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
import { Poster } from '../models/poster';
import { Avatar } from '../models/avatar';

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

  private playerUpdatedSource = new Subject<Player>();
  playerUpdated$ = this.playerUpdatedSource.asObservable();
  private playerDeletedSource = new Subject<any>();
  playerDeleted$ = this.playerDeletedSource.asObservable();
  private avatarUpdatedSource = new Subject<any>();
  avatarUpdated$ = this.avatarUpdatedSource.asObservable();

  private gamePublishedSource = new Subject<Game>();
  gamePublished$ = this.gamePublishedSource.asObservable();
  private gameUpdatedSource = new Subject<Game>();
  gameUpdated$ = this.gameUpdatedSource.asObservable();
  private gameDeletedSource = new Subject<number>();
  gameDeleted$ = this.gameDeletedSource.asObservable();
  
  private posterUpdatedSource = new Subject<any>();
  posterUpdated$ = this.posterUpdatedSource.asObservable();

  private reviewApprovedSource = new Subject<Review>();
  reviewApproved$ = this.reviewApprovedSource.asObservable();
  private reviewDeletedSource = new Subject<number>();
  reviewDeleted$ = this.reviewDeletedSource.asObservable();

  private friendshipRequestedSource = new Subject<Player>();
  friendshipRequested$ = this.friendshipRequestedSource.asObservable();
  private friendshipCancelledSource = new Subject<Player>();
  friendshipCancelled$ = this.friendshipCancelledSource.asObservable();
  private friendshipAcceptedSource = new Subject<Player>();
  friendshipAccepted$ = this.friendshipAcceptedSource.asObservable();
  
  private newPlayersCountSource = new Subject<number>();
  newPlayersCount$ = this.newPlayersCountSource.asObservable();
  newPlayersCount = 0;
  private refreshPlayersSource = new Subject();
  refreshPlayers$ = this.refreshPlayersSource.asObservable();

  constructor(private http: HttpClient) {
    this.paginationParams = this.initializePaginationParams();
    this.newPlayersCountSource.next(0);
  }

  getPlayers() {
    const queryString = Object.values(this.paginationParams).join('-');
    
    const response = this.playersCache.get(queryString);
    if (response) return of(response).pipe(delay(10));

    let params = PaginationFunctions.getPaginationHeaders(this.paginationParams);
    return PaginationFunctions.getPaginatedResult<Player[]>(this.baseUrl + 'users/list', params, this.http)
      .pipe(
        map(players => {
          this.newPlayersCount = 0;
          this.newPlayersCountSource.next(0);
          this.playersCache.set(queryString, players);
          return players;
        })
      );
  }

  refreshPlayers() {
    if (this.newPlayersCount > 0) {
      this.playersCache = new Map();
      this.refreshPlayersSource.next(null);
    }
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
        this.updateFriendsData(friend);
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
        this.updateFriendsData(friend);
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
        this.updateFriendsData(friend);
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
        this.updateFriendsData(friend);
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

  playerRegisted() {
    this.newPlayersCount++;
    this.newPlayersCountSource.next(this.newPlayersCount);
  }
  
  userUpdated(player: Player) {
    this.activeFriends.forEach(f => {
      if (f.id === player.id) this.updatePlayerData(f, player);
    });
    this.incomeRequests.forEach(f => {
      if (f.id === player.id) this.updatePlayerData(f, player);
    });
    this.outcomeRequests.forEach(f => {
      if (f.id === player.id) this.updatePlayerData(f, player);
    });
    this.playersCache.forEach(q => {
      q.result.forEach((p: Player) => {
        if (p.id === player.id) this.updatePlayerData(p, player);
      });
    });
    this.playerUpdatedSource.next(player);
  }

  playerDeleted(userName: string, userId: number) {
    this.activeFriends = this.activeFriends.filter(f => f.id !== userId);
    this.incomeRequests = this.incomeRequests.filter(f => f.id !== userId);
    this.outcomeRequests = this.outcomeRequests.filter(f => f.id !== userId);
    this.playersCache.forEach(q => {
      q.result = q.result.filter((p: Player) => p.id !== userId);
    });
    this.playerDeletedSource.next({userName, userId});
  }
  
  avatarUpdated(userId: number, avatar: Avatar) {
    this.activeFriends.forEach(f => {
      if (f.id === userId) f.avatar = avatar;
    });
    this.incomeRequests.forEach(f => {
      if (f.id === userId) f.avatar = avatar;
    });
    this.outcomeRequests.forEach(f => {
      if (f.id === userId) f.avatar = avatar;
    });
    this.playersCache.forEach(q => {
      q.result.forEach((p: Player) => {
        if (p.id === userId) p.avatar = avatar;
      });
    });
    this.avatarUpdatedSource.next({userId, avatar});
  }

  gamePublished(game: Game) {
    this.playersCache.forEach(q => {
      q.result.forEach((p: Player) => p.publications.unshift(game));
    });
    this.gamePublishedSource.next(game);
  }

  gameUpdated(game: Game) {
    this.playersCache.forEach(q => {
      q.result.forEach((p: Player) => {
        p.publications.forEach(g => {
          if (g.id === game.id) this.updateGameData(g, game);
        });
      });
    });      

    this.gameUpdatedSource.next(game);
  }

  posterUpdated(gameId: number, poster: Poster) {
    this.playersCache.forEach(q => {
      q.result.forEach((p: Player) => {
        p.publications.forEach(g => {
          if (g.id === gameId) g.poster = poster;
        });
      });
    });
    this.posterUpdatedSource.next({gameId, poster});
  }

  gameDeleted(gameId: number) {
    this.playersCache.forEach(q => {
      q.result.forEach((p: Player) => {
        p.publications = p.publications.filter((p: Game) => p.id !== gameId);
      });
    });
    this.gameDeletedSource.next(gameId);
  }

  reviewApproved(review: Review) {
    this.reviewApprovedSource.next(review);
  }

  reviewDeleted(reviewId: number) {
    this.reviewDeletedSource.next(reviewId);
  }

  friendshipRequested(player: Player) {
    this.incomeRequests.push(player);
    this.updateFriendsData(player);
    this.friendshipRequestedSource.next(player);
  }

  friendshipCancelled(player: Player) {
    this.activeFriends = this.activeFriends.filter(f => f.userName !== player.userName);
    this.incomeRequests = this.incomeRequests.filter(f => f.userName !== player.userName);
    this.updateFriendsData(player);
    this.friendshipCancelledSource.next(player);
  }

  friendshipAccepted(player: Player) {
    this.outcomeRequests = this.outcomeRequests.filter(f => f.userName !== player.userName);
    this.activeFriends.push(player);
    this.updateFriendsData(player);
    this.friendshipAcceptedSource.next(player);
  }

  updatePlayerData(currentPlayer: Player, updatedPlayer: Player) {
    currentPlayer.realname = updatedPlayer.realname;
    currentPlayer.summary = updatedPlayer.summary;
    currentPlayer.country = updatedPlayer.country;
    currentPlayer.city = updatedPlayer.city;
  }

  updateGameData(currentGame: Game, updatedGame: Game) {
    currentGame.title = updatedGame.title;
    currentGame.description = updatedGame.description;
    currentGame.platforms.windows = updatedGame.platforms.windows;
    currentGame.platforms.macos = updatedGame.platforms.macos;
    currentGame.platforms.linux = updatedGame.platforms.linux;
    currentGame.genres.action = updatedGame.genres.action;
    currentGame.genres.adventure = updatedGame.genres.adventure;
    currentGame.genres.card = updatedGame.genres.card;
    currentGame.genres.educational = updatedGame.genres.educational;
    currentGame.genres.fighting = updatedGame.genres.fighting;
    currentGame.genres.horror = updatedGame.genres.horror;
    currentGame.genres.platformer = updatedGame.genres.platformer;
    currentGame.genres.puzzle = updatedGame.genres.puzzle;
    currentGame.genres.racing = updatedGame.genres.racing;
    currentGame.genres.rhythm = updatedGame.genres.rhythm;
    currentGame.genres.roleplay = updatedGame.genres.roleplay;
    currentGame.genres.shooter = updatedGame.genres.shooter;
    currentGame.genres.simulation = updatedGame.genres.simulation;
    currentGame.genres.sport = updatedGame.genres.sport;
    currentGame.genres.stealth = updatedGame.genres.stealth;
    currentGame.genres.strategy = updatedGame.genres.strategy;
    currentGame.genres.survival = updatedGame.genres.survival;
    currentGame.video = updatedGame.video;
  }

  private updateFriendsData(player: Player) {
    this.playersCache.forEach(q => {
      q.result.forEach((p: Player) => {
        if (p.id === player.id) {
          p.status = player.status;
          p.type = player.type;
        }
      });
    });
  }

  private initializePaginationParams() {
    return new PaginationParams(18, OrderType.az);
  }
}