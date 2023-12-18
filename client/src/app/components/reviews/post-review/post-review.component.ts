import { Component, HostListener, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ToastrService } from 'ngx-toastr';

import { EditComponent } from 'src/app/interfaces/edit-component';
import { ReviewsService } from 'src/app/services/reviews.service';
import { ReviewMenu } from 'src/app/models/review';

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
  reviewMenu: ReviewMenu | undefined;
  initialContent = "";
  posting = false;
  finished = false;

  constructor(
    private reviewsService: ReviewsService,
    private route: ActivatedRoute,
    private router: Router, 
    private toastr: ToastrService, 
    private formBuilder: FormBuilder
  ) { }

  isDirty(): boolean {
    if (this.finished) return false;

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
    this.reviewsService.getReviewMenu(title).subscribe({
      next: reviewMenu => {
        this.reviewMenu = reviewMenu;
        this.initialContent = this.reviewMenu.content;
        this.initializeFrom();
      }
    });
  }

  postReview() {
    if (!this.reviewMenu) return;
    this.posting = true;
    this.reviewsService.postReview(this.reviewMenu.game.title, this.reviewForm.value.content).subscribe({
      next: () => {
        if (!this.reviewMenu) return;
        this.finished = true;
        this.posting = false;
        this.router.navigateByUrl('/games/' + this.reviewMenu?.game.title);
        this.toastr.success('Review successful');
      },
      error: error => {
        this.finished = true;
        this.posting = false;
        this.validationErrors = error;
      }
    });
  }

  deleteReview() {
    if (!this.reviewMenu) return;
    this.reviewsService.deleteReview(this.reviewMenu.id).subscribe({
      next: () => {
        if (!this.reviewMenu) return;
        this.finished = true;
        this.reviewMenu.posted = false;
        this.reviewMenu.content = "";
        this.router.navigateByUrl('/games/' + this.reviewMenu.game.title);
        this.toastr.success('Delete successful');
        this.posting = false;
      }
    });
  }

  initializeFrom() {
    if (!this.reviewMenu) return;
    this.reviewForm = this.formBuilder.group({
      content: [this.reviewMenu.content, [
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
