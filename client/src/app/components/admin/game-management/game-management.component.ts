import { Component, OnDestroy, OnInit } from '@angular/core';

import { Pagination } from 'src/app/helpers/pagination';
import { AdminService } from 'src/app/services/admin.service';
import { GamesService } from 'src/app/services/games.service';
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
  gameDeletedSubscription;
  posterUpdatedSubscription;
  gamesRefreshSubscription
  
  constructor(private adminService: AdminService, private gamesService: GamesService) {
    this.gameUpdateSubscription = this.gamesService.gameUpdated$.subscribe(
      game => this.gameUpdated(game)
    );
    this.gameDeletedSubscription = this.gamesService.gameDeleted$.subscribe(
      gameId => this.gameDeleted(gameId)
    );
    this.posterUpdatedSubscription = this.gamesService.posterUpdated$.subscribe(
      ({gameId, poster}) => this.posterUpdated(gameId, poster)
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
    this.gameDeletedSubscription.unsubscribe();
    this.posterUpdatedSubscription.unsubscribe();
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
      next: () => this.games = this.games.filter(g => g.title !== title)
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

  private gameDeleted(gameId: number) {
    this.games = this.games.filter(g => g.id !== gameId);
  }
  
  private posterUpdated(gameId: number, poster: Poster) {
    this.games.forEach(g => {
      if (g.id === gameId) g.poster = poster;
    });
  }
}
