import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AccountService } from '../../_services/account.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {
  @Output() toParent = new EventEmitter();

  constructor(public accountService: AccountService) { }

  ngOnInit(): void {
  }

  login() {
    this.toParent.emit('login');
  }

  register() {
    this.toParent.emit('register');
  }

  // login() {
  //   this.accountService.login(this.model).subscribe({
  //     next: response => console.log(response),
  //     error: error => console.log(error)
  //   });
  // }

  logout() {
    this.accountService.logout();
  }
}
