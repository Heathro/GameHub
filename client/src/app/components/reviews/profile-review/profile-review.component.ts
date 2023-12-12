import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { Review } from 'src/app/models/review';

@Component({
  selector: 'app-profile-review',
  templateUrl: './profile-review.component.html',
  styleUrls: ['./profile-review.component.css']
})
export class ProfileReviewsComponent implements OnInit {
  @Output() deleteReview = new EventEmitter<number>();
  @Input() review: Review | undefined;

  constructor() { }

  ngOnInit(): void {
  }

  deleteCurrentReview() {
    if (this.review) this.deleteReview.next(this.review.id);
  }
}
