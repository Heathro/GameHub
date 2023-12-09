import { Component, OnInit } from '@angular/core';
import { OrderType } from 'src/app/helpers/orderType';
import { Pagination } from 'src/app/helpers/pagination';
import { Review } from 'src/app/models/review';
import { ReviewsService } from 'src/app/services/reviews.service';

@Component({
  selector: 'app-reviews-list',
  templateUrl: './reviews-list.component.html',
  styleUrls: ['./reviews-list.component.css']
})
export class ReviewsListComponent implements OnInit {
  reviews: Review[] = [];
  pagination: Pagination | undefined;
  loading = false;

  constructor(private reviewsService: ReviewsService) { }

  ngOnInit(): void {
    this.loadReviews();
  }

  loadReviews() {
    this.loading = true;
    this.reviewsService.getAllReviews().subscribe({
      next: response => {
        if (response.result && response.pagination) {
          this.reviews = response.result;
          this.pagination = response.pagination;
          this.loading = false;
        }
      }
    });
  }

  sortNewest() {
    this.sortPlayers(OrderType.newest);
  }

  sortOldest() {
    this.sortPlayers(OrderType.oldest);
  }

  sortPlayers(orderType: OrderType) {
    this.reviewsService.setPaginationPage(1);
    this.reviewsService.setPaginationOrder(orderType);
    this.loadReviews();
    if (this.pagination) this.pagination.currentPage = 1;
  }

  pageChanged(event: any) {
    if (this.reviewsService.getPaginationParams().currentPage !== event.page) {
      this.reviewsService.setPaginationPage(event.page);
      this.loadReviews();
    }
  }  

  getSortingType() {
    switch (this.reviewsService.getPaginationParams().orderType) {
      case OrderType.oldest: return '<i class="bi bi-hourglass-split"></i>&ensp;' + 
                                    '<i class="bi bi-arrow-right"></i>&ensp;' +
                                    '<i class="bi bi-hourglass"></i>';
      default:               return '<i class="bi bi-hourglass"></i>&ensp;' + 
                                    '<i class="bi bi-arrow-right"></i>&ensp;' + 
                                    '<i class="bi bi-hourglass-split"></i>';
    }
  }
}
