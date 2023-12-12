import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { take } from 'rxjs';

import { AccountService } from 'src/app/services/account.service';
import { MessagesService } from 'src/app/services/messages.service';
import { PlayersService } from 'src/app/services/players.service';
import { Player } from 'src/app/models/player';
import { User } from 'src/app/models/user';
import { Review } from 'src/app/models/review';
import { ReviewsService } from 'src/app/services/reviews.service';

@Component({
  selector: 'app-player-profile',
  templateUrl: './player-profile.component.html',
  styleUrls: ['./player-profile.component.css']
})
export class PlayerProfileComponent implements OnInit {
  player: Player | undefined;
  reviews: Review[] = [];
  user: User | null = null;

  constructor(
    private accountService: AccountService,
    private playersService: PlayersService,
    private messagesService: MessagesService,
    private reviewsService: ReviewsService,
    private route: ActivatedRoute, 
    private router: Router
  ) { 
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

  loadPlayer(username: string) {
    this.playersService.getPlayer(username).subscribe({
      next: player => {
        if (!player) this.router.navigateByUrl('/not-found');
        this.player = player;
      }
    });
  }

  loadReviews(username: string) {
    this.reviewsService.getReviewsForPlayer(username).subscribe({
      next: reviews => this.reviews = reviews
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
}
