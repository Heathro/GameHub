import { Component, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { NgForm } from '@angular/forms';

import { take } from 'rxjs';

import { AccountService } from 'src/app/services/account.service';
import { MessagesService } from 'src/app/services/messages.service';
import { MessageComponent } from '../message/message.component';
import { Message } from 'src/app/models/message';
import { Player } from 'src/app/models/player';
import { User } from 'src/app/models/user';
import { ConfirmService } from 'src/app/services/confirm.service';

@Component({
  selector: 'app-messenger',
  templateUrl: './messenger.component.html',
  styleUrls: ['./messenger.component.css']
})
export class MessengerComponent implements OnInit, OnDestroy {
  @ViewChildren(MessageComponent) messages: QueryList<MessageComponent> | undefined;
  @ViewChild('messageForm') messageForm?: NgForm;
  companions: Player[] = [];
  //messages: Message[] = [];
  user: User | null = null;
  content = '';
  loadingCompanions = false;
  //loadingMessages = false;
  sending = false;

  constructor(
    private accountService: AccountService,
    public messagesService: MessagesService,
    private confirmService: ConfirmService
  ) {
    this.accountService.currentUser$.pipe(take(1)).subscribe({
      next: user => this.user = user
    });
  }

  ngOnInit(): void {
    this.messagesService.newMessage$.subscribe(message => this.updateLastMessage(message));
    this.loadCompanions();
  }

  ngOnDestroy(): void {
    this.messagesService.stopHubConnection();
  }

  loadCompanions() {
    this.loadingCompanions = true;
    this.messagesService.getCompanions().subscribe({
      next: companions => {
        this.companions = companions;        
        const lastCompanion = this.messagesService.getLastCompanion();

        if (lastCompanion.length > 0 && this.user) {
          //this.loadMessages(lastCompanion);
          //this.messagesService.createHubConnection(this.user, lastCompanion);
          this.loadMessages(lastCompanion);
        }
        else if (companions.length > 0 && this.user) {
          //this.loadMessages(companions[0].userName);
          //this.messagesService.createHubConnection(this.user, companions[0].userName);
          this.loadMessages(companions[0].userName);
        }

        this.loadingCompanions = false;
      }
    });
  }

  changeCompanion(username: string) {
    this.messagesService.stopHubConnection();
    this.loadMessages(username);
  }

  deleteCompanion() {
    this.confirmService.confirm(
      'Delete Chat',
      'Are you sure you want to delete chat with ' + this.getCurrentConversant() + '?',
      'Delete',
      'Cancel'
    ).subscribe({
      next: confirmed => {
        if (confirmed) {
          this.messagesService.deleteCompanion().then(() => {
            this.messagesService.stopHubConnection();
            this.loadCompanions();
          });
        }
      }
    });
    // this.messagesService.deleteCompanion().then(() => {
    //   this.messagesService.stopHubConnection();
    //   this.loadCompanions();
    // });
    // this.messagesService.deleteCompanion(this.messages.length > 0).subscribe({
    //   next: () => {
    //     this.messages = [];
    //     this.loadCompanions();
    //   } 
    // });
  }

  getCurrentConversant() {
    return this.messagesService.getLastCompanion();
  }

  loadMessages(username: string) {
    if (!this.user) return;
    this.messagesService.createHubConnection(this.user, username);
    // this.loadingMessages = true;
    // this.messagesService.getMessages(username).subscribe({
    //   next: messages => {
    //     this.messages = messages;
    //     this.loadingMessages = false;
    //   }
    // });
  }

  sendMessage() {
    this.sending = true;
    this.messagesService.sendMessage(this.content).then(() => {
      this.messageForm?.reset();
      this.sending = false;
    });
    // this.sending = true;
    // this.messagesService.sendMessage(this.content).subscribe({
    //   next: message => {
    //     this.messages.push(message);
    //     this.updateLastMessage();
    //     this.messageForm?.reset();
    //     this.sending = false;
    //   }
    // });
  }

  deleteMessage(id: number) {
    const currentMessageIndex = this.messagesService.getMessageIndex(id);
    this.updatePreviousMessage(currentMessageIndex - 1);
    this.updateNextMessage(currentMessageIndex + 1);    
    this.messagesService.deleteMessage(id);
    // this.messagesService.deleteMessage(id).subscribe({
    //   next: () => {
    //     const currentMessageIndex = this.messages.findIndex(m => m.id === id);
    //     this.updatePreviousMessage(currentMessageIndex - 1);
    //     this.updateNextMessage(currentMessageIndex + 1);
    //     this.messages.splice(currentMessageIndex, 1);
    //   }
    // });
  }

  deleteMessages() {
    this.confirmService.confirm(
      'Clear Chat',
      'Are you sure you want to clear chat with ' + this.getCurrentConversant() + '?',
      'Clear',
      'Cancel'
    ).subscribe({
      next: confirmed => {
        if (confirmed) {
          this.messagesService.deleteMessages();
        }
      }
    });
    // this.messagesService.deleteMessages();
    // this.messagesService.deleteMessages().subscribe({
    //   next: () => this.messages.length = 0
    // });
  }
  
  private updateLastMessage(message: Message) {
    if (!this.messages) return;

    const messagesArray = this.messages.toArray();
    const lastIndex = messagesArray.length - 1;

    if (messagesArray[lastIndex]) messagesArray[lastIndex].updateNextMessage(message);
  }
  // private updateLastMessage() {
  //   if (!this.messages || !this.messageComponents) return;

  //   const messageComponentsArray = this.messageComponents.toArray();
  //   const lastIndex = messageComponentsArray.length - 1;
  //   const newMessage = this.messages[this.messages.length - 1];

  //   if (messageComponentsArray[lastIndex]) {
  //     messageComponentsArray[lastIndex].updateNextMessage(newMessage);
  //   }
  // }

  private updatePreviousMessage(index: number) {
    if (!this.messages) return;
    if (index < 0) return;
    
    const messagesArray = this.messages.toArray();    
    const nextMessage = this.messagesService.getNextMessage(index);
    
    if (messagesArray[index]) messagesArray[index].updateNextMessage(nextMessage);
  }
  // private updatePreviousMessage(index: number) {
  //   if (!this.messages || !this.messageComponents) return;
  //   if (index < 0) return;

  //   const messageComponentsArray = this.messageComponents.toArray();

  //   const newMessage = index + 2 < this.messages.length ? this.messages[index + 2] : undefined;

  //   if (messageComponentsArray[index]) {
  //     messageComponentsArray[index].updateNextMessage(newMessage);
  //   }
  // }

  private updateNextMessage(index: number) {
    if (!this.messages) return;
    if (index >= this.messages.length) return;

    const messagesArray = this.messages.toArray();
    const previousMessage = this.messagesService.getPreviousMessage(index);

    if (messagesArray[index]) messagesArray[index].updatePreviousMessage(previousMessage);
  }
  // private updateNextMessage(index: number) {
  //   if (!this.messages || !this.messageComponents) return;
  //   if (index >= this.messageComponents.length) return;

  //   const messageComponentsArray = this.messageComponents.toArray();

  //   const previousMessage = index - 2 >= 0 ? this.messages[index - 2] : undefined;

  //   if (messageComponentsArray[index]) {
  //     messageComponentsArray[index].updatePreviousMessage(previousMessage);
  //   }
  // }
}
