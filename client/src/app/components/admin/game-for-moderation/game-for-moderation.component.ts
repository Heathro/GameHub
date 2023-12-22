import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { Game } from 'src/app/models/game';

@Component({
  selector: 'app-game-for-moderation',
  templateUrl: './game-for-moderation.component.html',
  styleUrls: ['./game-for-moderation.component.css']
})
export class GameForModerationComponent implements OnInit {
  @Output() deleteGame = new EventEmitter<string>();  
  @Input() game: Game | undefined;

  constructor() { }

  ngOnInit(): void {
  }

  deleteCurrentGame() {
    if (this.game) this.deleteGame.next(this.game.title);
  }
}
