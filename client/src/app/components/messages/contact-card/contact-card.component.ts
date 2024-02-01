import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { PresenceService } from 'src/app/services/presence.service';
import { Player } from 'src/app/models/player';

@Component({
  selector: 'app-contact-card',
  templateUrl: './contact-card.component.html',
  styleUrls: ['./contact-card.component.css']
})
export class ContactCardComponent implements OnInit {
  @Output() loadMessages = new EventEmitter<string>();
  @Input() player: Player | undefined;

  constructor(public presenceService: PresenceService) { }

  ngOnInit(): void {
  }

  changeDialogue() {
    if (this.player) this.loadMessages.next(this.player.userName);
  }
}
