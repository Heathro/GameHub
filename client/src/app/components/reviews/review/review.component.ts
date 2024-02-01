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
}
