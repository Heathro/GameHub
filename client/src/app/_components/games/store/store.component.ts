import { Component, OnInit } from '@angular/core';

import { GamesService } from 'src/app/_services/games.service';
import { Game } from 'src/app/_models/game';

@Component({
  selector: 'app-store',
  templateUrl: './store.component.html',
  styleUrls: ['./store.component.css']
})
export class StoreComponent implements OnInit {
  games: Game[] = [];

  constructor(private gamesService: GamesService) { }

  ngOnInit(): void {
    this.loadGames();
  }

  loadGames() {
    this.gamesService.getGames().subscribe({
      next: games => this.games = games
    });
  }
}
