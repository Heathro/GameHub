import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/user';
import { AdminService } from 'src/app/services/admin.service';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  loading = false;

  constructor(private adminService: AdminService) { }

  ngOnInit(): void {
    this.getUsersWithRoles();
  }

  getUsersWithRoles() {
    this.loading = true;
    this.adminService.getUsersWithRoles().subscribe({
      next: users => {
        this.users = users;
        this.loading = false;
      }
    });
  }

  deleteUser(userName: string) {
    this.adminService.deleteUser(userName).subscribe({
      next: () => this.users = this.users.filter(u => u.userName != userName)
    })
  }
}
