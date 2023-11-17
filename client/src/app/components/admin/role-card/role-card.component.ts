import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { AdminService } from 'src/app/services/admin.service';
import { User } from 'src/app/models/user';
import { ToastrService } from 'ngx-toastr';
import { deepEqual } from 'src/app/helpers/compareHelper';

@Component({
  selector: 'app-role-card',
  templateUrl: './role-card.component.html',
  styleUrls: ['./role-card.component.css']
})
export class RoleCardComponent implements OnInit {
  @Input() user: User | undefined;
  roleForm: FormGroup = new FormGroup({});
  initialForm: any;

  constructor(
    private formBuilder: FormBuilder, 
    private adminService: AdminService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.initializeFrom();
  }

  editRoles() {
    if (!this.user) return;

    if (!this.roleForm.value.admin && !this.roleForm.value.moderator && !this.roleForm.value.player) {
      this.toastr.warning('Select at least one role');
      return;
    }
    
    const roles: string[] = [];
    if (this.roleForm.value.admin) roles.push('Admin'); 
    if (this.roleForm.value.moderator) roles.push('Moderator');    
    if (this.roleForm.value.player) roles.push('Player');

    this.adminService.editRoles(this.user.userName, roles.join(',')).subscribe({
      next: roles => {
        if (this.user) this.user.roles = roles;
        this.resetForm();
      }
    });
  }

  isDirty(): boolean {
    return !deepEqual(this.roleForm.value, this.initialForm);
  }

  resetForm() {
    this.roleForm?.reset(this.roleForm.value);
    this.initialForm = this.roleForm.value;
  }

  initializeFrom() {    
    if (!this.user) return;
    
    this.roleForm = this.formBuilder.group({
      admin: this.user.roles.includes('Admin'),
      moderator: this.user.roles.includes('Moderator'),
      player: this.user.roles.includes('Player')
    });

    this.initialForm = this.roleForm.value;
  }
}
