import { Component, HostListener, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ToastrService } from 'ngx-toastr';

import { EditComponent } from 'src/app/interfaces/edit-component';
import { ReviewsService } from 'src/app/services/reviews.service';
import { ReviewPost } from 'src/app/models/reviewPost';

@Component({
  selector: 'app-post-review',
  templateUrl: './post-review.component.html',
  styleUrls: ['./post-review.component.css']
})
export class PostReviewComponent implements OnInit, EditComponent {
  @HostListener('window:beforeunload', ['$event']) unloadNotification($event: any) {
    if (this.isDirty()) { $event.returnValue = true; }
  }
  reviewForm: FormGroup = new FormGroup({});
  validationErrors: string[] | undefined;
  reviewPost: ReviewPost | undefined;
  initialContent = "";
  posting = false;
  posted = false;

  constructor(
    private reviewsService: ReviewsService,
    private route: ActivatedRoute,
    private router: Router, 
    private toastr: ToastrService, 
    private formBuilder: FormBuilder
  ) { }

  isDirty(): boolean {
    if (this.posted) return false;

    const content: string = this.reviewForm.value.content;
    if (this.initialContent === content) return false;
    return content.length > 0 && !/^[ \t\n]*$/.test(content);
  }

  ngOnInit(): void {
    this.loadReview();
  }

  loadReview() {
    const title = this.route.snapshot.paramMap.get('title');
    if (!title) return;
    this.reviewsService.getReview(title).subscribe({
      next: reviewPost => {
        this.reviewPost = reviewPost;
        this.initialContent = this.reviewPost.content;
        this.initializeFrom();
      }
    });
  }

  postReview() {
    if (!this.reviewPost) return;
    this.posting = true;
    this.reviewsService.postReview(this.reviewPost.game.title, this.reviewForm.value.content).subscribe({
      next: () => {
        this.router.navigateByUrl('/games/' + this.reviewPost?.game.title);
        this.toastr.success('Review successful');
        this.posting = false;
        this.posted = true;
      },
      error: error => {
        this.validationErrors = error;
        this.posting = false;
        this.posted = true;
      }
    });
  }

  initializeFrom() {
    if (!this.reviewPost) return;
    this.reviewForm = this.formBuilder.group({
      content: [this.reviewPost.content, [
        Validators.required,        
        Validators.maxLength(800),
        this.onlyWhiteSpace()
      ]]
    });
  }

  onlyWhiteSpace(): ValidatorFn {
    return (control: AbstractControl) => {
      return /^[ \t\n]*$/.test(control.value as string) ? {onlyWhiteSpace: true} : null;
    }
  }
}
