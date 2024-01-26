import { Component, OnInit } from '@angular/core';

import { AccountService } from 'src/app/services/account.service';
import { AdminService } from 'src/app/services/admin.service';
import { ReviewsService } from 'src/app/services/reviews.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {

  constructor(
    public accountService: AccountService,
    public reviewsService: ReviewsService,
    public adminService: AdminService
  ) { }

  ngOnInit(): void {
  }

  logout() {
    this.accountService.logout();
  }
}
