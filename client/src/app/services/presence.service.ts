import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { BehaviorSubject, Subject, take } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { environment } from 'src/environments/environment';
import { MessagesService } from './messages.service';
import { Player } from '../models/player';
import { User } from '../models/user';
import { Review, ReviewForModeration } from '../models/review';
import { FriendStatus } from '../enums/friendStatus';
import { FriendRequestType } from '../enums/friendRequestType';
import { Game } from '../models/game';
import { PlayersService } from './players.service';
import { ReviewsService } from './reviews.service';
import { GamesService } from './games.service';
import { AdminService } from './admin.service';

@Injectable({
  providedIn: 'root'
})
export class PresenceService {
  hubUrl = environment.hubUrl;
  private hubConnection?: HubConnection;
  private onlineUsersSource = new BehaviorSubject<string[]>([]);
  onlineUsers$ = this.onlineUsersSource.asObservable();
  private logoutRequiredSource = new Subject<string>();
  logoutRequired$ = this.logoutRequiredSource.asObservable();

  constructor(
    private adminService: AdminService,
    private messagesService: MessagesService,
    private playersService: PlayersService,
    private reviewsService: ReviewsService,
    private gamesService: GamesService,
    private toastr: ToastrService,
    private router: Router,
  ) { }

  createHubConnection(user: User) {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(this.hubUrl + 'presence', {accessTokenFactory: () => user.token})
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start().catch(error => console.log(error));

    this.hubConnection.on('UserIsOnline', ({username, friends}) => {
      this.onlineUsers$.pipe(take(1)).subscribe({
        next: usernames => {
          this.onlineUsersSource.next([...usernames, username]);

          if ((friends as number[]).includes(user.id)) {
            this.toastr.success(username + ' online').onTap.pipe(take(1)).subscribe({
              next: () => this.router.navigateByUrl('/players/' + username)
            });
          }
        }
      });
    });

    this.hubConnection.on('UserIsOffline', username => {
      this.onlineUsers$.pipe(take(1)).subscribe({
        next: usernames => {
          this.onlineUsersSource.next(usernames.filter(u => u !== username));
        }
      });
    });
    
    this.hubConnection.on('GetOnlineUsers', usernames => {
      this.onlineUsersSource.next(usernames);
    });

    this.hubConnection.on('IncomingMessage', ({sender, content}) => {
      if (this.router.url !== '/messenger') {
        const player = sender as Player;
        const text = content as string;
        const message = text.length > 13 ? text.substring(0, 13) + '...' : text;

        this.toastr.info('"' + message + '"', player.userName + ':').onTap.pipe(take(1)).subscribe({
          next: () => {
            this.messagesService.startChat(player).subscribe({
              next: () => this.router.navigateByUrl('/messenger')
            });
          }
        });
      }
    });

    this.hubConnection.on('UserRegisted', (player: Player) => {
      this.toastr.success(player.userName + ' registed');
    }); // TODO

    this.hubConnection.on('UserUpdated', (player: Player) => {
      this.toastr.success(player.userName + ' updated');
    }); // TODO

    this.hubConnection.on('AvatarUpdated', ({userId, avatar}) => {
      this.toastr.success(userId + ' avatar ' + avatar.url);
    }); // TODO

    this.hubConnection.on('UserDeleted', username => {
      if (username === user.userName) {
        this.toastr.error('Your account was deleted');
        this.logoutRequiredSource.next(username);
      }
      else {
        this.adminService.playerDeleted(username);
        this.playersService.playerDeleted(username);
        this.messagesService.playerDeleted(username);
        this.reviewsService.playerDeleted(username);
        this.gamesService.playerDeleted(username);
      }
    });

    this.hubConnection.on('FriendshipRequested', (player: Player) => {
      this.toastr.warning(player.userName + ' sent a request').onTap.pipe(take(1)).subscribe({
        next: () => this.router.navigateByUrl('/players/' + player.userName)
      });
      this.playersService.friendshipRequested(player);
    });

    this.hubConnection.on('FriendshipCancelled', (player: Player) => {
      this.playersService.friendshipCancelled(player);
    });

    this.hubConnection.on('FriendshipAccepted', (player: Player) => {
      this.toastr.success(player.userName + ' accepted the request').onTap.pipe(take(1)).subscribe({
        next: () => this.router.navigateByUrl('/players/' + player.userName)
      });
      this.playersService.friendshipAccepted(player);
    });

    this.hubConnection.on('GamePublished', (game: Game) => {
      this.adminService.gamePublished();
      this.playersService.gamePublished(game);
      this.gamesService.gamePublished();
    });

    this.hubConnection.on('GameUpdated', (game: Game) => {
      this.adminService.gameUpdated(game);
      this.playersService.gameUpdated(game);
      this.gamesService.gameUpdated(game);
      this.reviewsService.gameUpdated(game);
    });

    this.hubConnection.on('PosterUpdated', ({gameId, poster}) => {
      this.adminService.posterUpdated(gameId, poster);
      this.playersService.posterUpdated(gameId, poster);
      this.gamesService.posterUpdated(gameId, poster);
      this.reviewsService.posterUpdated(gameId, poster);
    });

    this.hubConnection.on('ScreenshotAdded', ({gameId, screenshot}) => {
      this.gamesService.screenshotAdded(gameId, screenshot);
    });

    this.hubConnection.on('ScreenshotDeleted', ({gameId, screenshotId}) => {
      this.gamesService.screenshotDeleted(gameId, screenshotId);
    });

    this.hubConnection.on('GameLiked', gameId => {
      this.toastr.success(gameId + ' game liked');
    }); // TODO

    this.hubConnection.on('GameDeleted', gameId => {
      this.adminService.gameDeleted(gameId);
      this.playersService.gameDeleted(gameId);
      this.reviewsService.gameDeleted(gameId);
      this.gamesService.gameDeleted(gameId);
    });

    this.hubConnection.on('ReviewApproved', (review: Review) => {
      this.reviewsService.reviewApproved(review);
      this.playersService.reviewApproved(review);
      this.gamesService.reviewApproved(review);
    });

    if (user.roles.includes('Admin') || user.roles.includes('Moderator')) {
      this.hubConnection.on('ReviewPosted', () => {
        this.adminService.reviewPosted();
      });
    }    

    this.hubConnection.on('ReviewDeleted', reviewId => {
      this.adminService.reviewDeleted(reviewId);
      this.playersService.reviewDeleted(reviewId);
      this.reviewsService.reviewDeleted(reviewId);
      this.gamesService.reviewDeleted(reviewId);
    });
  }

  stopHubConnection() {
    this.hubConnection?.stop().catch(error => console.log(error));
  }
}
