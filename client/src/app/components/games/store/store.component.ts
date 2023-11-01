import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { Observable } from 'rxjs';

import { GamesService } from 'src/app/services/games.service';
import { Game } from 'src/app/models/game';
import { Pagination, PaginationParams } from 'src/app/models/pagination';

@Component({
  selector: 'app-store',
  templateUrl: './store.component.html',
  styleUrls: ['./store.component.css']
})
export class StoreComponent implements OnInit {
  //games$: Observable<Game[]> | undefined;
  games: Game[] = [];
  pagination: Pagination | undefined;
  paginationParams: PaginationParams;
  filterForm: FormGroup = new FormGroup({});
  loading = false;

  constructor(private gamesService: GamesService, private formBuilder: FormBuilder) { 
    this.paginationParams = new PaginationParams(4, 'az');
  }

  ngOnInit(): void {
    //this.games$ = this.gamesService.getGames();
    this.initializeFrom();
    this.loadGames();
  }

  loadGames() {
    this.loading = true;
    this.gamesService.getGames(this.filterForm.value, this.paginationParams).subscribe({
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
    this.resetPagination();
    this.paginationParams.orderBy = order;
    this.loadGames();
  }

  pageChanged(event: any) {
    if (this.paginationParams.currentPage !== event.page) {
      this.paginationParams.currentPage = event.page;
      this.loadGames();
    }
  }

  applyFilters() {
    this.resetPagination();
    this.loadGames();
  }

  resetFilters() {
    this.filterForm.reset();
    this.applyFilters();
  }

  resetPagination() {
    if (this.pagination) this.pagination.currentPage = 1;
    this.paginationParams.currentPage = 1;
  }
  
  initializeFrom() {
    this.filterForm = this.formBuilder.group({
      platforms: this.formBuilder.group({
        windows: [false, { nonNullable: true }],
        macos: [false, { nonNullable: true }],
        linux:  [false, { nonNullable: true }]
      }),
      genres: this.formBuilder.group({
        action: [false, { nonNullable: true }],
        adventure: [false, { nonNullable: true }],
        card: [false, { nonNullable: true }],
        educational: [false, { nonNullable: true }],
        fighting: [false, { nonNullable: true }],
        horror: [false, { nonNullable: true }],
        platformer: [false, { nonNullable: true }],
        puzzle: [false, { nonNullable: true }],
        racing: [false, { nonNullable: true }],
        rhythm: [false, { nonNullable: true }],
        roleplay: [false, { nonNullable: true }],
        shooter: [false, { nonNullable: true }],
        simulation: [false, { nonNullable: true }],
        sport: [false, { nonNullable: true }],
        stealth: [false, { nonNullable: true }],
        strategy: [false, { nonNullable: true }],
        survival: [false, { nonNullable: true }]
      })
    });
  }
}
