import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Friend } from 'src/app/models/friend';
import { MessagesService } from 'src/app/services/messages.service';
import { PlayersService } from 'src/app/services/players.service';

@Component({
  selector: 'app-friend-card',
  templateUrl: './friend-card.component.html',
  styleUrls: ['./friend-card.component.css']
})
export class FriendCardComponent implements OnInit {
  @Input() friend: Friend | undefined;
  isIncomeRequest = false;

  constructor(
    private playersService: PlayersService, 
    private messagesService: MessagesService,
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  addFriend() {
    if (!this.friend) return;
    this.playersService.addFriend(this.friend.player.userName).subscribe({
      next: friend => this.friend = friend
    });
  }

  deleteFriend() {
    if (!this.friend) return;
    this.playersService.deleteFriend(this.friend.player.userName).subscribe({
      next: friend => this.friend = friend
    });
  }

  acceptRequest() {
    if (!this.friend) return;
    this.playersService.acceptRequest(this.friend.player.userName).subscribe({
      next: friend => this.friend = friend
    });
  }

  cancelRequest() {
    if (!this.friend) return;
    this.playersService.cancelRequest(this.friend.player.userName).subscribe({
      next: friend => this.friend = friend
    });
  }

  checkIncomeRequest() {
    if (!this.friend) return;
    this.isIncomeRequest = this.playersService.isIncomeRequest(this.friend.player.userName) ? true : false;
  }

  messagePlayer() {
    if (!this.friend) return;
    this.messagesService.setLastCompanion(this.friend.player.userName);
    this.router.navigateByUrl('/messenger');
  }
}
