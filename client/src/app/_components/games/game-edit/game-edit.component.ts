import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';

import { ToastrService } from 'ngx-toastr';

import { GamesService } from 'src/app/_services/games.service';
import { Game } from 'src/app/_models/game';

@Component({
  selector: 'app-game-edit',
  templateUrl: './game-edit.component.html',
  styleUrls: ['./game-edit.component.css']
})
export class GameEditComponent implements OnInit {
  @HostListener('window:beforeunload', ['$event']) unloadNotification($event: any) {
    if (this.editForm?.dirty) { $event.returnValue = true; }
  }
  @ViewChild('editForm') editForm: NgForm | undefined;
  game: Game | undefined;
  currentTitle = "";

  constructor(private gamesService: GamesService, private toastr: ToastrService, 
    private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.loadGame();
  }

  loadGame() {
    const title = this.route.snapshot.paramMap.get('title');
    if (!title) return;
    this.gamesService.getGame(title).subscribe({
      next: game => {
        this.game = game,
        this.currentTitle = game.title;
      }
    });
  }

  updateGame() {
    const newTitle: string = this.editForm?.controls['title'].getRawValue();
    
    if (newTitle.trim().length === 0) {
      this.toastr.warning('Title required');
    }
    else {
      this.gamesService.updateGame(this.editForm?.value, this.currentTitle).subscribe({
        next: () => {
          this.toastr.success('Game updated');
          this.currentTitle = newTitle.trim();
          this.editForm?.reset(this.game);
          this.router.navigateByUrl('/games/' + this.currentTitle + '/edit');
        }
      });
    }
    
  }
}
