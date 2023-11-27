import { Component, OnInit } from '@angular/core';

import { AdminService } from 'src/app/services/admin.service';
import { Pagination } from 'src/app/models/pagination';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  pagination: Pagination | undefined;
  loading = false;

  constructor(private adminService: AdminService) { }

  ngOnInit(): void {
    this.loadUsersWithRoles();
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
    })
  }

  pageChanged(event: any) {
    if (this.adminService.getPaginationParams().currentPage !== event.page) {
      this.adminService.setPaginationPage(event.page);
      this.loadUsersWithRoles();
    }
  }  
}
