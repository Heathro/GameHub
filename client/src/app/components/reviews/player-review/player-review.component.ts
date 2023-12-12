import { Component, Input, OnInit } from '@angular/core';

import { Review } from 'src/app/models/review';

@Component({
  selector: 'app-player-review',
  templateUrl: './player-review.component.html',
  styleUrls: ['./player-review.component.css']
})
export class PlayerReviewComponent implements OnInit {
  @Input() review: Review | undefined;

  constructor() { }

  ngOnInit(): void {
  }
}
