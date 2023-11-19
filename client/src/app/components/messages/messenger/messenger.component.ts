import { Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';

import { take } from 'rxjs';

import { AccountService } from 'src/app/services/account.service';
import { MessagesService } from 'src/app/services/messages.service';
import { PlayersService } from 'src/app/services/players.service';
import { Message } from 'src/app/models/message';
import { User } from 'src/app/models/user';
import { Player } from 'src/app/models/player';
import { NgForm } from '@angular/forms';
import { MessageComponent } from '../message/message.component';
import { Friend } from 'src/app/models/friend';
import { FriendStatus } from 'src/app/helpers/friendStatus';
import { FriendRequestType } from 'src/app/helpers/friendRequestType';

@Component({
  selector: 'app-messenger',
  templateUrl: './messenger.component.html',
  styleUrls: ['./messenger.component.css']
})
export class MessengerComponent implements OnInit {
  @ViewChildren(MessageComponent) messageComponents: QueryList<MessageComponent> | undefined;
  @ViewChild('messageForm') messageForm?: NgForm;
  friends: Friend[] = [];
  messages: Message[] = [];
  user: User | null = null;
  content = '';
  loading = false;
  sending = false;

  constructor(
    private accountService: AccountService,
    private messagesService: MessagesService,
    private playersService: PlayersService
  ) {
    this.accountService.currentUser$.pipe(take(1)).subscribe({
      next: user => this.user = user
    });
  }

  ngOnInit(): void {
    this.loadFriends();    
  }

  loadFriends() {
    this.playersService.getFriends(FriendStatus.active, FriendRequestType.all).subscribe({
      next: friends => {
        this.friends = friends;        
        const lastConversant = this.messagesService.getLastConversant();
        this.loadMessages(lastConversant.length > 0 ? lastConversant : this.friends[0].player.userName);
      }
    });
  }

  loadMessages(username: string) {
    this.loading = true;
    this.messagesService.getMessages(username).subscribe({
      next: messages => {
        this.messages = messages;
        this.loading = false;
      }
    });
  }

  sendMessage() {
    this.sending = true;
    this.messagesService.sendMessage(this.content).subscribe({
      next: message => {
        this.messages?.push(message);
        this.updateLastMessage();
        this.messageForm?.reset();
        this.sending = false;
      }
    })
  }

  deleteMessage(id: number) {
    this.messagesService.deleteMessage(id).subscribe({
      next: () => {
        if (!this.messages) return;
        const currentMessageIndex = this.messages.findIndex(m => m.id === id);
        this.updatePreviousMessage(currentMessageIndex - 1);
        this.updateNextMessage(currentMessageIndex + 1);
        this.messages.splice(currentMessageIndex, 1);
      }
    });
  }

  deleteMessages() {
    this.messagesService.deleteMessages().subscribe({
      next: () => this.messages = []
    });
  }

  getCurrentConversant() {
    return this.messagesService.getLastConversant();
  }
  
  private updateLastMessage() {
    if (!this.messages || !this.messageComponents) return;

    const messageComponentsArray = this.messageComponents.toArray();
    const lastIndex = messageComponentsArray.length - 1;
    const newMessage = this.messages[this.messages.length - 1];

    if (messageComponentsArray[lastIndex]) {
      messageComponentsArray[lastIndex].updateNextMessage(newMessage);
    }
  }

  private updatePreviousMessage(index: number) {
    if (!this.messages || !this.messageComponents) return;
    if (index < 0) return;

    const messageComponentsArray = this.messageComponents.toArray();

    const newMessage = index + 2 < this.messages.length ? this.messages[index + 2] : undefined;

    if (messageComponentsArray[index]) {
      messageComponentsArray[index].updateNextMessage(newMessage);
    }
  }

  private updateNextMessage(index: number) {
    if (!this.messages || !this.messageComponents) return;
    if (index >= this.messageComponents.length) return;

    const messageComponentsArray = this.messageComponents.toArray();

    const previousMessage = index - 2 >= 0 ? this.messages[index - 2] : undefined;

    if (messageComponentsArray[index]) {
      messageComponentsArray[index].updatePreviousMessage(previousMessage);
    }
  }
}
