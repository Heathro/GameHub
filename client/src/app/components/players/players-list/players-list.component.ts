import { Component, OnInit } from '@angular/core';

import { PlayersService } from 'src/app/services/players.service';
import { Pagination } from 'src/app/models/pagination';
import { Player } from 'src/app/models/player';
import { OrderType } from 'src/app/helpers/orderType';

@Component({
  selector: 'app-players-list',
  templateUrl: './players-list.component.html',
  styleUrls: ['./players-list.component.css']
})
export class PlayersListComponent implements OnInit {
  players: Player[] = [];
  pagination: Pagination | undefined;
  loading = false;

  constructor(private playersService: PlayersService) { }

  ngOnInit(): void {
    this.loadPlayers();
  }

  loadPlayers() {
    this.loading = true;
    this.playersService.getPlayers().subscribe({
      next: response => {
        if (response.result && response.pagination) {
          this.players = response.result;
          this.pagination = response.pagination;
          this.loading = false;
        }
      }
    });
  }

  sortAZ() {
    this.sortPlayers(OrderType.AZ);
  }

  sortZA() {
    this.sortPlayers(OrderType.ZA);
  }

  sortPlayers(orderType: OrderType) {
    this.playersService.setPaginationPage(1);
    this.playersService.setPaginationOrder(orderType);
    this.loadPlayers();
    if (this.pagination) this.pagination.currentPage = 1;
  }

  pageChanged(event: any) {
    if (this.playersService.getPaginationParams().currentPage !== event.page) {
      this.playersService.setPaginationPage(event.page);
      this.loadPlayers();
    }
  }  

  getSortingType() {
    switch (this.playersService.getPaginationParams().orderType) {
      case OrderType.ZA: return 'Z&ensp;<i class="bi bi-arrow-right"></i>&ensp;A';
      default:           return 'A&ensp;<i class="bi bi-arrow-right"></i>&ensp;Z';
    }
  }
}
