import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';

import { BehaviorSubject, Subject, map, of, take } from 'rxjs';

import { environment } from 'src/environments/environment';
import { Message } from '../models/message';
import { Player } from '../models/player';
import { User } from '../models/user';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class MessagesService {
  baseUrl = environment.apiUrl;
  hubUrl = environment.hubUrl;
  private hubConnection?: HubConnection;
  private messageThreadSource = new BehaviorSubject<Message[]>([]);
  messageThread$ = this.messageThreadSource.asObservable();
  private newMessageSource = new Subject<Message>();
  newMessage$ = this.newMessageSource.asObservable();
  //messagesCache = new Map();
  lastCompanion = '';
  companions: Player[] = [];
  companionsLoaded = false;

  constructor(private http: HttpClient, private router: Router) { }

  createHubConnection(currentUser: User, otherUserName: string) {
    this.lastCompanion = otherUserName;

    this.hubConnection = new HubConnectionBuilder()
      .withUrl(this.hubUrl + 'message?user=' + otherUserName, {
        accessTokenFactory: () => currentUser.token
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start().catch(error => console.log(error));

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
    if (this.hubConnection) this.hubConnection.stop();
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
  //deleteCompanion(deleteMessages: boolean) {
    // if (deleteMessages) {
    //   return this.http.delete(this.baseUrl + 'messages/delete-messages/' + this.lastCompanion).pipe(
    //     map(() => {
    //       this.companions = this.companions.filter(c => c.userName !== this.lastCompanion);
    //       this.messagesCache.delete(this.lastCompanion);
    //       this.lastCompanion = this.companions.length > 0 ? this.companions[0].userName : '';
    //     })
    //   );
    // }
    // else {
    //   this.companions = this.companions.filter(c => c.userName !== this.lastCompanion);
    //   this.messagesCache.delete(this.lastCompanion);
    //   this.lastCompanion = this.companions.length > 0 ? this.companions[0].userName : '';
    //   return of(void 0);
    // }
  //}

  startChat(player: Player) {
    this.lastCompanion = player.userName;

    if (this.companionsLoaded) {
      if (!this.companions.find(c => c.userName === player.userName)) {
        this.companions.unshift(player);
      }
      return of(void 0);
    }
    else {
      return this.http.get<Player[]>(this.baseUrl + 'messages/companions').pipe(
        map(companions => {
          this.companionsLoaded = true;
          this.companions = companions;
          if (!this.companions.find(c => c.userName === player.userName)) {
            this.companions.unshift(player);
          }
        })
      );
    }
  }

  // getMessages(username: string) {
  //   this.lastCompanion = username;

  //   const response = this.messagesCache.get(username);
  //   if (response) return of(response);

  //   return this.http.get<Message[]>(this.baseUrl + 'messages/thread/' + username).pipe(
  //     map(response => {
  //       this.messagesCache.set(username, response);
  //       return response;
  //     })
  //   );
  // }

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
    // const messageDto = { recipientUsername: this.lastCompanion, content };
    // return this.http.post<Message>(this.baseUrl + 'messages/new', messageDto);
  }

  async deleteMessage(id: number) {
    return this.hubConnection?.invoke('DeleteMessage', id)
      .then(() => this.messageThreadSource.next(this.messageThreadSource.value.filter(m => m.id !== id)))
      .catch(error => console.log(error));
    //return this.http.delete(this.baseUrl + 'messages/delete-message/' + id);
  }

  async deleteMessages() {
    return this.hubConnection?.invoke('DeleteMessages', this.lastCompanion)
      .then(() => this.messageThreadSource.next([]))
      .catch(error => console.log(error));
    //return this.http.delete(this.baseUrl + 'messages/delete-messages/' + this.lastCompanion);
  }

  clearPrivateData() {
    this.messageThreadSource.next([]);
    //this.messagesCache = new Map();
    this.lastCompanion = '';
    this.companions.length = 0;
    this.companionsLoaded = false;
  }
}
