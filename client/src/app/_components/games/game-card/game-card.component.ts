import { Component, Input, OnInit } from '@angular/core';

import { Title } from 'src/app/_models/title';

@Component({
  selector: 'app-game-card',
  templateUrl: './game-card.component.html',
  styleUrls: ['./game-card.component.css']
})
export class GameCardComponent implements OnInit {
  @Input() title: Title | undefined;

  constructor() { }

  ngOnInit(): void {
  }
}
