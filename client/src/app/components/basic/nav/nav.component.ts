import { Component, ElementRef, HostListener, OnInit } from '@angular/core';

import { AccountService } from 'src/app/services/account.service';
import { AdminService } from 'src/app/services/admin.service';
import { GamesService } from 'src/app/services/games.service';
import { MessagesService } from 'src/app/services/messages.service';
import { PlayersService } from 'src/app/services/players.service';
import { ReviewsService } from 'src/app/services/reviews.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {
  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeMenu();
    }
  }
  isMenuOpen: boolean = false;

  constructor(
    public accountService: AccountService,
    public reviewsService: ReviewsService,
    public adminService: AdminService,
    public gamesService: GamesService,
    public playersService: PlayersService,
    public messagesService: MessagesService,
    private elementRef: ElementRef
  ) { }

  ngOnInit(): void {
  }

  gamesClicked() {
    this.gamesService.refreshGames();
    this.toggleMenu();
  }

  reviewsClicked() {
    this.reviewsService.refreshReviews();
    this.toggleMenu();
  }

  playersClicked() {
    this.playersService.refreshPlayers();
    this.toggleMenu();
  }

  adminClicked() {
    this.adminService.refresh();
    this.toggleMenu();
  }

  logout() {
    this.accountService.logout();
    this.toggleMenu();
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }
}
