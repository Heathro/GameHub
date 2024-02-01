import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { BasicFunctions } from 'src/app/helpers/basicFunctions';
import { Pagination } from 'src/app/helpers/pagination';
import { OrderType } from 'src/app/enums/orderType';
import { GamesService } from 'src/app/services/games.service';
import { PlayersService } from 'src/app/services/players.service';
import { Game } from 'src/app/models/game';
import { Poster } from 'src/app/models/poster';

@Component({
  selector: 'app-store',
  templateUrl: './games-list.component.html',
  styleUrls: ['./games-list.component.css']
})
export class GamesListComponent implements OnInit, OnDestroy {
  games: Game[] = [];
  pagination: Pagination | undefined;
  filterForm: FormGroup = new FormGroup({});
  currentFilter: any;
  initialFilter: any;
  loading = false;
  playerDeletedSubscription;
  gameUpdatedSubscription;
  gameDeletedSubscription;
  gameLikedSubscription;
  gameUnlikedSubscription;
  posterUpdatedSubscription;
  gamesRefreshSubscription;

  constructor(
    private gamesService: GamesService,
    private playersService: PlayersService,
    private formBuilder: FormBuilder
  ) {
    this.playerDeletedSubscription = this.playersService.playerDeleted$.subscribe(
      ({userName, userId}) => this.playerDeleted(userId)
    );
    this.gameUpdatedSubscription = this.gamesService.gameUpdated$.subscribe(
      game => this.gameUpdated(game)
    );
    this.gameDeletedSubscription = this.gamesService.gameDeleted$.subscribe(
      gameId => this.gameDeleted(gameId)
    );
    this.gameLikedSubscription = this.gamesService.gameLiked$.subscribe(
      ({gameId, playerId}) => this.gameLiked(gameId, playerId)
    );
    this.gameUnlikedSubscription = this.gamesService.gameUnliked$.subscribe(
      ({gameId, playerId}) => this.gameUnliked(gameId, playerId)
    );
    this.posterUpdatedSubscription = this.gamesService.posterUpdated$.subscribe(
      ({gameId, poster}) => this.posterUpdated(gameId, poster)
    );
    this.gamesRefreshSubscription = this.gamesService.refreshGames$.subscribe(
      () => this.loadGames()
    );
  }

  ngOnInit(): void {
    this.initializeFrom(true);
    this.gamesService.setFilter(this.filterForm.value);
    this.loadGames();
  }

  ngOnDestroy(): void {
    this.playerDeletedSubscription.unsubscribe();
    this.gameUpdatedSubscription.unsubscribe();
    this.gameDeletedSubscription.unsubscribe();
    this.gameLikedSubscription.unsubscribe();
    this.gameUnlikedSubscription.unsubscribe();
    this.posterUpdatedSubscription.unsubscribe();
    this.gamesRefreshSubscription.unsubscribe();
  }

  loadGames() {
    this.loading = true;
    this.gamesService.getGames().subscribe({
      next: response => {
        if (response.result && response.pagination) {
          this.games = response.result;
          this.pagination = {...response.pagination};
          this.loading = false;
        }
      }
    });
  }

  sortAZ() {
    this.sortGames(OrderType.az);
  }

  sortZA() {
    this.sortGames(OrderType.za);
  }

  sortNewest() {
    this.sortGames(OrderType.newest);
  }

  sortOldest() {
    this.sortGames(OrderType.oldest);
  }

  sortMostLiked() {
    this.sortGames(OrderType.mostLiked);
  }

  sortLessLiked() {
    this.sortGames(OrderType.lessLiked);
  }

  sortMostReviewed() {
    this.sortGames(OrderType.mostReviewed);
  }

  sortLessReviewed() {
    this.sortGames(OrderType.lessReviewed);
  }
  
  sortGames(orderType: OrderType) {
    this.gamesService.setPaginationPage(1);
    this.gamesService.setPaginationOrder(orderType);
    this.loadGames();
  }

  getSortingType() {
    switch (this.gamesService.getPaginationParams().orderType) {  
      case OrderType.mostReviewed: return '<i class="bi bi-pen-fill"></i>&ensp;' + 
                                          '<i class="bi bi-arrow-right"></i>&ensp;' + 
                                          '<i class="bi bi-pen"></i>';
      case OrderType.lessReviewed: return '<i class="bi bi-pen"></i>&ensp;' + 
                                          '<i class="bi bi-arrow-right"></i>&ensp;' +
                                          '<i class="bi bi-pen-fill"></i>';
      case OrderType.mostLiked:    return '<i class="bi bi-hand-thumbs-up-fill"></i>&ensp;' + 
                                          '<i class="bi bi-arrow-right"></i>&ensp;' + 
                                          '<i class="bi bi-hand-thumbs-up"></i>';
      case OrderType.lessLiked:    return '<i class="bi bi-hand-thumbs-up"></i>&ensp;' + 
                                          '<i class="bi bi-arrow-right"></i>&ensp;' +
                                          '<i class="bi bi-hand-thumbs-up-fill"></i>';
      case OrderType.newest:       return '<i class="bi bi-hourglass"></i>&ensp;' + 
                                          '<i class="bi bi-arrow-right"></i>&ensp;' + 
                                          '<i class="bi bi-hourglass-split"></i>';
      case OrderType.oldest:       return '<i class="bi bi-hourglass-split"></i>&ensp;' + 
                                          '<i class="bi bi-arrow-right"></i>&ensp;' +
                                          '<i class="bi bi-hourglass"></i>';
      case OrderType.za:           return 'Z&ensp;<i class="bi bi-arrow-right"></i>&ensp;A';
      default:                     return 'A&ensp;<i class="bi bi-arrow-right"></i>&ensp;Z';
    }
  }

  isFilterChanged() {
    return !BasicFunctions.deepEqual(this.currentFilter, this.filterForm.value);
  }

  isFilterInitial() {
    return BasicFunctions.deepEqual(this.initialFilter, this.filterForm.value);
  }

  applyFilters() {
    this.gamesService.setPaginationPage(1);
    this.gamesService.setFilter(this.filterForm.value);
    this.currentFilter = this.filterForm.value;
    this.loadGames();
  }

  resetFilters() {
    this.initializeFrom(false);
    this.applyFilters();
  }

  pageChanged(event: any) {
    if (this.gamesService.getPaginationParams().currentPage !== event.page) {
      this.gamesService.setPaginationPage(event.page);
      this.loadGames();
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

    this.currentFilter = this.filterForm.value;

    this.initialFilter = {
      categories: {
        published: false,
        bookmarked: false,
        liked: false
      },
      platforms: {
        windows: false,
        macos: false,
        linux: false
      },
      genres: {
        action: false,
        adventure: false,
        card: false,
        educational: false,
        fighting: false,
        horror: false,
        platformer: false,
        puzzle: false,
        racing: false,
        rhythm: false,
        roleplay: false,
        shooter: false,
        simulation: false,
        sport: false,
        stealth: false,
        strategy: false,
        survival: false
      }
    };
  }

  private playerDeleted(userId: number) {
    this.games.forEach(g => {
      g.likes = g.likes.filter(l => l !== userId);
    });
  }

  private gameUpdated(game: Game) {
    this.games.forEach(g => {
      if (g.id === game.id) this.gamesService.updateGameData(g, game);
    });
  }

  private gameDeleted(gameId: number) {
    this.games = this.games.filter(g => g.id !== gameId);
  }

  private gameLiked(gameId: number, playerId: number) {
    this.games.forEach((g: Game) => {
      if (g.id === gameId && !g.likes.includes(playerId)) g.likes.push(playerId);
    });
  }
  
  private gameUnliked(gameId: number, playerId: number) {
    this.games.forEach((g: Game) => {
      if (g.id === gameId) g.likes = g.likes.filter(l => l !== playerId);
    });
  }
  
  private posterUpdated(gameId: number, poster: Poster) {
    this.games.forEach(g => {
      if (g.id === gameId) g.poster = poster;
    });
  }
}
