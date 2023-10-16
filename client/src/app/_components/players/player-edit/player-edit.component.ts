import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';

import { ToastrService } from 'ngx-toastr';
import { take } from 'rxjs';

import { AccountService } from 'src/app/_services/account.service';
import { PlayersService } from 'src/app/_services/players.service';
import { Player } from 'src/app/_models/player';
import { User } from 'src/app/_models/user';

@Component({
  selector: 'app-player-edit',
  templateUrl: './player-edit.component.html',
  styleUrls: ['./player-edit.component.css']
})
export class PlayerEditComponent implements OnInit {
  @ViewChild('editForm') editForm: NgForm | undefined;
  user: User | null = null;
  player: Player | undefined;

  constructor(private accountService: AccountService, private playersService: PlayersService,
      private toastr: ToastrService) {
    this.accountService.currentUser$.pipe(take(1)).subscribe({
      next: user => this.user = user
    });
  }

  ngOnInit(): void {
    this.loadPlayer();
  }

  loadPlayer() {
    if (!this.user) return;
    this.playersService.getPlayer(this.user.username).subscribe({
      next: player => this.player = player
    });
  }

  updatePlayer() {
    console.log(this.player);
    this.toastr.success('Profile updated');
    this.editForm?.reset(this.player);
  }
}
