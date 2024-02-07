import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Location } from '@angular/common';

import { TabsModule } from 'ngx-bootstrap/tabs';
import { GalleryItem, GalleryModule, ImageItem } from 'ng-gallery';
import { ToastrService } from 'ngx-toastr';

import { environment } from 'src/environments/environment';
import { GameReviewComponent } from '../../reviews/game-review/game-review.component';
import { GamesService } from 'src/app/services/games.service';
import { PlayersService } from 'src/app/services/players.service';
import { ReviewsService } from 'src/app/services/reviews.service';
import { Game } from 'src/app/models/game';
import { Review } from 'src/app/models/review';
import { Poster } from 'src/app/models/poster';
import { Screenshot } from 'src/app/models/screenshot';
import { Avatar } from 'src/app/models/avatar';
import { Platform } from 'src/app/enums/platform';

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
  avatarUpdatedSubscription;
  gameUpdatedSubscription;
  gameDeletedSubscription;
  gameLikedSubscription;
  gameUnlikedSubscription;
  posterUpdatedSubscription;
  screenshotAddedSubscription;  
  screenshotDeletedSubscription;
  reviewApprovedSubscription;
  reviewDeletedSubscription;

  constructor(
    private gamesService: GamesService,
    private reviewsService: ReviewsService,
    private playersService: PlayersService,
    private toastr: ToastrService,
    private location: Location,
    private route: ActivatedRoute, 
    private router: Router,
    private sanitizer: DomSanitizer
  ) {
    this.playerDeletedSubscription = this.playersService.playerDeleted$.subscribe(
      ({userName, userId}) => this.playerDeleted(userId)
    );
    this.avatarUpdatedSubscription = this.playersService.avatarUpdated$.subscribe(
      ({userId, avatar}) => this.avatarUpdated(userId, avatar)
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
    this.reviewApprovedSubscription = this.reviewsService.reviewApproved$.subscribe(
      review => this.reviewApproved(review)
    );
    this.reviewDeletedSubscription = this.reviewsService.reviewDeleted$.subscribe(
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
    this.avatarUpdatedSubscription.unsubscribe();
    this.gameUpdatedSubscription.unsubscribe();
    this.gameDeletedSubscription.unsubscribe();
    this.posterUpdatedSubscription.unsubscribe();
    this.screenshotAddedSubscription.unsubscribe();
    this.screenshotDeletedSubscription.unsubscribe();
    this.reviewApprovedSubscription.unsubscribe();
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
  
  download(platform: Platform) {
    if (this.game) {
      this.gamesService.downloadFile(this.game.title, platform).subscribe(
        (blob) => {
          const link = document.createElement('a');
          link.href = window.URL.createObjectURL(blob);
          if (this.game) {
            switch (platform) {
              case Platform.windows: link.download = this.game.files.windowsName; break;
              case Platform.macOS: link.download = this.game.files.macosName; break;
              case Platform.linux: link.download = this.game.files.linuxName; break;
            }
          }          
          link.click();
        }
      );
    }
  }

  formatFileSize(bytes: number) {
    return (bytes / (1024 * 1024)).toFixed(3);
  }

  private playerDeleted(userId: number) {
    if (this.game) {
      this.game.likes = this.game.likes.filter(l => l !== userId);
    }
    this.reviews = this.reviews.filter(r => r.reviewerId !== userId);
  }
  
  private avatarUpdated(userId: number, avatar: Avatar) {
    this.reviews.forEach(r => {
      if (r.reviewerId === userId) r.reviewerAvatar = avatar;
    });
  }

  private gameUpdated(game: Game) {
    if (this.game && this.game.id === game.id) {
      this.gamesService.updateGameData(this.game, game);
      
      if (this.route.snapshot.paramMap.get('title') !== game.title) {
        this.location.replaceState('/games/' + game.title);
      }
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

  private reviewApproved(review: Review) {
    this.reviews.unshift(review);
  }

  private reviewDeleted(reviewId: number) {
    this.reviews = this.reviews.filter(r => r.id !== reviewId);
  }
}