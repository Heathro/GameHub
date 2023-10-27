import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Player } from 'src/app/_models/player';
import { PlayersService } from 'src/app/_services/players.service';

@Component({
  selector: 'app-player-profile',
  templateUrl: './player-profile.component.html',
  styleUrls: ['./player-profile.component.css']
})
export class PlayerProfileComponent implements OnInit {
  player: Player | undefined;

  constructor(
    private playersService: PlayersService,
    private route: ActivatedRoute, 
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadPlayer();
  }

  loadPlayer() {
    const username = this.route.snapshot.paramMap.get('username');
    if (!username) return;
    this.playersService.getPlayer(username).subscribe({
      next: player => {
        if (!player) this.router.navigateByUrl('/not-found');
        this.player = player;
      }
    });
  }
}
