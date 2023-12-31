import { Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { NgForm } from '@angular/forms';

import { take } from 'rxjs';

import { AccountService } from 'src/app/services/account.service';
import { MessagesService } from 'src/app/services/messages.service';
import { MessageComponent } from '../message/message.component';
import { Message } from 'src/app/models/message';
import { Player } from 'src/app/models/player';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-messenger',
  templateUrl: './messenger.component.html',
  styleUrls: ['./messenger.component.css']
})
export class MessengerComponent implements OnInit {
  @ViewChildren(MessageComponent) messageComponents: QueryList<MessageComponent> | undefined;
  @ViewChild('messageForm') messageForm?: NgForm;
  companions: Player[] = [];
  messages: Message[] = [];
  user: User | null = null;
  content = '';
  loadingCompanions = false;
  loadingMessages = false;
  sending = false;

  constructor(private accountService: AccountService, private messagesService: MessagesService) {
    this.accountService.currentUser$.pipe(take(1)).subscribe({
      next: user => this.user = user
    });
  }

  ngOnInit(): void {
    this.loadCompanions();
  }

  loadCompanions() {
    this.loadingCompanions = true;
    this.messagesService.getCompanions().subscribe({
      next: companions => {
        this.companions = companions;        
        const lastCompanion = this.messagesService.getLastCompanion();

        if (lastCompanion.length > 0) {
          this.loadMessages(lastCompanion);
        }
        else if (companions.length > 0) {
          this.loadMessages(companions[0].userName);
        }

        this.loadingCompanions = false;
      }
    });
  }

  loadMessages(username: string) {
    this.loadingMessages = true;
    this.messagesService.getMessages(username).subscribe({
      next: messages => {
        this.messages = messages;
        this.loadingMessages = false;
      }
    });
  }

  sendMessage() {
    this.sending = true;
    this.messagesService.sendMessage(this.content).subscribe({
      next: message => {
        this.messages.push(message);
        this.updateLastMessage();
        this.messageForm?.reset();
        this.sending = false;
      }
    })
  }

  deleteMessage(id: number) {
    this.messagesService.deleteMessage(id).subscribe({
      next: () => {
        const currentMessageIndex = this.messages.findIndex(m => m.id === id);
        this.updatePreviousMessage(currentMessageIndex - 1);
        this.updateNextMessage(currentMessageIndex + 1);
        this.messages.splice(currentMessageIndex, 1);
      }
    });
  }

  deleteMessages() {
    this.messagesService.deleteMessages().subscribe({
      next: () => this.messages.length = 0
    });
  }

  deleteCompanion() {
    this.messagesService.deleteCompanion(this.messages.length > 0).subscribe({
      next: () => {
        this.messages = [];
        this.loadCompanions();
      } 
    });
  }

  getCurrentConversant() {
    return this.messagesService.getLastCompanion();
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
