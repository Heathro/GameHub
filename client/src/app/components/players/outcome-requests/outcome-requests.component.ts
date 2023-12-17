import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { Player } from 'src/app/models/player';

@Component({
  selector: 'app-outcome-requests',
  templateUrl: './outcome-requests.component.html',
  styleUrls: ['./outcome-requests.component.css']
})
export class OutcomeRequestsComponent implements OnInit {  
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
