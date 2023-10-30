import { Component, OnInit } from '@angular/core';

import { Observable } from 'rxjs';

import { PlayersService } from 'src/app/services/players.service';
import { Player } from 'src/app/models/player';
import { Pagination, PaginationParams } from 'src/app/models/pagination';

@Component({
  selector: 'app-players-list',
  templateUrl: './players-list.component.html',
  styleUrls: ['./players-list.component.css']
})
export class PlayersListComponent implements OnInit {
  //players$: Observable<Player[]> | undefined;
  players: Player[] = [];
  pagination: Pagination | undefined;
  paginationParams: PaginationParams;

  constructor(private playersService: PlayersService) {
    this.paginationParams = new PaginationParams(1, 12);
  }

  ngOnInit(): void {
    //this.players$ = this.playersService.getPlayers();
    this.loadPlayers();
  }

  loadPlayers() {
    this.playersService.getPlayers(this.paginationParams).subscribe({
      next: response => {
        if (response.result && response.pagination) {
          this.players = response.result;
          this.pagination = response.pagination;
        }
      }
    });
  }

  pageChanged(event: any) {
    if (this.paginationParams.currentPage !== event.page) {
      this.paginationParams.currentPage = event.page;
      this.loadPlayers();
    }
  }
}
