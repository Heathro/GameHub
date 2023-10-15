import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Title } from 'src/app/_models/title';

import { GamesService } from 'src/app/_services/games.service';

@Component({
  selector: 'app-game-page',
  templateUrl: './game-page.component.html',
  styleUrls: ['./game-page.component.css']
})
export class GamePageComponent implements OnInit {
  title: Title | undefined;

  constructor(private gamesService: GamesService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.loadTitle();
  }

  loadTitle() {
    const title = this.route.snapshot.paramMap.get('title');
    if (!title) return;
    this.gamesService.getGame(title).subscribe({
      next: title => this.title = title
    });
  }
}
