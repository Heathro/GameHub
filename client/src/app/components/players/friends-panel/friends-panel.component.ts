import { Component, OnDestroy, OnInit } from '@angular/core';

import { PlayersService } from 'src/app/services/players.service';
import { Player } from 'src/app/models/player';
import { Avatar } from 'src/app/models/avatar';

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
  avatarUpdatedSubscription;
  friendshipRequestedSubscription;
  friendshipCancelledSubscription;
  friendshipAcceptedSubscription;

  constructor(private playersService: PlayersService) {
    this.playerDeletedSubscription = this.playersService.playerDeleted$.subscribe(
      ({userName, userId}) => this.playerDeleted(userId)
    );
    this.avatarUpdatedSubscription = this.playersService.avatarUpdated$.subscribe(
      ({userId, avatar}) => this.avatarUpdated(userId, avatar)
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
    this.avatarUpdatedSubscription.unsubscribe();
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

  private playerDeleted(userId: number) {
    this.activeFriends = this.activeFriends.filter(f => f.id !== userId);
    this.incomeRequests = this.incomeRequests.filter(f => f.id !== userId);
    this.outcomeRequests = this.outcomeRequests.filter(f => f.id !== userId);
  }
  
  private avatarUpdated(userId: number, avatar: Avatar) {
    this.activeFriends.forEach(p => {
      if (p.id === userId) p.avatar = avatar;
    });
    this.incomeRequests.forEach(p => {
      if (p.id === userId) p.avatar = avatar;
    });
    this.outcomeRequests.forEach(p => {
      if (p.id === userId) p.avatar = avatar;
    });
  }

  private friendshipRequested(player: Player) {
    this.incomeRequests.push(player);
  }

  private friendshipCancelled(player: Player) {
    this.activeFriends = this.activeFriends.filter(f => f.id !== player.id);
    this.incomeRequests = this.incomeRequests.filter(f => f.id !== player.id);
  }

  private friendshipAccepted(player: Player) {
    this.outcomeRequests = this.outcomeRequests.filter(f => f.id !== player.id);
    this.activeFriends.push(player);
  }
}
