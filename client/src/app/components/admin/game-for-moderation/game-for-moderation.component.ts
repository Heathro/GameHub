import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { ConfirmService } from 'src/app/services/confirm.service';
import { Game } from 'src/app/models/game';

@Component({
  selector: 'app-game-for-moderation',
  templateUrl: './game-for-moderation.component.html',
  styleUrls: ['./game-for-moderation.component.css']
})
export class GameForModerationComponent implements OnInit {
  @Output() deleteGame = new EventEmitter<string>();  
  @Input() game: Game | undefined;

  constructor(private confirmService: ConfirmService) { }

  ngOnInit(): void {
  }

  deleteCurrentGame() {
    this.confirmService.confirm(
      'Delete Game',
      'Are you sure you want to delete ' + this.game?.title + '?',
      'Delete',
      'Cancel'
    ).subscribe({
      next: confirmed => {
        if (confirmed) {
          if (this.game) this.deleteGame.next(this.game.title);
        }
      }
    });    
  }
}
