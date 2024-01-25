import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ToastrService } from 'ngx-toastr';
import { take } from 'rxjs';

import { AccountService } from 'src/app/services/account.service';
import { PresenceService } from 'src/app/services/presence.service';
import { ReviewsService } from 'src/app/services/reviews.service';
import { MessagesService } from 'src/app/services/messages.service';
import { PlayersService } from 'src/app/services/players.service';
import { Player } from 'src/app/models/player';
import { Review } from 'src/app/models/review';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-player-profile',
  templateUrl: './player-profile.component.html',
  styleUrls: ['./player-profile.component.css']
})
export class PlayerProfileComponent implements OnInit, OnDestroy {
  player: Player | undefined;
  reviews: Review[] = [];
  user: User | null = null;
  loadingReviews = false;
  playerDeletedSubscription;
  gameDeletedSubscription;
  reviewDeletedSubscription;

  constructor(
    private accountService: AccountService,
    public presenceService: PresenceService,
    private playersService: PlayersService,
    private messagesService: MessagesService,
    private reviewsService: ReviewsService,
    private toastr: ToastrService,
    private route: ActivatedRoute, 
    private router: Router
  ) { 
    this.playerDeletedSubscription = this.playersService.playerDeleted$.subscribe(
      username => this.playerDeleted(username)
    );
    this.gameDeletedSubscription = this.playersService.gameDeleted$.subscribe(
      gameId => this.gameDeleted(gameId)
    );
    this.reviewDeletedSubscription = this.playersService.reviewDeleted$.subscribe(
      reviewId => this.reviewDeleted(reviewId)
    );
    this.accountService.currentUser$.pipe(take(1)).subscribe({
      next: user => this.user = user
    });
  }

  ngOnInit(): void {
    const username = this.route.snapshot.paramMap.get('username');
    if (!username) return;

    this.loadPlayer(username);
    this.loadReviews(username);
  }
  
  ngOnDestroy(): void {
    this.playerDeletedSubscription.unsubscribe();
    this.gameDeletedSubscription.unsubscribe();
    this.reviewDeletedSubscription.unsubscribe();
  }

  loadPlayer(username: string) {
    this.playersService.getPlayer(username).subscribe({
      next: player => {
        if (!player) this.router.navigateByUrl('/not-found');
        this.player = player;
      }
    });
  }

  loadReviews(username: string) {
    this.loadingReviews = true;
    this.reviewsService.getReviewsForPlayer(username).subscribe({
      next: reviews => {
        this.reviews = reviews;
        this.loadingReviews = false;
      }
    });
  }

  addFriend() {
    if (!this.player) return;
    this.playersService.addFriend(this.player.userName).subscribe({
      next: player => {
        if (this.player) this.player = player;
      }
    });
  }

  deleteFriend() {
    if (!this.player) return;
    this.playersService.deleteFriend(this.player.userName).subscribe({
      next: player => {
        if (this.player) this.player = player;
      }
    });
  }

  acceptRequest() {
    if (!this.player) return;
    this.playersService.acceptRequest(this.player.userName).subscribe({
      next: player => {
        if (this.player) this.player = player;
      }
    });
  }

  cancelRequest() {
    if (!this.player) return;
    this.playersService.cancelRequest(this.player.userName).subscribe({
      next: player => {
        if (this.player) this.player = player;
      }
    });
  }

  messagePlayer() {
    if (!this.player) return;
    this.messagesService.startChat(this.player).subscribe({
      next: () => this.router.navigateByUrl('/messenger')
    });
  }

  private playerDeleted(username: string) {
    if (this.player && this.player.userName === username) {
      this.toastr.warning(username + " was deleted");
      this.router.navigateByUrl('/players');
    }
  } 
  
  private gameDeleted(gameId: number) {
    if (this.player) {
      this.player.publications = this.player.publications.filter(g => g.id !== gameId);
    }
    this.reviews = this.reviews.filter(r => r.gameId !== gameId);
  }

  private reviewDeleted(reviewId: number) {
    this.reviews = this.reviews.filter(r => r.id !== reviewId);
  }
}
