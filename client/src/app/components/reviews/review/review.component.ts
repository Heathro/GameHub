import { Component, Input, OnInit } from '@angular/core';
import { Review } from 'src/app/models/review';

@Component({
  selector: 'app-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.css']
})
export class ReviewComponent implements OnInit {
  @Input() review: Review | undefined;

  constructor() { }

  ngOnInit(): void {
  }

  getDateFormat() {
    if (!this.review) return;

    const currentDate = new Date();
    const currentDay = currentDate.toDateString();
    const currentYear = currentDate.getFullYear();

    const sentDate = new Date(this.review.reviewPosted);
    const sentDay = sentDate.toDateString();
    const sentYear = sentDate.getFullYear();

    if (sentYear < currentYear) {
      return 'd MMM yyyy, H:mm';
    }
    else if (sentDay === currentDay) {
      return "'Today', H:mm'";
    }
    else {
      return 'd MMM, H:mm';
    }
  }
}
