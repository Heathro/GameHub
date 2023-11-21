import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Friend } from 'src/app/models/friend';

import { Player } from 'src/app/models/player';
import { MessagesService } from 'src/app/services/messages.service';
import { PlayersService } from 'src/app/services/players.service';

@Component({
  selector: 'app-player-profile',
  templateUrl: './player-profile.component.html',
  styleUrls: ['./player-profile.component.css']
})
export class PlayerProfileComponent implements OnInit {
  friend: Friend | undefined;
  isIncomeRequest = false;

  constructor(
    private playersService: PlayersService,
    private messageService: MessagesService,
    private route: ActivatedRoute, 
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadPlayer();
    this.checkIncomeRequest();
  }

  loadPlayer() {
    const username = this.route.snapshot.paramMap.get('username');
    if (!username) return;
    this.playersService.getPlayerWithFriendStatus(username).subscribe({
      next: friend => {
        if (!friend) this.router.navigateByUrl('/not-found');
        this.friend = friend;
      }
    });
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
    this.messageService.setLastCompanion(this.friend.player.userName);
    this.router.navigateByUrl('/messenger');
  }
}
