import { 
  Component, OnDestroy, OnInit,
  QueryList, ViewChild, ViewChildren
} from '@angular/core';
import { NgForm } from '@angular/forms';

import { take } from 'rxjs';

import { MessageComponent } from '../message/message.component';
import { ConfirmService } from 'src/app/services/confirm.service';
import { AccountService } from 'src/app/services/account.service';
import { PlayersService } from 'src/app/services/players.service';
import { MessagesService } from 'src/app/services/messages.service';
import { Message } from 'src/app/models/message';
import { Player } from 'src/app/models/player';
import { User } from 'src/app/models/user';
import { Avatar } from 'src/app/models/avatar';

@Component({
  selector: 'app-messenger',
  templateUrl: './messenger.component.html',
  styleUrls: ['./messenger.component.css']
})
export class MessengerComponent implements OnInit, OnDestroy {
  @ViewChildren(MessageComponent) messages: QueryList<MessageComponent> | undefined;
  @ViewChild('messageForm') messageForm?: NgForm;
  user: User | null = null;
  companions: Player[] = [];
  loadingCompanions = false;
  content = '';
  sending = false;
  playerDeletedSubscription;
  avatarUpdatedSubscription;
  loadMessagesSubscription;
  incomingMessageSubscription;

  constructor(
    private accountService: AccountService,
    public messagesService: MessagesService,
    private confirmService: ConfirmService,
    private playersService: PlayersService
  ) {
    this.playerDeletedSubscription = this.playersService.playerDeleted$.subscribe(
      ({userName, userId}) => this.playerDeleted(userName, userId)
    );
    this.avatarUpdatedSubscription = this.playersService.avatarUpdated$.subscribe(
      ({userId, avatar}) => this.avatarUpdated(userId, avatar)
    );
    this.loadMessagesSubscription = this.messagesService.loadMessages$.subscribe(
      companionUsername => this.loadMessages(companionUsername)
    );
    this.incomingMessageSubscription = messagesService.incomingMessage$.subscribe(
      companion => this.incomingMessage(companion)
    );
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
    this.playerDeletedSubscription.unsubscribe();
    this.avatarUpdatedSubscription.unsubscribe();
    this.incomingMessageSubscription.unsubscribe();
  }

  loadCompanions() {
    this.loadingCompanions = true;
    this.messagesService.getCompanions().subscribe({
      next: companions => {
        this.companions = companions;
        const lastCompanion = this.messagesService.getLastCompanion();

        if (lastCompanion.length > 0 && this.user) {
          this.loadMessages(lastCompanion);
        }
        else if (companions.length > 0 && this.user) {
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
  }

  getCurrentConversant() {
    return this.messagesService.getLastCompanion();
  }

  loadMessages(username: string) {
    if (!this.user) return;
    this.messagesService.createHubConnection(this.user, username);
  }

  sendMessage() {
    this.sending = true;
    this.messagesService.sendMessage(this.content).then(() => {
      this.messageForm?.reset();
      this.sending = false;
    });
  }

  deleteMessage(id: number) {
    const currentMessageIndex = this.messagesService.getMessageIndex(id);
    this.updatePreviousMessage(currentMessageIndex - 1);
    this.updateNextMessage(currentMessageIndex + 1);   
    this.messagesService.deleteMessage(id);
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
  }
  
  private updateLastMessage(message: Message) {
    if (!this.messages) return;

    const messagesArray = this.messages.toArray();
    const lastIndex = messagesArray.length - 1;

    if (messagesArray[lastIndex]) messagesArray[lastIndex].updateNextMessage(message);
  }

  private updatePreviousMessage(index: number) {
    if (!this.messages) return;
    if (index < 0) return;
    
    const messagesArray = this.messages.toArray();    
    const nextMessage = this.messagesService.getNextMessage(index);
    
    if (messagesArray[index]) messagesArray[index].updateNextMessage(nextMessage);
  }

  private updateNextMessage(index: number) {
    if (!this.messages) return;
    if (index >= this.messages.length) return;

    const messagesArray = this.messages.toArray();
    const previousMessage = this.messagesService.getPreviousMessage(index);

    if (messagesArray[index]) messagesArray[index].updatePreviousMessage(previousMessage);
  }
  
  private playerDeleted(userName: string, userId: number) {
    this.companions = this.companions.filter(c => c.id !== userId);
    if (this.getCurrentConversant() === userName && this.companions.length > 0) {
      this.changeCompanion(this.companions[0].userName);
    }
  }
  
  private avatarUpdated(userId: number, avatar: Avatar) {
    this.companions.forEach(c => {
      if (c.id === userId) c.avatar = avatar;
    });
    if (this.messages) {
      const messagesArray = this.messages.toArray();
      messagesArray.forEach(m => m.changeAvatar(userId, avatar));
    }
  }

  private incomingMessage(companion: Player) {
    this.companions = this.companions.filter(c => c.userName !== companion.userName);
    this.companions.unshift(companion);
  }
}
