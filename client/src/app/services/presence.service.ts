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
import { FriendStatus } from '../enums/friendStatus';

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
  }

  stopHubConnection() {
    this.hubConnection?.stop().catch(error => console.log(error));
  }
}
