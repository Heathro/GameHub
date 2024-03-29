import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { BehaviorSubject, Subject, map, of, take } from 'rxjs';

import { environment } from 'src/environments/environment';
import { BusyService } from './busy.service';
import { Message } from '../models/message';
import { Player } from '../models/player';
import { User } from '../models/user';
import { Avatar } from '../models/avatar';

@Injectable({
  providedIn: 'root'
})
export class MessagesService {
  baseUrl = environment.apiUrl;
  hubUrl = environment.hubUrl;
  lastCompanion = '';
  companions: Player[] = [];
  companionsLoaded = false;
  unreadCompanions: string[] = [];
  private hubConnection?: HubConnection;

  private messageThreadSource = new BehaviorSubject<Message[]>([]);
  messageThread$ = this.messageThreadSource.asObservable();
  private newMessageSource = new Subject<Message>();
  newMessage$ = this.newMessageSource.asObservable();
  private loadMessagesSource = new Subject<string>();
  loadMessages$ = this.loadMessagesSource.asObservable();
  private incomingMessageSource = new Subject<Player>();
  incomingMessage$ = this.incomingMessageSource.asObservable();

  constructor(private http: HttpClient, private busyService: BusyService) { }

  createHubConnection(currentUser: User, otherUserName: string) {
    this.busyService.busy();

    this.lastCompanion = otherUserName;
    this.unreadCompanions = this.unreadCompanions.filter(c => c !== otherUserName);

    this.hubConnection = new HubConnectionBuilder()
      .withUrl(this.hubUrl + 'message?user=' + otherUserName, {
        accessTokenFactory: () => currentUser.token
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start()
      .catch(error => console.log(error))
      .finally(() => this.busyService.idle());

    this.hubConnection.on('RecieveMessageThread', messages => {
      this.messageThreadSource.next(messages);
    });
    
    this.hubConnection.on('ConversantJoined', () => {
      this.messageThread$.pipe(take(1)).subscribe({
        next: messages => {
          messages.forEach(message => {
            if (!message.messageRead) message.messageRead = new Date(Date.now());
          });
        }
      });
    });

    this.hubConnection.on('NewMessage', message => {
      this.messageThread$.pipe(take(1)).subscribe({
        next: messages => {
          this.messageThreadSource.next([...messages, message]);
          this.newMessageSource.next(message);
        }
      });
    });
  }

  stopHubConnection() {
    if (this.hubConnection) {
      this.messageThreadSource.next([]);
      this.hubConnection.stop();
    }
  }

  getCompanions() {
    if (this.companionsLoaded) return of(this.companions);
    return this.http.get<Player[]>(this.baseUrl + 'messages/companions').pipe(
      map(companions => {
        this.companionsLoaded = true;
        this.companions = companions;
        return companions;
      })
    );
  }

  setUnreadCompanions(unreadCompanions: string[]) {
    this.unreadCompanions = unreadCompanions;
  }

  addUnreadCompanion(unreadCompanion: string) {
    if (!this.unreadCompanions.includes(unreadCompanion)) {
      this.unreadCompanions.push(unreadCompanion);
    }
  }

  getUnreadCompanions() {
    return this.unreadCompanions;
  }
  
  getLastCompanion() {
    return this.lastCompanion;
  }

  async deleteCompanion() {
    return this.hubConnection?.invoke('DeleteMessages', this.lastCompanion)
      .then(() => {
        this.messageThreadSource.next([]);
        this.companions = this.companions.filter(c => c.userName !== this.lastCompanion);
        this.lastCompanion = this.companions.length > 0 ? this.companions[0].userName : '';
      })
      .catch(error => console.log(error));
  }

  incomingMessage(player: Player) {
    if (this.companions.length === 0) {
      this.lastCompanion = player.userName;
      const index = this.companions.findIndex(c => c.userName === player.userName);
      if (index === -1) this.companions.push(player);
      this.loadMessagesSource.next(player.userName);
    }
    else {
      if (this.lastCompanion !== player.userName) {
        this.addUnreadCompanion(player.userName);
      }
      this.companions = this.companions.filter(c => c.userName !== player.userName);
      this.companions.unshift(player);
      this.incomingMessageSource.next(player);
    }
  }

  addCompanion(companion: Player) {
    const index = this.companions.findIndex(c => c.userName === companion.userName);
    if (index === -1) this.companions.push(companion);
  }

  startChat(player: Player) {
    this.lastCompanion = player.userName;

    if (this.companionsLoaded) {
      this.companions = this.companions.filter(c => c.userName !== player.userName);
      this.companions.unshift(player);
      return of(void 0);
    }
    else {
      return this.http.get<Player[]>(this.baseUrl + 'messages/companions').pipe(
        map(companions => {
          this.companionsLoaded = true;
          this.companions = companions;
          this.companions = this.companions.filter(c => c.userName !== player.userName);
          this.companions.unshift(player);
        })
      );
    }
  }

  getMessageIndex(id: number) {
    return this.messageThreadSource.value.findIndex(m => m.id === id);
  }

  getNextMessage(index: number) {
    return index + 2 < this.messageThreadSource.value.length ? 
      this.messageThreadSource.value[index + 2] : undefined;
  }

  getPreviousMessage(index: number) {
    return index - 2 >= 0 ? this.messageThreadSource.value[index - 2] : undefined;
  }

  async sendMessage(content: string) {
    return this.hubConnection?.invoke('SendMessage', {recipientUsername: this.lastCompanion, content})
      .catch(error => console.log(error));
  }

  async deleteMessage(id: number) {
    return this.hubConnection?.invoke('DeleteMessage', id)
      .then(() => this.messageThreadSource.next(this.messageThreadSource.value.filter(m => m.id !== id)))
      .catch(error => console.log(error));
  }

  async deleteMessages() {
    return this.hubConnection?.invoke('DeleteMessages', this.lastCompanion)
      .then(() => this.messageThreadSource.next([]))
      .catch(error => console.log(error));
  }

  clearPrivateData() {
    this.messageThreadSource.next([]);
    this.lastCompanion = '';
    this.companions.length = 0;
    this.companionsLoaded = false;
    this.unreadCompanions.length = 0;
  }
  
  playerDeleted(userId: number) {
    this.companions = this.companions.filter(c => c.id !== userId);
    if (this.companions.length === 0) {
      this.messageThreadSource.next([]);
      this.lastCompanion = '';
    }
  }
  
  avatarUpdated(userId: number, avatar: Avatar) {
    this.companions.forEach(c => {
        if (c.id === userId) c.avatar = avatar;
    });
  }
}
