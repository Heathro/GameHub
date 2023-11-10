import { AfterViewInit, Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';

import { take } from 'rxjs';

import { AccountService } from 'src/app/services/account.service';
import { MessagesService } from 'src/app/services/messages.service';
import { PlayersService } from 'src/app/services/players.service';
import { Message } from 'src/app/models/message';
import { User } from 'src/app/models/user';
import { Player } from 'src/app/models/player';
import { NgForm } from '@angular/forms';
import { MessageComponent } from '../message/message.component';

@Component({
  selector: 'app-messenger',
  templateUrl: './messenger.component.html',
  styleUrls: ['./messenger.component.css']
})
export class MessengerComponent implements OnInit, AfterViewInit {
  @ViewChildren(MessageComponent) messageComponents: QueryList<MessageComponent> | undefined;
  @ViewChild('messageForm') messageForm?: NgForm;
  friends?: Player[];
  messages?: Message[];
  user: User | null = null;
  content = '';

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
  
  ngAfterViewInit(): void {
  }

  loadFriends() {
    this.playersService.getFriends().subscribe({
      next: friends => {
        this.friends = friends;
        
        const lastConversant = this.messagesService.getLastConversant();
        this.loadMessages(lastConversant.length > 0 ? lastConversant : this.friends[0].username);
      }
    });
  }

  loadMessages(username: string) {
    this.messagesService.getMessages(username).subscribe({
      next: messages => this.messages = messages
    });
  }

  sendMessage() {
    this.messagesService.sendMessage(this.content).subscribe({
      next: message => {
        this.messages?.push(message);
        this.updateLastMessage();
        this.messageForm?.reset();
      }
    })
  }

  updateLastMessage() {
    if (!this.messages || !this.messageComponents) return;

    const messageComponentsArray = this.messageComponents.toArray();
    const lastIndex = messageComponentsArray.length - 1;
    const newMessage = this.messages[this.messages.length - 1];

    if (messageComponentsArray[lastIndex]) {
      messageComponentsArray[lastIndex].updateNextMessage(newMessage);
    }
  }
}
