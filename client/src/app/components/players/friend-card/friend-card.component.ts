import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Friend } from 'src/app/models/friend';
import { Player } from 'src/app/models/player';
import { MessagesService } from 'src/app/services/messages.service';
import { PlayersService } from 'src/app/services/players.service';

@Component({
  selector: 'app-friend-card',
  templateUrl: './friend-card.component.html',
  styleUrls: ['./friend-card.component.css']
})
export class FriendCardComponent implements OnInit {
  @Output() deleteCard = new EventEmitter<number>();
  @Input() player: Player | undefined;

  constructor(
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
    this.messagesService.setLastCompanion(this.player.userName);
    this.router.navigateByUrl('/messenger');
  }
}
