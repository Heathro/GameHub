import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ToastrService } from 'ngx-toastr';

import { EditComponent } from 'src/app/interfaces/edit-component';
import { GamesService } from 'src/app/services/games.service';
import { ReviewsService } from 'src/app/services/reviews.service';
import { Game } from 'src/app/models/game';

@Component({
  selector: 'app-post-review',
  templateUrl: './post-review.component.html',
  styleUrls: ['./post-review.component.css']
})
export class PostReviewComponent implements OnInit, EditComponent {
  @HostListener('window:beforeunload', ['$event']) unloadNotification($event: any) {
    if (this.isDirty()) { $event.returnValue = true; }
  }
  reviewForm: FormGroup = new FormGroup({});
  validationErrors: string[] | undefined;
  game: Game | undefined;
  posting = false;
  posted = false;

  constructor(
    private reviewsService: ReviewsService, 
    private gamesService: GamesService,
    private route: ActivatedRoute,
    private router: Router, 
    private toastr: ToastrService, 
    private formBuilder: FormBuilder
  ) { }

  isDirty(): boolean {
    if (this.posted) return false;

    const content: string = this.reviewForm.value.content;
    return content.length > 0;
  }

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
        this.initializeFrom();
      }
    });
  }

  postReview() {
    if (!this.game) return;
    this.posting = true;
    this.reviewsService.postReview(this.game.title, this.reviewForm.value.content).subscribe({
      next: () => {
        this.router.navigateByUrl('/games/' + this.game?.title);
        this.toastr.success('Review successful');
        this.posting = false;
        this.posted = true;
      },
      error: error => {
        this.validationErrors = error;
        this.posting = false;        
        this.posted = true;
      }
    });
  }

  initializeFrom() {
    this.reviewForm = this.formBuilder.group({
      content: ['', [
        Validators.required,        
        Validators.maxLength(800)
      ]]
    });
  }
}
