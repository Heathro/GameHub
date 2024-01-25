import { Component, OnDestroy, OnInit } from '@angular/core';

import { PlayersService } from 'src/app/services/players.service';
import { Player } from 'src/app/models/player';
import { Game } from 'src/app/models/game';

@Component({
  selector: 'app-friends-panel',
  templateUrl: './friends-panel.component.html',
  styleUrls: ['./friends-panel.component.css']
})
export class FriendsPanelComponent implements OnInit, OnDestroy {  
  activeFriends: Player[] = [];
  incomeRequests: Player[] = [];
  outcomeRequests: Player[] = [];
  loading = false;
  playerDeletedSubscription;
  friendshipRequestedSubscription;
  friendshipCancelledSubscription;
  friendshipAcceptedSubscription;

  constructor(private playersService: PlayersService) {
    this.playerDeletedSubscription = this.playersService.playerDeleted$.subscribe(
      username => this.playerDeleted(username)
    );
    this.friendshipRequestedSubscription = this.playersService.friendshipRequested$.subscribe(
      player => this.friendshipRequested(player)
    );
    this.friendshipCancelledSubscription = this.playersService.friendshipCancelled$.subscribe(
      player => this.friendshipCancelled(player)
    );
    this.friendshipAcceptedSubscription = this.playersService.friendshipAccepted$.subscribe(
      player => this.friendshipAccepted(player)
    );
  }

  ngOnInit(): void {
    this.loadFriends();
  }

  ngOnDestroy(): void {
    this.playerDeletedSubscription.unsubscribe();
    this.friendshipRequestedSubscription.unsubscribe();
    this.friendshipCancelledSubscription.unsubscribe();
    this.friendshipAcceptedSubscription.unsubscribe();
  }

  loadFriends() {
    this.loading = true;
    this.playersService.getFriends().subscribe({
      next: friends => {
        this.activeFriends = friends.activeFriends.slice();
        this.incomeRequests = friends.incomeRequests.slice();
        this.outcomeRequests = friends.outcomeRequests.slice();
        this.loading = false;
      }
    });
  }

  deleteActiveFriend(id: number) {
    this.activeFriends = this.activeFriends.filter(f => f.id !== id);
  }

  deleteIncomeRequest(id: number) {
    this.incomeRequests = this.incomeRequests.filter(f => f.id !== id);
  }

  deleteOutcomeRequest(id: number) {
    this.outcomeRequests = this.outcomeRequests.filter(f => f.id !== id);
  }

  private playerDeleted(username: string) {
    this.activeFriends = this.activeFriends.filter(f => f.userName !== username);
    this.incomeRequests = this.incomeRequests.filter(f => f.userName !== username);
    this.outcomeRequests = this.outcomeRequests.filter(f => f.userName !== username);
  }

  private friendshipRequested(player: Player) {
    this.incomeRequests.push(player);
  }

  private friendshipCancelled(player: Player) {
    this.activeFriends = this.activeFriends.filter(f => f.userName !== player.userName);
    this.incomeRequests = this.incomeRequests.filter(f => f.userName !== player.userName);
  }

  private friendshipAccepted(player: Player) {
    this.outcomeRequests = this.outcomeRequests.filter(f => f.userName !== player.userName);
    this.activeFriends.push(player);
  }
}
