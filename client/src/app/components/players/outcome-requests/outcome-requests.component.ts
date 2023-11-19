import { Component, OnInit } from '@angular/core';

import { Friend } from 'src/app/models/friend';
import { PlayersService } from 'src/app/services/players.service';
import { FriendRequestType } from 'src/app/helpers/friendRequestType';
import { FriendStatus } from 'src/app/helpers/friendStatus';

@Component({
  selector: 'app-outcome-requests',
  templateUrl: './outcome-requests.component.html',
  styleUrls: ['./outcome-requests.component.css']
})
export class OutcomeRequestsComponent implements OnInit {  
  friends: Friend[] = [];
  loading = false;

  constructor(private playersService: PlayersService) { }

  ngOnInit(): void {
    this.loadFriends();
  }

  loadFriends() {
    this.loading = true;
    this.playersService.getFriends(FriendStatus.pending, FriendRequestType.outcome).subscribe({
      next: friends => {
        this.friends = friends;
        this.loading = false;     
      }
    });
  }
}
