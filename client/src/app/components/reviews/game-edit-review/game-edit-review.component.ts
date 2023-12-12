import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { Review } from 'src/app/models/review';

@Component({
  selector: 'app-game-edit-review',
  templateUrl: './game-edit-review.component.html',
  styleUrls: ['./game-edit-review.component.css']
})
export class GameEditReviewsComponent implements OnInit {
  @Output() deleteReview = new EventEmitter<number>();
  @Input() review: Review | undefined;

  constructor() { }

  ngOnInit(): void {
  }

  deleteCurrentReview() {
    if (this.review) this.deleteReview.next(this.review.id);
  }
}
