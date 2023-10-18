import { Component, OnInit } from '@angular/core';

import { Observable } from 'rxjs';

import { GamesService } from 'src/app/_services/games.service';
import { Game } from 'src/app/_models/game';

@Component({
  selector: 'app-store',
  templateUrl: './store.component.html',
  styleUrls: ['./store.component.css']
})
export class StoreComponent implements OnInit {
  games$: Observable<Game[]> | undefined;

  constructor(private gamesService: GamesService) { }

  ngOnInit(): void {
    this.games$ = this.gamesService.getGames();
  }
}
