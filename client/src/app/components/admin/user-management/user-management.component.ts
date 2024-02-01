import { Component, OnDestroy, OnInit } from '@angular/core';

import { AdminService } from 'src/app/services/admin.service';
import { Pagination } from 'src/app/helpers/pagination';
import { User } from 'src/app/models/user';
import { Avatar } from 'src/app/models/avatar';

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
  avatarUpdatedSubscription;
  playersRefreshSubscription;

  constructor(private adminService: AdminService) {
    this.playerDeletedSubscription = this.adminService.playerDeleted$.subscribe(
      ({userName, userId}) => this.playerDeleted(userId)
    );
    this.avatarUpdatedSubscription = this.adminService.avatarUpdated$.subscribe(
      ({userId, avatar}) => this.avatarUpdated(userId, avatar)
    );
    this.playersRefreshSubscription = this.adminService.refreshPlayers$.subscribe(
      () => this.loadUsersWithRoles()
    );
  }

  ngOnInit(): void {
    this.loadUsersWithRoles();
  }

  ngOnDestroy(): void {
    this.playerDeletedSubscription.unsubscribe();
    this.avatarUpdatedSubscription.unsubscribe();
    this.playersRefreshSubscription.unsubscribe();
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
      next: () => this.users = this.users.filter(u => u.userName !== userName)
    });
  }

  pageChanged(event: any) {
    if (this.adminService.getUsersPaginationParams().currentPage !== event.page) {
      this.adminService.setUsersPaginationPage(event.page);
      this.loadUsersWithRoles();
    }
  }

  private playerDeleted(userId: number) {
    this.users = this.users.filter(u => u.id !== userId);
  }
  
  private avatarUpdated(userId: number, avatar: Avatar) {
    this.users.forEach(p => {
      if (p.id === userId) p.avatarUrl = avatar.url;
    });
  }
}
