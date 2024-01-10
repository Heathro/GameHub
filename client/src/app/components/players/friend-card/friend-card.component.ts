import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';

import { PresenceService } from 'src/app/services/presence.service';
import { MessagesService } from 'src/app/services/messages.service';
import { PlayersService } from 'src/app/services/players.service';
import { Player } from 'src/app/models/player';

@Component({
  selector: 'app-friend-card',
  templateUrl: './friend-card.component.html',
  styleUrls: ['./friend-card.component.css']
})
export class FriendCardComponent implements OnInit {
  @Output() deleteCard = new EventEmitter<number>();
  @Input() player: Player | undefined;

  constructor(
    public presenceService: PresenceService,
    private playersService: PlayersService, 
    private messagesService: MessagesService,
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  addFriend() {
    if (!this.player) return;
    this.playersService.addFriend(this.player.userName).subscribe({
      next: player => this.deleteCard.emit(player.id)
    });
  }

  deleteFriend() {
    if (!this.player) return;
    this.playersService.deleteFriend(this.player.userName).subscribe({
      next: player => this.deleteCard.emit(player.id)
    });
  }

  acceptRequest() {
    if (!this.player) return;
    this.playersService.acceptRequest(this.player.userName).subscribe({
      next: player => this.deleteCard.emit(player.id)
    });
  }

  cancelRequest() {
    if (!this.player) return;
    this.playersService.cancelRequest(this.player.userName).subscribe({
      next: player => this.deleteCard.emit(player.id)
    });
  }

  messagePlayer() {
    if (!this.player) return;
    this.messagesService.startChat(this.player).subscribe({
      next: () => this.router.navigateByUrl('/messenger')
    });
  }
}
