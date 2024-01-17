import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { ToastrService } from 'ngx-toastr';

import { AdminService } from 'src/app/services/admin.service';
import { deepEqual } from 'src/app/helpers/basicFunctions';
import { User } from 'src/app/models/user';
import { ConfirmService } from 'src/app/services/confirm.service';

@Component({
  selector: 'app-role-card',
  templateUrl: './role-card.component.html',
  styleUrls: ['./role-card.component.css']
})
export class RoleCardComponent implements OnInit {
  @Output() deleteUser = new EventEmitter<string>();
  @Input() user: User | undefined;
  roleForm: FormGroup = new FormGroup({});
  initialForm: any;

  constructor(
    private formBuilder: FormBuilder, 
    private adminService: AdminService,
    private toastr: ToastrService,
    private confirmService: ConfirmService
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

  deleteCurrentUser() {    
    this.confirmService.confirm(
      'Delete Account',
      'Are you sure you want to delete ' + this.user?.userName +'?',
      'Delete',
      'Cancel'
    ).subscribe({
      next: confirmed => {
        if (confirmed) {
          if (this.user) this.deleteUser.next(this.user.userName);
        }
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
    if (!this.user.roles) return;
    
    this.roleForm = this.formBuilder.group({
      admin: this.user.roles.includes('Admin'),
      moderator: this.user.roles.includes('Moderator'),
      player: this.user.roles.includes('Player')
    });

    this.initialForm = this.roleForm.value;
  }
}
