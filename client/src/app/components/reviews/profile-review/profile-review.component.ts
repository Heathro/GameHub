import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { ConfirmService } from 'src/app/services/confirm.service';
import { Review } from 'src/app/models/review';

@Component({
  selector: 'app-profile-review',
  templateUrl: './profile-review.component.html',
  styleUrls: ['./profile-review.component.css']
})
export class ProfileReviewsComponent implements OnInit {
  @Output() deleteReview = new EventEmitter<number>();
  @Input() review: Review | undefined;

  constructor(private confirmService: ConfirmService) { }

  ngOnInit(): void {
  }

  deleteCurrentReview() {
    this.confirmService.confirm(
      'Delete Review',
      'Are you sure you want to delete this review?',
      'Delete',
      'Cancel'
    ).subscribe({
      next: confirmed => {
        if (confirmed) {
          if (this.review) this.deleteReview.next(this.review.id);
        }
      }
    });    
  }
}
