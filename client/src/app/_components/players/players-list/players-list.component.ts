import { Component, OnInit } from '@angular/core';

import { Observable } from 'rxjs';

import { PlayersService } from 'src/app/_services/players.service';
import { Player } from 'src/app/_models/player';
import { Pagination } from 'src/app/_models/pagination';

@Component({
  selector: 'app-players-list',
  templateUrl: './players-list.component.html',
  styleUrls: ['./players-list.component.css']
})
export class PlayersListComponent implements OnInit {
  //players$: Observable<Player[]> | undefined;
  players: Player[] = [];
  pagination: Pagination | undefined;
  pageNumber = 1;
  pageSize = 5;

  constructor(private playersService: PlayersService) { }

  ngOnInit(): void {
    //this.players$ = this.playersService.getPlayers();
    this.loadPlayers();
  }

  loadPlayers() {
    this.playersService.getPlayers(this.pageNumber, this.pageSize).subscribe({
      next: response => {
        if (response.result && response.pagination) {
          this.players = response.result;
          this.pagination = response.pagination;
        }
      }
    });
  }

  pageChanged(event: any) {
    if (this.pageNumber !== event.page) {
      this.pageNumber = event.page;
      this.loadPlayers();
    }
  }
}
