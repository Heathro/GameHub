import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { TabsModule } from 'ngx-bootstrap/tabs';
import { GalleryItem, GalleryModule, ImageItem } from 'ng-gallery';

import { GamesService } from 'src/app/_services/games.service';
import { Game } from 'src/app/_models/game';

@Component({
  selector: 'app-game-page',
  standalone: true,
  templateUrl: './game-page.component.html',
  styleUrls: ['./game-page.component.css'],
  imports: [ CommonModule, TabsModule, GalleryModule, RouterModule ]
})
export class GamePageComponent implements OnInit {
  game: Game | undefined;
  screenshots: GalleryItem[] = [];

  constructor(private gamesService: GamesService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.loadGame();
  }

  loadGame() {
    const title = this.route.snapshot.paramMap.get('title');
    if (!title) return;
    this.gamesService.getGame(title).subscribe({
      next: game => {
        if (!game) this.router.navigateByUrl('/not-found');
        this.game = game;
        this.getScreenshots();
      } 
    });
  }

  getScreenshots() {
    if (!this.game) return;
    for (const screenshot of this.game.screenshots) {
      this.screenshots.push(new ImageItem({ src: screenshot.url, thumb: screenshot.url }));
    }
  }
}
