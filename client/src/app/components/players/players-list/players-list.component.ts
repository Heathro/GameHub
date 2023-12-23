import { Component, OnInit } from '@angular/core';

import { PlayersService } from 'src/app/services/players.service';
import { Pagination } from 'src/app/helpers/pagination';
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
    this.sortPlayers(OrderType.az);
  }

  sortZA() {
    this.sortPlayers(OrderType.za);
  }

  sortMostReviewed() {
    this.sortPlayers(OrderType.mostReviewed);
  }

  sortLessReviewed() {
    this.sortPlayers(OrderType.lessReviewed);
  }

  sortMostPublicated() {
    this.sortPlayers(OrderType.mostPublicated);
  }

  sortLessPublicated() {
    this.sortPlayers(OrderType.lessPublicated);
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
      case OrderType.mostPublicated: return '<i class="bi bi-rocket-takeoff-fill"></i>&ensp;' + 
                                            '<i class="bi bi-arrow-right"></i>&ensp;' + 
                                            '<i class="bi bi-rocket-takeoff"></i>';
      case OrderType.lessPublicated: return '<i class="bi bi-rocket-takeoff"></i>&ensp;' + 
                                            '<i class="bi bi-arrow-right"></i>&ensp;' +
                                            '<i class="bi bi-rocket-takeoff-fill"></i>';
      case OrderType.mostReviewed:   return '<i class="bi bi-pen-fill"></i>&ensp;' + 
                                            '<i class="bi bi-arrow-right"></i>&ensp;' + 
                                            '<i class="bi bi-pen"></i>';
      case OrderType.lessReviewed:   return '<i class="bi bi-pen"></i>&ensp;' + 
                                            '<i class="bi bi-arrow-right"></i>&ensp;' +
                                            '<i class="bi bi-pen-fill"></i>';
      case OrderType.za:             return 'Z&ensp;<i class="bi bi-arrow-right"></i>&ensp;A';
      default:                       return 'A&ensp;<i class="bi bi-arrow-right"></i>&ensp;Z';
    }
  }
}
