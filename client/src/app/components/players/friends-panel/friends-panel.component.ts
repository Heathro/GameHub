import { Component, OnDestroy, OnInit } from '@angular/core';

import { PlayersService } from 'src/app/services/players.service';
import { Player } from 'src/app/models/player';

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

  constructor(private playersService: PlayersService) {
    this.playerDeletedSubscription = this.playersService.playerDeleted$.subscribe(
      username => this.playerDeleted(username)
    );
  }

  ngOnInit(): void {
    this.loadFriends();
  }

  ngOnDestroy(): void {
    this.playerDeletedSubscription.unsubscribe();
  }

  loadFriends() {
    this.loading = true;
    this.playersService.getFriends().subscribe({
      next: friends => {
        this.activeFriends = friends.activeFriends;
        this.incomeRequests = friends.incomeRequests;
        this.outcomeRequests = friends.outcomeRequests;
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
}
