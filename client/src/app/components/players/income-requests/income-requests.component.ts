import { Component, OnInit } from '@angular/core';

import { PlayersService } from 'src/app/services/players.service';
import { Friend } from 'src/app/models/friend';
import { FriendStatus } from 'src/app/helpers/friendStatus';
import { FriendRequestType } from 'src/app/helpers/friendRequestType';

@Component({
  selector: 'app-income-requests',
  templateUrl: './income-requests.component.html',
  styleUrls: ['./income-requests.component.css']
})
export class IncomeRequestsComponent implements OnInit {  
  friends: Friend[] = [];
  loading = false;

  constructor(private playersService: PlayersService) { }

  ngOnInit(): void {
    this.loadFriends();
  }

  loadFriends() {
    this.loading = true;
    this.playersService.getFriends(FriendStatus.pending, FriendRequestType.income).subscribe({
      next: friends => {
        this.friends = friends;
        this.loading = false;     
      }
    });
  }
}
