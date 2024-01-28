import { Component, OnDestroy, OnInit } from '@angular/core';

import { AdminService } from 'src/app/services/admin.service';
import { Pagination } from 'src/app/helpers/pagination';
import { Game } from 'src/app/models/game';
import { Poster } from 'src/app/models/poster';

@Component({
  selector: 'app-game-management',
  templateUrl: './game-management.component.html',
  styleUrls: ['./game-management.component.css']
})
export class GameManagementComponent implements OnInit, OnDestroy {
  games: Game[] = [];
  pagination: Pagination | undefined;
  loading = false;
  gameUpdateSubscription;
  posterUpdatedSubscription;
  gameDeletedSubscription;
  gamesRefreshSubscription
  
  constructor(private adminService: AdminService) {
    this.gameUpdateSubscription = this.adminService.gameUpdated$.subscribe(
      game => this.gameUpdated(game)
    );
    this.posterUpdatedSubscription = this.adminService.posterUpdated$.subscribe(
      ({gameId, poster}) => this.posterUpdated(gameId, poster)
    );
    this.gameDeletedSubscription = this.adminService.gameDeleted$.subscribe(
      gameId => this.gameDeleted(gameId)
    );
    this.gamesRefreshSubscription = this.adminService.refreshGames$.subscribe(
      () => this.loadGames()
    );
  }

  ngOnInit(): void {
    this.loadGames();
  }

  ngOnDestroy(): void {
    this.gameUpdateSubscription.unsubscribe();
    this.posterUpdatedSubscription.unsubscribe();
    this.gameDeletedSubscription.unsubscribe();
    this.gamesRefreshSubscription.unsubscribe();
  }

  loadGames() {
    this.loading = true;
    this.adminService.getGamesForModeration().subscribe({
      next: response => {
        if (response.result && response.pagination) {
          this.games = response.result;
          this.pagination = response.pagination;
          this.loading = false;
        }
      }
    });
  }

  deleteGame(title: string) {
    this.adminService.deleteGame(title).subscribe({
      next: () => this.games = this.games.filter(g => g.title != title)
    });
  }

  pageChanged(event: any) {
    if (this.adminService.getGamesPaginationParams().currentPage !== event.page) {
      this.adminService.setGamesPaginationPage(event.page);
      this.loadGames();
    }
  }

  private gameUpdated(game: Game) {
    this.games.forEach(g => {
      if (g.id === game.id) this.adminService.updateGameData(g, game);
    });
  }
  
  private posterUpdated(gameId: number, poster: Poster) {
    this.games.forEach(g => {
      if (g.id === gameId) g.poster = poster;
    });
  }

  private gameDeleted(gameId: number) {
    this.games = this.games.filter(g => g.id !== gameId);
  }
}
