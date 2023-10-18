import { Component, OnInit } from '@angular/core';

import { Observable } from 'rxjs';

import { PlayersService } from 'src/app/_services/players.service';
import { Player } from 'src/app/_models/player';

@Component({
  selector: 'app-players-list',
  templateUrl: './players-list.component.html',
  styleUrls: ['./players-list.component.css']
})
export class PlayersListComponent implements OnInit {
  players$: Observable<Player[]> | undefined;

  constructor(private playersService: PlayersService) { }

  ngOnInit(): void {
    this.players$ = this.playersService.getPlayers();
  }
}
