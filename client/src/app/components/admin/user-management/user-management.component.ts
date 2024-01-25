import { Component, OnDestroy, OnInit } from '@angular/core';

import { AdminService } from 'src/app/services/admin.service';
import { Pagination } from 'src/app/helpers/pagination';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit, OnDestroy {
  users: User[] = [];
  pagination: Pagination | undefined;
  loading = false;
  playerDeletedSubscription;

  constructor(private adminService: AdminService) {
    this.playerDeletedSubscription = this.adminService.playerDeleted$.subscribe(
      username => this.playerDeleted(username)
    );
  }

  ngOnInit(): void {
    this.loadUsersWithRoles();
  }

  ngOnDestroy(): void {
    this.playerDeletedSubscription.unsubscribe();
  }

  loadUsersWithRoles() {
    this.loading = true;
    this.adminService.getUsersWithRoles().subscribe({
      next: response => {
        if (response.result && response.pagination) {
          this.users = response.result;
          this.pagination = response.pagination;
          this.loading = false;
        }
      }
    });
  }

  deleteUser(userName: string) {
    this.adminService.deleteUser(userName).subscribe({
      next: () => this.users = this.users.filter(u => u.userName != userName)
    });
  }

  pageChanged(event: any) {
    if (this.adminService.getUsersPaginationParams().currentPage !== event.page) {
      this.adminService.setUsersPaginationPage(event.page);
      this.loadUsersWithRoles();
    }
  }

  private playerDeleted(username: string) {
    this.users = this.users.filter(u => u.userName !== username);
  }
}
