import { Component, OnDestroy, OnInit } from '@angular/core';

import { PlayersService } from 'src/app/services/players.service';
import { Pagination } from 'src/app/helpers/pagination';
import { Player } from 'src/app/models/player';
import { OrderType } from 'src/app/enums/orderType';
import { Avatar } from 'src/app/models/avatar';

@Component({
  selector: 'app-players-list',
  templateUrl: './players-list.component.html',
  styleUrls: ['./players-list.component.css']
})
export class PlayersListComponent implements OnInit, OnDestroy {
  players: Player[] = [];
  pagination: Pagination | undefined;
  loading = false;
  playerDeletedSubscription;
  avatarUpdatedSubscription;
  playersRefreshSubscription;

  constructor(private playersService: PlayersService) {
    this.playerDeletedSubscription = this.playersService.playerDeleted$.subscribe(
      ({userName, userId}) => this.playerDeleted(userId)
    );
    this.avatarUpdatedSubscription = this.playersService.avatarUpdated$.subscribe(
      ({userId, avatar}) => this.avatarUpdated(userId, avatar)
    );
    this.playersRefreshSubscription = this.playersService.refreshPlayers$.subscribe(
      () => this.loadPlayers()
    );
  }

  ngOnInit(): void {
    this.loadPlayers();
  }

  ngOnDestroy(): void {
    this.playerDeletedSubscription.unsubscribe();
    this.avatarUpdatedSubscription.unsubscribe();
    this.playersRefreshSubscription.unsubscribe();
  }

  loadPlayers() {
    this.loading = true;
    this.playersService.getPlayers().subscribe({
      next: response => {
        if (response.result && response.pagination) {
          this.players = response.result;
          this.pagination = {...response.pagination};
          this.loading = false;
        }
      }
    });
  }

  sortNewest() {
    this.sortPlayers(OrderType.newest);
  }

  sortOldest() {
    this.sortPlayers(OrderType.oldest);
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
  }

  pageChanged(event: any) {
    if (this.playersService.getPaginationParams().currentPage !== event.page) {
      this.playersService.setPaginationPage(event.page);
      this.loadPlayers();
    }
  }

  getSortingType() {
    switch (this.playersService.getPaginationParams().orderType) {
      case OrderType.za:             return 'Z&ensp;<i class="bi bi-arrow-right"></i>&ensp;A';
      case OrderType.az:             return 'A&ensp;<i class="bi bi-arrow-right"></i>&ensp;Z';
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
      case OrderType.oldest:         return '<i class="bi bi-hourglass-split"></i>&ensp;' + 
                                            '<i class="bi bi-arrow-right"></i>&ensp;' +
                                            '<i class="bi bi-hourglass"></i>';
      default:                       return '<i class="bi bi-hourglass"></i>&ensp;' + 
                                            '<i class="bi bi-arrow-right"></i>&ensp;' + 
                                            '<i class="bi bi-hourglass-split"></i>';
    }
  }

  private playerDeleted(userId: number) {
    this.players = this.players.filter(p => p.id !== userId);
  }
  
  private avatarUpdated(userId: number, avatar: Avatar) {
    this.players.forEach(p => {
      if (p.id === userId) p.avatar = avatar;
    });
  }
}
