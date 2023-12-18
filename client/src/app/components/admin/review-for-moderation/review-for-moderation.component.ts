import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ReviewForModeration } from 'src/app/models/review';

@Component({
  selector: 'app-review-for-moderation',
  templateUrl: './review-for-moderation.component.html',
  styleUrls: ['./review-for-moderation.component.css']
})
export class ReviewForModerationComponent implements OnInit {
  @Output() approveReview = new EventEmitter<number>();  
  @Output() rejectReview = new EventEmitter<number>();
  @Input() review: ReviewForModeration | undefined;

  constructor() { }

  ngOnInit(): void {
  }

  approveCurrentReview() {
    if (this.review) this.approveReview.next(this.review.id);
  }

  rejectCurrentReview() {
    if (this.review) this.rejectReview.next(this.review.id);
  }
}
