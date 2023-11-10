import { Component, OnInit } from '@angular/core';

import { take } from 'rxjs';

import { AccountService } from 'src/app/services/account.service';
import { MessagesService } from 'src/app/services/messages.service';
import { PlayersService } from 'src/app/services/players.service';
import { Message } from 'src/app/models/message';
import { User } from 'src/app/models/user';
import { Player } from 'src/app/models/player';

@Component({
  selector: 'app-messenger',
  templateUrl: './messenger.component.html',
  styleUrls: ['./messenger.component.css']
})
export class MessengerComponent implements OnInit {
  friends?: Player[];
  messages?: Message[];
  user: User | null = null;

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
}
