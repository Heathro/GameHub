import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { TabsModule } from 'ngx-bootstrap/tabs';
import { GalleryItem, GalleryModule, ImageItem } from 'ng-gallery';

import { GamesService } from 'src/app/services/games.service';
import { Game } from 'src/app/models/game';
import { Review } from 'src/app/models/review';
import { ReviewsService } from 'src/app/services/reviews.service';
import { GameReviewComponent } from '../../reviews/game-review/game-review.component';
import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';
import { Poster } from 'src/app/models/poster';
import { Screenshot } from 'src/app/models/screenshot';

@Component({
  selector: 'app-game-page',
  standalone: true,
  templateUrl: './game-page.component.html',
  styleUrls: ['./game-page.component.css'],
  imports: [ CommonModule, TabsModule, GalleryModule, RouterModule, GameReviewComponent ]
})
export class GamePageComponent implements OnInit, OnDestroy {
  game: Game | undefined;
  screenshots: GalleryItem[] = [];
  reviews: Review[] = [];
  isLiked = false;
  isPublished = false;
  isBookmarked = false;
  loadingReviews = false;
  playerDeletedSubscription;
  gameUpdatedSubscription;
  gameDeletedSubscription;
  gameLikedSubscription;
  gameUnlikedSubscription;
  posterUpdatedSubscription;
  screenshotAddedSubscription;  
  screenshotDeletedSubscription;
  reviewAcceptedSubscription;
  reviewDeletedSubscription;

  constructor(
    private gamesService: GamesService,
    private reviewsService: ReviewsService,
    private toastr: ToastrService,
    private route: ActivatedRoute, 
    private router: Router,
    private sanitizer: DomSanitizer
  ) {
    this.playerDeletedSubscription = this.gamesService.playerDeleted$.subscribe(
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
    this.screenshotAddedSubscription = this.gamesService.screenshotAdded$.subscribe(
      ({gameId, screenshot}) => this.screenshotAdded(gameId, screenshot)
    );
    this.screenshotDeletedSubscription = this.gamesService.screenshotDeleted$.subscribe(
      ({gameId, screenshotId}) => this.screenshotDeleted(gameId, screenshotId)
    );
    this.reviewAcceptedSubscription = this.gamesService.reviewAccepted$.subscribe(
      review => this.reviewAccepted(review)
    );
    this.reviewDeletedSubscription = this.gamesService.reviewDeleted$.subscribe(
      reviewId => this.reviewDeleted(reviewId)
    );
  }

  ngOnInit(): void {
    const title = this.route.snapshot.paramMap.get('title');
    if (!title) return;

    this.loadGame(title);
    this.loadReviews(title);
  }

  ngOnDestroy(): void {
    this.playerDeletedSubscription.unsubscribe();
    this.gameUpdatedSubscription.unsubscribe();
    this.gameDeletedSubscription.unsubscribe();
    this.posterUpdatedSubscription.unsubscribe();
    this.screenshotAddedSubscription.unsubscribe();
    this.screenshotDeletedSubscription.unsubscribe();
    this.reviewAcceptedSubscription.unsubscribe();
    this.reviewDeletedSubscription.unsubscribe();
  }

  getVideo(): string {
    if (!this.game) return '';
    return environment.youtubeUrl + this.game.video;
  }
  
  sanitizeVideoUrl(videoUrl: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(videoUrl);
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
    this.loadingReviews = true;
    this.reviewsService.getReviewsForGame(title).subscribe({
      next: reviews => {
        this.reviews = reviews;
        this.loadingReviews = false;
      }
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
        next: userId => {
          this.isLiked = !this.isLiked;

          if (this.game && userId) {
            if (this.isLiked) {
              if (!this.game.likes.includes(userId)) this.game.likes.push(userId);
            }
            else {
              this.game.likes = this.game.likes.filter(l => l !== userId);
            }
          }          
        }
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

  private playerDeleted(userId: number) {
    if (this.game) {
      this.game.likes = this.game.likes.filter(l => l !== userId);
    }
    this.reviews = this.reviews.filter(r => r.reviewerId !== userId);
  }

  private gameUpdated(game: Game) {
    if (this.game && this.game.id === game.id) {
      this.gamesService.updateGameData(this.game, game);
    }
  }

  private gameDeleted(gameId: number) {
    if (this.game && this.game.id === gameId) {
      this.toastr.warning('"' + this.game.title + '" was deleted');
      this.router.navigateByUrl('/games');
    }
  }

  private gameLiked(gameId: number, playerId: number) {
    if (this.game && this.game.id === gameId && !this.game.likes.includes(playerId)) {
      this.game.likes.push(playerId);
    }
  }
  
  private gameUnliked(gameId: number, playerId: number) {
    if (this.game && this.game.id === gameId) {
      this.game.likes = this.game.likes.filter(l => l !== playerId);
    }
  }
  
  private posterUpdated(gameId: number, poster: Poster) {
    if (this.game && this.game.id === gameId) this.game.poster = poster;
  }

  private screenshotAdded(gameId: number, screenshot: Screenshot) {
    if (this.game && this.game.id === gameId) {
      if (!this.game.screenshots.some(s => s.id === screenshot.id)) {
        this.game.screenshots.push(screenshot);
      }
      this.screenshots = [];
      this.getScreenshots();
    }
  }

  private screenshotDeleted(gameId: number, screenshotId: number) {
    if (this.game && this.game.id === gameId) {
      this.game.screenshots = this.game.screenshots.filter(s => s.id !== screenshotId);
      this.screenshots = [];
      this.getScreenshots();
    }
  }

  private reviewAccepted(review: Review) {
    this.reviews.unshift(review);
  }

  private reviewDeleted(reviewId: number) {
    this.reviews = this.reviews.filter(r => r.id !== reviewId);
  }
}