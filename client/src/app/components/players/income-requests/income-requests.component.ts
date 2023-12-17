import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { Player } from 'src/app/models/player';

@Component({
  selector: 'app-income-requests',
  templateUrl: './income-requests.component.html',
  styleUrls: ['./income-requests.component.css']
})
export class IncomeRequestsComponent implements OnInit {  
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
