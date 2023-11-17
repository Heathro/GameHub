import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { AdminService } from 'src/app/services/admin.service';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-role-card',
  templateUrl: './role-card.component.html',
  styleUrls: ['./role-card.component.css']
})
export class RoleCardComponent implements OnInit {
  @Input() user: User | undefined;
  roleForm: FormGroup = new FormGroup({});

  constructor(private formBuilder: FormBuilder, private adminService: AdminService) { }

  ngOnInit(): void {
    this.initializeFrom();
  }

  editRoles() {
    if (!this.user) return;
    
    const roles: string[] = [];
    if (this.roleForm.value.admin) roles.push('Admin'); 
    if (this.roleForm.value.moderator) roles.push('Moderator');    
    if (this.roleForm.value.player) roles.push('Player');

    this.adminService.editRoles(this.user.userName, roles.join(',')).subscribe({
      next: roles => {
        if (this.user) this.user.roles = roles;
      }
    });
  }

  initializeFrom() {    
    if (!this.user) return;
    
    this.roleForm = this.formBuilder.group({
      admin: this.user.roles.includes('Admin'),
      moderator: this.user.roles.includes('Moderator'),
      player: this.user.roles.includes('Player')
    })
  }
}
