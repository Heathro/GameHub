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

  constructor(private playersService: PlayersService) {
    //this.paginationParams = playersService.getPaginationParams();
  }

  ngOnInit(): void {
    //this.players$ = this.playersService.getPlayers();
    this.loadPlayers();
  }

  loadPlayers() {
    //this.playersService.setPaginationParams(this.paginationParams);
    this.playersService.getPlayers().subscribe({
      next: response => {
        if (response.result && response.pagination) {
          this.players = response.result;
          this.pagination = response.pagination;
        }
      }
    });
  }

  sortPlayers(order: string) {
    this.playersService.setPaginationPage(1);
    this.playersService.setPaginationOrder(order);
    this.loadPlayers();
    if (this.pagination) this.pagination.currentPage = 1;
  }

  pageChanged(event: any) {
    if (this.playersService.getPaginationParams().currentPage !== event.page) {
      this.playersService.setPaginationPage(event.page);
      this.loadPlayers();
    }
  }
}
