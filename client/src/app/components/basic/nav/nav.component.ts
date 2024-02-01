import { Component, OnInit } from '@angular/core';

import { AccountService } from 'src/app/services/account.service';
import { AdminService } from 'src/app/services/admin.service';
import { GamesService } from 'src/app/services/games.service';
import { PlayersService } from 'src/app/services/players.service';
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
    public adminService: AdminService,
    public gamesService: GamesService,
    public playersService: PlayersService
  ) { }

  ngOnInit(): void {
  }

  logout() {
    this.accountService.logout();
  }
}
