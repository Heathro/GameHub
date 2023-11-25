import { Component, Input, OnInit } from '@angular/core';

import { Game } from 'src/app/models/game';

@Component({
  selector: 'app-game-card-mini',
  templateUrl: './game-card-mini.component.html',
  styleUrls: ['./game-card-mini.component.css']
})
export class GameCardMiniComponent implements OnInit {
  @Input() game: Game | undefined;

  constructor() { }

  ngOnInit(): void {
  }
}
