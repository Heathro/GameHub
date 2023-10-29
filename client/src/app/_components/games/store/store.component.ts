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
  pageNumber = 1;
  pageSize = 1;

  constructor(private gamesService: GamesService) { }

  ngOnInit(): void {
    //this.games$ = this.gamesService.getGames();
    this.loadGames();
  }

  loadGames() {
    this.gamesService.getGames(this.pageNumber, this.pageSize).subscribe({
      next: response => {
        if (response.result && response.pagination) {
          this.games = response.result;
          this.pagination = response.pagination;
        }
      }
    });
  }

  pageChanged(event: any) {
    if (this.pageNumber !== event.page) {
      this.pageNumber = event.page;
      this.loadGames();
    }
  }
}
