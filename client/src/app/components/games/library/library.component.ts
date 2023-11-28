import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { GamesService } from 'src/app/services/games.service';
import { Pagination } from 'src/app/models/pagination';
import { Game } from 'src/app/models/game';

@Component({
  selector: 'app-library',
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.css']
})
export class LibraryComponent implements OnInit {
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
    this.gamesService.getBookmarkedGames(this.filterForm.value).subscribe({
      next: response => {
        if (response.result && response.pagination) {
          this.games = response.result;
          this.pagination = response.pagination;
          this.loading = false;
        }
      }
    });
  }
  
  sortGames(order: string) {
    this.gamesService.setLibraryPaginationPage(1);
    this.gamesService.setLibraryPaginationOrder(order);
    this.loadGames();
    if (this.pagination) this.pagination.currentPage = 1;
  }

  pageChanged(event: any) {
    if (this.gamesService.getLibraryPaginationParams().currentPage !== event.page) {
      this.gamesService.setLibraryPaginationPage(event.page);
      this.loadGames();
    }
  }

  applyFilters() {
    this.gamesService.setLibraryPaginationPage(1);
    this.gamesService.setLibraryFilter(this.filterForm.value);
    this.loadGames();
    if (this.pagination) this.pagination.currentPage = 1;
  }

  resetFilters() {
    this.initializeFrom(false);
    this.applyFilters();
  }

  getSortingType() {
    switch (this.gamesService.getLibraryPaginationParams().orderBy) {
      case 'za': return 'Z&ensp;<i class="bi bi-arrow-right"></i>&ensp;A';
      default:   return 'A&ensp;<i class="bi bi-arrow-right"></i>&ensp;Z';
    }
  }
  
  initializeFrom(initial: boolean) {
    const filter = this.gamesService.getLibraryFilter();

    this.filterForm = this.formBuilder.group({
      platforms: this.formBuilder.group({
        windows: [filter && initial ? filter.platforms.windows : false, { nonNullable: true }],
        macos: [filter && initial ? filter?.platforms.macos : false, { nonNullable: true }],
        linux:  [filter && initial ? filter?.platforms.linux : false, { nonNullable: true }]
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
