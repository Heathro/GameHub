import { Component, OnDestroy, OnInit } from '@angular/core';

import { AdminService } from 'src/app/services/admin.service';
import { Pagination } from 'src/app/helpers/pagination';
import { ReviewForModeration } from 'src/app/models/review';

@Component({
  selector: 'app-review-management',
  templateUrl: './review-management.component.html',
  styleUrls: ['./review-management.component.css']
})
export class ReviewManagementComponent implements OnInit, OnDestroy {
  reviews: ReviewForModeration[] = [];
  pagination: Pagination | undefined;
  loading = false;
  reviewDeletedSubscription;
  reviewRefreshSubscription;

  constructor(private adminService: AdminService) {
    this.reviewDeletedSubscription = this.adminService.reviewDeleted$.subscribe(
      reviewId => this.reviewDeleted(reviewId)
    );
    this.reviewRefreshSubscription = this.adminService.refreshReviews$.subscribe(
      () => this.loadReviewsForModeration()
    );
  }

  ngOnInit(): void {
    this.loadReviewsForModeration();
  }

  ngOnDestroy(): void {
    this.reviewDeletedSubscription.unsubscribe();
    this.reviewRefreshSubscription.unsubscribe();
  }

  loadReviewsForModeration() {
    this.loading = true;
    this.adminService.getReviewsForModeration().subscribe({
      next: response => {
        if (response.result && response.pagination) {
          this.reviews = response.result;
          this.pagination = response.pagination;
          this.loading = false;
        }
      }
    });
  }  

  approveReview(reviewId: number) {
    this.adminService.approveReview(reviewId).subscribe({
      next: () => this.reviews = this.reviews.filter(r => r.id != reviewId)
    });
  }

  rejectReview(reviewId: number) {
    this.adminService.rejectReview(reviewId).subscribe({
      next: () => this.reviews = this.reviews.filter(r => r.id != reviewId)
    });
  }

  pageChanged(event: any) {
    if (this.adminService.getUsersPaginationParams().currentPage !== event.page) {
      this.adminService.setReviewsPaginationPage(event.page);
      this.loadReviewsForModeration();
    }
  }

  private reviewDeleted(reviewId: number) {
    this.reviews = this.reviews.filter(r => r.id !== reviewId);
  }
}
