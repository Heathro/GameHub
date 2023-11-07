import { Component, Input, OnInit } from '@angular/core';

import { Game } from 'src/app/models/game';
import { GamesService } from 'src/app/services/games.service';

@Component({
  selector: 'app-game-card',
  templateUrl: './game-card.component.html',
  styleUrls: ['./game-card.component.css']
})
export class GameCardComponent implements OnInit {
  @Input() game: Game | undefined;
  isLiked = false;

  constructor(private gamesService: GamesService) { }

  ngOnInit(): void {
    this.checkLikes();
  }

  likeGame() {
    if (this.game) {
      this.gamesService.likeGame(this.game.id).subscribe({
        next: () => this.checkLikes()
      });
    }
  }

  checkLikes() {
    if (this.game) {
      this.isLiked = this.gamesService.isGameLiked(this.game);
    }
  }
}
