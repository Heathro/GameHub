import { Component, OnInit } from '@angular/core';

import { Friend } from 'src/app/models/friend';
import { PlayersService } from 'src/app/services/players.service';

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
    this.playersService.getFriends().subscribe({
      next: friends => {
        this.friends = friends;
        this.loading = false;     
      }
    });
  }
}
