import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { TabsModule } from 'ngx-bootstrap/tabs';
import { GalleryItem, GalleryModule, ImageItem } from 'ng-gallery';

import { GamesService } from 'src/app/services/games.service';
import { Game } from 'src/app/models/game';
import { Review } from 'src/app/models/review';
import { ReviewsService } from 'src/app/services/reviews.service';
import { GameReviewComponent } from '../../reviews/game-review/game-review.component';

@Component({
  selector: 'app-game-page',
  standalone: true,
  templateUrl: './game-page.component.html',
  styleUrls: ['./game-page.component.css'],
  imports: [ CommonModule, TabsModule, GalleryModule, RouterModule, GameReviewComponent ]
})
export class GamePageComponent implements OnInit {
  game: Game | undefined;
  screenshots: GalleryItem[] = [];
  reviews: Review[] = [];
  isLiked = false;
  isPublished = false;
  isBookmarked = false;

  constructor(
    private gamesService: GamesService,
    private reviewsService: ReviewsService,
    private route: ActivatedRoute, 
    private router: Router
  ) { }

  ngOnInit(): void {
    const title = this.route.snapshot.paramMap.get('title');
    if (!title) return;

    this.loadGame(title);
    this.loadReviews(title);
  }

  loadGame(title: string) {
    this.gamesService.getGame(title).subscribe({
      next: game => {
        if (!game) this.router.navigateByUrl('/not-found');
        this.game = game;
        this.getScreenshots();
        this.checkLikes();
        this.checkGameOwner();
        this.checkBookmarks();
      } 
    });
  }

  loadReviews(title: string) {
    this.reviewsService.getReviewsForGame(title).subscribe({
      next: reviews => this.reviews = reviews
    });
  }

  getScreenshots() {
    if (!this.game) return;
    for (const screenshot of this.game.screenshots) {
      this.screenshots.push(new ImageItem({ src: screenshot.url, thumb: screenshot.url }));
    }
  }  
  
  likeGame() {
    if (this.game) {
      this.gamesService.likeGame(this.game.id).subscribe({
        next: () => this.isLiked = !this.isLiked
      });
    }
  }

  bookmarkGame() {
    if (this.game) {
      this.gamesService.bookmarkGame(this.game.id).subscribe({
        next: () => this.isBookmarked = !this.isBookmarked
      });
    }
  }

  checkLikes() {
    if (this.game) this.isLiked = this.gamesService.isGameLiked(this.game);
  }

  checkGameOwner() {
    if (this.game) this.isPublished = this.gamesService.isGamePublished(this.game);
  }

  checkBookmarks() {
    if (this.game) this.isBookmarked = this.gamesService.isGameBookmarked(this.game);
  }
}
