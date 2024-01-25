import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { BehaviorSubject, Subject, take } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { environment } from 'src/environments/environment';
import { MessagesService } from './messages.service';
import { Player } from '../models/player';
import { User } from '../models/user';
import { Review } from '../models/review';
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

    this.hubConnection.on('ReviewPosted', (review: Review) => {
      this.toastr.success(review.reviewerUsername + ' posted review');
    }); // TODO

    this.hubConnection.on('FriendshipRequested', (initiator: Player) => {
      this.toastr.warning(
        initiator.userName + ' ' + FriendStatus[initiator.status] + ' ' + FriendRequestType[initiator.type]);
    }); // TODO

    this.hubConnection.on('FriendshipCancelled', (initiator: Player) => {
      this.toastr.error(
        initiator.userName + ' ' + FriendStatus[initiator.status] + ' ' + FriendRequestType[initiator.type]);
    }); // TODO

    this.hubConnection.on('FriendshipAccepted', (initiator: Player) => {
      this.toastr.success(
        initiator.userName + ' ' + FriendStatus[initiator.status] + ' ' + FriendRequestType[initiator.type]);
    }); // TODO

    this.hubConnection.on('GameUpdated', (game: Game) => {
      this.toastr.success(game.title + ' updated');
    }); // TODO

    this.hubConnection.on('PosterUpdated', ({gameId, poster}) => {
      this.toastr.success(gameId + ' poster ' + poster.url);
    }); // TODO

    this.hubConnection.on('ScreenshotAdded', ({gameId, screenshot}) => {
      this.toastr.success(gameId + ' screenshot added ' + screenshot.id);
    }); // TODO

    this.hubConnection.on('ScreenshotDeleted', ({gameId, screenshotId}) => {
      this.toastr.error(gameId + ' screenshot deleted ' + screenshotId);
    }); // TODO

    this.hubConnection.on('GameDeleted', gameId => {
      this.adminService.gameDeleted(gameId);
      this.playersService.gameDeleted(gameId);
      this.reviewsService.gameDeleted(gameId);
      this.gamesService.gameDeleted(gameId);
    });

    this.hubConnection.on('GameLiked', gameId => {
      this.toastr.success(gameId + ' game liked');
    }); // TODO

    this.hubConnection.on('GamePublished', (game: Game) => {
      this.toastr.success(game.title + ' published');
    }); // TODO

    this.hubConnection.on('ReviewDeleted', reviewId => {
      this.adminService.reviewDeleted(reviewId);
      this.playersService.reviewDeleted(reviewId);
      this.reviewsService.reviewDeleted(reviewId);
      this.gamesService.reviewDeleted(reviewId);
    });

    this.hubConnection.on('UserUpdated', (player: Player) => {
      this.toastr.success(player.userName + ' updated');
    }); // TODO

    this.hubConnection.on('AvatarUpdated', ({userId, avatar}) => {
      this.toastr.success(userId + ' avatar ' + avatar.url);
    }); // TODO

    this.hubConnection.on('UserRegisted', (player: Player) => {
      this.toastr.success(player.userName + ' registed');
    }); // TODO

    this.hubConnection.on('===NOTIFICATION===', notification => {
      
    }); // TODO
  }

  stopHubConnection() {
    this.hubConnection?.stop().catch(error => console.log(error));
  }
}
