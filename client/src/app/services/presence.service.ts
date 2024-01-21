import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { BehaviorSubject, take } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { environment } from 'src/environments/environment';
import { MessagesService } from './messages.service';
import { Player } from '../models/player';
import { User } from '../models/user';
import { PlayersService } from './players.service';
import { Review } from '../models/review';
import { FriendStatus } from '../enums/friendStatus';
import { FriendRequestType } from '../enums/friendRequestType';
import { Game } from '../models/game';

@Injectable({
  providedIn: 'root'
})
export class PresenceService {
  hubUrl = environment.hubUrl;
  private hubConnection?: HubConnection;
  private onlineUsersSource = new BehaviorSubject<string[]>([]);
  onlineUsers$ = this.onlineUsersSource.asObservable();

  constructor(
    private messagesService: MessagesService,
    private playersService: PlayersService,
    private router: Router,
    private toastr: ToastrService
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
      this.toastr.error(username + ' account deleted');
    });

    this.hubConnection.on('ReviewPosted', (review: Review) => {
      this.toastr.success(review.reviewerUsername + ' posted review');
    });

    this.hubConnection.on('FriendshipRequested', (initiator: Player) => {
      this.toastr.warning(
        initiator.userName + ' ' + FriendStatus[initiator.status] + ' ' + FriendRequestType[initiator.type]);
    });

    this.hubConnection.on('FriendshipCancelled', (initiator: Player) => {
      this.toastr.error(
        initiator.userName + ' ' + FriendStatus[initiator.status] + ' ' + FriendRequestType[initiator.type]);
    });

    this.hubConnection.on('FriendshipAccepted', (initiator: Player) => {
      this.toastr.success(
        initiator.userName + ' ' + FriendStatus[initiator.status] + ' ' + FriendRequestType[initiator.type]);
    });

    this.hubConnection.on('GameUpdated', (game: Game) => {
      this.toastr.success(game.title + ' updated');
    });

    this.hubConnection.on('PosterUpdated', ({gameId, poster}) => {
      this.toastr.success(gameId + ' poster ' + poster.url);
    });

    this.hubConnection.on('ScreenshotAdded', ({gameId, screenshot}) => {
      this.toastr.success(gameId + ' screenshot added ' + screenshot.id);
    });

    this.hubConnection.on('ScreenshotDeleted', ({gameId, screenshotId}) => {
      this.toastr.error(gameId + ' screenshot deleted ' + screenshotId);
    });

    this.hubConnection.on('GameDeleted', gameId => {
      this.toastr.error(gameId + ' game deleted');
    });

    this.hubConnection.on('===NOTIFICATION===', notification => {
      
    });

    this.hubConnection.on('===NOTIFICATION===', notification => {
      
    });

    this.hubConnection.on('===NOTIFICATION===', notification => {
      
    });
  }

  stopHubConnection() {
    this.hubConnection?.stop().catch(error => console.log(error));
  }
}
