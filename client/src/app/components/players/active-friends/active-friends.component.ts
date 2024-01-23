import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { Player } from 'src/app/models/player';

@Component({
  selector: 'app-active-friends',
  templateUrl: './active-friends.component.html',
  styleUrls: ['./active-friends.component.css']
})
export class ActiveFriendsComponent implements OnInit {  
  @Output() deleteCards = new EventEmitter<number>();
  @Input() players: Player[] = [];
  @Input() loading: boolean = false;

  constructor() { }

  ngOnInit(): void {
  }

  deleteCard(id: number) {
    this.deleteCards.emit(id);
  }
}
