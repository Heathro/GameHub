import { Component, OnInit } from '@angular/core';

import { PlayersService } from 'src/app/services/players.service';
import { Friend } from 'src/app/models/friend';
import { FriendStatus } from 'src/app/helpers/friendStatus';
import { FriendRequestType } from 'src/app/helpers/friendRequestType';

@Component({
  selector: 'app-friends-list',
  templateUrl: './friends-list.component.html',
  styleUrls: ['./friends-list.component.css']
})
export class FriendsListComponent implements OnInit {  
  friends: Friend[] = [];
  loading = false;

  constructor(private playersService: PlayersService) { }

  ngOnInit(): void {
    this.loadFriends();
  }

  loadFriends() {
    this.loading = true;
    this.playersService.getFriends(FriendStatus.active, FriendRequestType.all).subscribe({
      next: friends => {
        this.friends = friends;
        this.loading = false;     
      }
    });
  }
}
