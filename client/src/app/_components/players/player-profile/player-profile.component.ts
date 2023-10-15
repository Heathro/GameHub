import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Player } from 'src/app/_models/player';
import { PlayersService } from 'src/app/_services/players.service';

@Component({
  selector: 'app-player-profile',
  templateUrl: './player-profile.component.html',
  styleUrls: ['./player-profile.component.css']
})
export class PlayerProfileComponent implements OnInit {
  player: Player | undefined;

  constructor(private playersService: PlayersService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.loadPlayer();
  }

  loadPlayer() {
    const username = this.route.snapshot.paramMap.get('username');
    if (!username) return;
    this.playersService.getPlayer(username).subscribe({
      next: player => this.player = player
    });
  }
}
