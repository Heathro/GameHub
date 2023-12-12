import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

import { TimeagoModule } from 'ngx-timeago';

import { Review } from 'src/app/models/review';

@Component({
  selector: 'app-game-review',
  standalone: true,
  templateUrl: './game-review.component.html',
  styleUrls: ['./game-review.component.css'],
  imports: [ CommonModule, TimeagoModule, RouterModule ]
})
export class GameReviewComponent implements OnInit {
  @Input() review: Review | undefined;

  constructor() { }

  ngOnInit(): void {
  }
}
