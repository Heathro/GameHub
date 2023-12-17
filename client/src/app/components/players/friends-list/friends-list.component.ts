import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { Player } from 'src/app/models/player';

@Component({
  selector: 'app-friends-list',
  templateUrl: './friends-list.component.html',
  styleUrls: ['./friends-list.component.css']
})
export class FriendsListComponent implements OnInit {  
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
