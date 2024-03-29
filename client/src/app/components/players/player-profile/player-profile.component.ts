import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ToastrService } from 'ngx-toastr';
import { take } from 'rxjs';

import { AccountService } from 'src/app/services/account.service';
import { PresenceService } from 'src/app/services/presence.service';
import { ReviewsService } from 'src/app/services/reviews.service';
import { MessagesService } from 'src/app/services/messages.service';
import { PlayersService } from 'src/app/services/players.service';
import { GamesService } from 'src/app/services/games.service';
import { Player } from 'src/app/models/player';
import { Review } from 'src/app/models/review';
import { User } from 'src/app/models/user';
import { Game } from 'src/app/models/game';
import { Poster } from 'src/app/models/poster';
import { Avatar } from 'src/app/models/avatar';

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
  playerUpdatedSubscription;
  playerDeletedSubscription;
  avatarUpdatedSubscription;
  gamePublishedSubscription;
  gameUpdatedSubscription;
  gameDeletedSubscription;
  posterUpdatedSubscription;
  reviewApprovedSubscription;
  reviewDeletedSubscription;
  friendshipRequestedSubscription;
  friendshipCancelledSubscription;
  friendshipAcceptedSubscription;

  constructor(
    private accountService: AccountService,
    public presenceService: PresenceService,
    private playersService: PlayersService,
    private messagesService: MessagesService,
    private reviewsService: ReviewsService,
    private gamesService: GamesService,
    private toastr: ToastrService,
    private route: ActivatedRoute, 
    private router: Router
  ) {
    this.playerUpdatedSubscription = this.playersService.playerUpdated$.subscribe(
      player => this.playerUpdated(player)
    );
    this.playerDeletedSubscription = this.playersService.playerDeleted$.subscribe(
      ({userName, userId}) => this.playerDeleted(userName, userId)
    );
    this.avatarUpdatedSubscription = this.playersService.avatarUpdated$.subscribe(
      ({userId, avatar}) => this.avatarUpdated(userId, avatar)
    );
    this.gamePublishedSubscription = this.gamesService.gamePublished$.subscribe(
      game => this.gamePublished(game)
    );
    this.gameUpdatedSubscription = this.gamesService.gameUpdated$.subscribe(
      game => this.gameUpdated(game)
    );
    this.gameDeletedSubscription = this.gamesService.gameDeleted$.subscribe(
      gameId => this.gameDeleted(gameId)
    );
    this.posterUpdatedSubscription = this.gamesService.posterUpdated$.subscribe(
      ({gameId, poster}) => this.posterUpdated(gameId, poster)
    );
    this.reviewApprovedSubscription = this.reviewsService.reviewApproved$.subscribe(
      review => this.reviewApproved(review)
    );
    this.reviewDeletedSubscription = this.reviewsService.reviewDeleted$.subscribe(
      reviewId => this.reviewDeleted(reviewId)
    );
    this.friendshipRequestedSubscription = this.playersService.friendshipRequested$.subscribe(
      player => this.friendshipRequested(player)
    );
    this.friendshipCancelledSubscription = this.playersService.friendshipCancelled$.subscribe(
      player => this.friendshipCancelled(player)
    );
    this.friendshipAcceptedSubscription = this.playersService.friendshipAccepted$.subscribe(
      player => this.friendshipAccepted(player)
    );
    this.accountService.currentUser$.pipe(take(1)).subscribe({
      next: user => this.user = user
    });
  }

  ngOnInit(): void {
    const username = this.route.snapshot.paramMap.get('username');
    if (!username) return;

    if (username === 'Admin' && this.user?.userName !== 'Admin') {
      this.router.navigateByUrl('/not-found');
    }

    this.loadPlayer(username);
    this.loadReviews(username);
  }
  
  ngOnDestroy(): void {
    this.playerUpdatedSubscription.unsubscribe();
    this.playerDeletedSubscription.unsubscribe();
    this.avatarUpdatedSubscription.unsubscribe();
    this.gamePublishedSubscription.unsubscribe();
    this.gameUpdatedSubscription.unsubscribe();
    this.gameDeletedSubscription.unsubscribe();
    this.posterUpdatedSubscription.unsubscribe();
    this.reviewApprovedSubscription.unsubscribe();
    this.reviewDeletedSubscription.unsubscribe();
    this.friendshipRequestedSubscription.unsubscribe();
    this.friendshipCancelledSubscription.unsubscribe();
    this.friendshipAcceptedSubscription.unsubscribe();
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

  private playerUpdated(player: Player) {
    if (this.player && this.player.id === player.id) {
      this.playersService.updatePlayerData(this.player, player);
    }
  }

  private playerDeleted(userName: string, userId: number) {
    if (this.player && this.player.id === userId) {
      this.toastr.warning('"' + this.player.userName + '" was deleted');
      this.router.navigateByUrl('/players');
    }
  }
  
  private avatarUpdated(userId: number, avatar: Avatar) {
    if (this.player && this.player.id === userId) this.player.avatar = avatar;
  }

  private gamePublished(game: Game) {
    if (this.player) this.player.publications.unshift(game);
  }

  private gameUpdated(game: Game) {
    if (this.player) {
      this.player.publications.forEach(g => {
        if (g.id === game.id) this.playersService.updateGameData(g, game);
      });
    }
  }
  
  private gameDeleted(gameId: number) {
    if (this.player) this.player.publications = this.player.publications.filter(g => g.id !== gameId);
    this.reviews = this.reviews.filter(r => r.gameId !== gameId);
  }
  
  private posterUpdated(gameId: number, poster: Poster) {
    if (this.player) {
      this.player.publications.forEach(g => {
        if (g.id === gameId) g.poster = poster;
      });
      this.reviews.forEach(r => {
        if (r.gameId === gameId) r.gamePoster = poster;
      });
    }
  }

  private reviewApproved(review: Review) {
    this.reviews.unshift(review);
  }

  private reviewDeleted(reviewId: number) {
    this.reviews = this.reviews.filter(r => r.id !== reviewId);
  }

  private friendshipRequested(player: Player) {
    if (this.player && this.player.userName === player.userName) {
      this.player.status = player.status;
      this.player.type = player.type;
    }
  }

  private friendshipCancelled(player: Player) {
    if (this.player && this.player.userName === player.userName) {
      this.player.status = player.status;
      this.player.type = player.type;
    }
  }

  private friendshipAccepted(player: Player) {
    if (this.player && this.player.userName === player.userName) {
      this.player.status = player.status;
      this.player.type = player.type;
    }
  }
}
