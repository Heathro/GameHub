import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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
  @Output() redraw = new EventEmitter<any>();
  @Input() friend: Friend | undefined;
  isIncomeRequest = false;

  constructor(
    private playersService: PlayersService, 
    private messagesService: MessagesService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.checkIncomeRequest();
  }

  addFriend() {
    if (!this.friend) return;
    this.playersService.addFriend(this.friend.player.userName).subscribe({
      next: friend => {
        this.friend = friend
        this.redraw.emit();
      }
    });
  }

  deleteFriend() {
    if (!this.friend) return;
    this.playersService.deleteFriend(this.friend.player.userName).subscribe({
      next: friend => {
        this.friend = friend
        this.redraw.emit();
      }
    });
  }

  acceptRequest() {
    if (!this.friend) return;
    this.playersService.acceptRequest(this.friend.player.userName).subscribe({
      next: friend => {
        this.friend = friend
        this.redraw.emit();
      }
    });
  }

  cancelRequest() {
    if (!this.friend) return;
    this.playersService.cancelRequest(this.friend.player.userName).subscribe({
      next: friend => {
        this.friend = friend
        this.redraw.emit();
      }
    });
  }

  checkIncomeRequest() {
    if (!this.friend) return;
    this.playersService.isIncomeRequest(this.friend.player.userName).subscribe({
      next: isIncomeRequest => this.isIncomeRequest = isIncomeRequest
    });
  }

  messagePlayer() {
    if (!this.friend) return;
    this.messagesService.setLastCompanion(this.friend.player.userName);
    this.router.navigateByUrl('/messenger');
  }
}
