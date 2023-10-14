import { Component, OnInit } from '@angular/core';

import { PlayersService } from 'src/app/_services/players.service';
import { Player } from 'src/app/_models/player';

@Component({
  selector: 'app-players-list',
  templateUrl: './players-list.component.html',
  styleUrls: ['./players-list.component.css']
})
export class PlayersListComponent implements OnInit {
  players: Player[] = [];
  constructor(private playersService: PlayersService) { }

  ngOnInit(): void {
    this.loadPlayers();
  }

  loadPlayers() {
    this.playersService.getPlayers().subscribe({
      next: players => this.players = players
    });
  }
}
