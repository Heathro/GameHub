import { Component, OnInit } from '@angular/core';

import { Observable } from 'rxjs';

import { GamesService } from 'src/app/_services/games.service';
import { Game } from 'src/app/_models/game';
import { Pagination } from 'src/app/_models/pagination';

@Component({
  selector: 'app-store',
  templateUrl: './store.component.html',
  styleUrls: ['./store.component.css']
})
export class StoreComponent implements OnInit {
  //games$: Observable<Game[]> | undefined;
  games: Game[] = [];
  pagination: Pagination | undefined;
  currentPage = 1;
  itemsPerPage = 2;

  constructor(private gamesService: GamesService) { }

  ngOnInit(): void {
    //this.games$ = this.gamesService.getGames();
    this.loadGames();
  }

  loadGames() {
    this.gamesService.getGames(this.currentPage, this.itemsPerPage).subscribe({
      next: response => {
        if (response.result && response.pagination) {
          this.games = response.result;
          this.pagination = response.pagination;
        }
      }
    });
  }

  pageChanged(event: any) {
    if (this.currentPage !== event.page) {
      this.currentPage = event.page;
      this.loadGames();
    }
  }
}
