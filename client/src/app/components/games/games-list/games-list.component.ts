import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { GamesService } from 'src/app/services/games.service';
import { Game } from 'src/app/models/game';
import { Pagination } from 'src/app/models/pagination';
import { OrderType } from 'src/app/helpers/orderType';

@Component({
  selector: 'app-store',
  templateUrl: './games-list.component.html',
  styleUrls: ['./games-list.component.css']
})
export class GamesListComponent implements OnInit {
  games: Game[] = [];
  pagination: Pagination | undefined;
  filterForm: FormGroup = new FormGroup({});
  loading = false;

  constructor(private gamesService: GamesService, private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.initializeFrom(true);
    this.loadGames();
  }

  loadGames() {
    this.loading = true;
    this.gamesService.getGames(this.filterForm.value).subscribe({
      next: response => {
        if (response.result && response.pagination) {
          this.games = response.result;
          this.pagination = response.pagination;
          this.loading = false;
        }
      }
    });
  }

  sortAZ() {
    this.sortGames(OrderType.AZ);
  }

  sortZA() {
    this.sortGames(OrderType.ZA);
  }
  
  sortGames(orderType: OrderType) {
    this.gamesService.setPaginationPage(1);
    this.gamesService.setPaginationOrder(orderType);
    this.loadGames();
    if (this.pagination) this.pagination.currentPage = 1;
  }

  pageChanged(event: any) {
    if (this.gamesService.getPaginationParams().currentPage !== event.page) {
      this.gamesService.setPaginationPage(event.page);
      this.loadGames();
    }
  }

  applyFilters() {
    this.gamesService.setPaginationPage(1);
    this.gamesService.setFilter(this.filterForm.value);
    this.loadGames();
    if (this.pagination) this.pagination.currentPage = 1;
  }

  resetFilters() {
    this.initializeFrom(false);
    this.applyFilters();
  }

  getSortingType() {
    switch (this.gamesService.getPaginationParams().orderType) {
      case OrderType.ZA: return 'Z&ensp;<i class="bi bi-arrow-right"></i>&ensp;A';
      default:           return 'A&ensp;<i class="bi bi-arrow-right"></i>&ensp;Z';
    }
  }
  
  initializeFrom(initial: boolean) {
    const filter = this.gamesService.getFilter();

    this.filterForm = this.formBuilder.group({
      categories: this.formBuilder.group({
        published: [filter && initial ? filter.categories.published : false, { nonNullable: true }],
        bookmarked: [filter && initial ? filter.categories.bookmarked : false, { nonNullable: true }],
        liked: [filter && initial ? filter.categories.liked : false, { nonNullable: true }]
      }),
      platforms: this.formBuilder.group({
        windows: [filter && initial ? filter.platforms.windows : false, { nonNullable: true }],
        macos: [filter && initial ? filter.platforms.macos : false, { nonNullable: true }],
        linux: [filter && initial ? filter.platforms.linux : false, { nonNullable: true }]
      }),
      genres: this.formBuilder.group({
        action: [filter && initial ? filter.genres.action : false, { nonNullable: true }],
        adventure: [filter && initial ? filter.genres.adventure : false, { nonNullable: true }],
        card: [filter && initial ? filter.genres.card : false, { nonNullable: true }],
        educational: [filter && initial ? filter.genres.educational : false, { nonNullable: true }],
        fighting: [filter && initial ? filter.genres.fighting : false, { nonNullable: true }],
        horror: [filter && initial ? filter.genres.horror : false, { nonNullable: true }],
        platformer: [filter && initial ? filter.genres.platformer : false, { nonNullable: true }],
        puzzle: [filter && initial ? filter.genres.puzzle : false, { nonNullable: true }],
        racing: [filter && initial ? filter.genres.racing : false, { nonNullable: true }],
        rhythm: [filter && initial ? filter.genres.rhythm : false, { nonNullable: true }],
        roleplay: [filter && initial ? filter.genres.roleplay : false, { nonNullable: true }],
        shooter: [filter && initial ? filter.genres.shooter : false, { nonNullable: true }],
        simulation: [filter && initial ? filter.genres.simulation : false, { nonNullable: true }],
        sport: [filter && initial ? filter.genres.sport : false, { nonNullable: true }],
        stealth: [filter && initial ? filter.genres.stealth : false, { nonNullable: true }],
        strategy: [filter && initial ? filter.genres.strategy : false, { nonNullable: true }],
        survival: [filter && initial ? filter.genres.survival : false, { nonNullable: true }]
      })
    });
  }
}
