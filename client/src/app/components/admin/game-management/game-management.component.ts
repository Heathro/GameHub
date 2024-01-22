import { Component, OnInit } from '@angular/core';

import { AdminService } from 'src/app/services/admin.service';
import { Pagination } from 'src/app/helpers/pagination';
import { Game } from 'src/app/models/game';

@Component({
  selector: 'app-game-management',
  templateUrl: './game-management.component.html',
  styleUrls: ['./game-management.component.css']
})
export class GameManagementComponent implements OnInit {
  games: Game[] = [];
  pagination: Pagination | undefined;
  loading = false;
  
  constructor(private adminService: AdminService) { }

  ngOnInit(): void {
    this.loadGames();
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
}
