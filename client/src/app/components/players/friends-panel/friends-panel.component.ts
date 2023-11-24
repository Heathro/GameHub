import { Component, OnInit } from '@angular/core';

import { PlayersService } from 'src/app/services/players.service';
import { Player } from 'src/app/models/player';

@Component({
  selector: 'app-friends-panel',
  templateUrl: './friends-panel.component.html',
  styleUrls: ['./friends-panel.component.css']
})
export class FriendsPanelComponent implements OnInit {  
  activeFriends: Player[] = [];
  incomeRequests: Player[] = [];
  outcomeRequests: Player[] = [];

  constructor(private playersService: PlayersService) { }

  ngOnInit(): void {
    this.loadFriends();
  }

  loadFriends() {
    this.playersService.getFriends().subscribe({
      next: friends => {
        this.activeFriends = friends.activeFriends;
        this.incomeRequests = friends.incomeRequests;
        this.outcomeRequests = friends.outcomeRequests;
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
}
