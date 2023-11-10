import { Component, Input, OnInit } from '@angular/core';
import { Message } from 'src/app/models/message';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css']
})
export class MessageComponent implements OnInit {
  @Input() message: Message | undefined;
  @Input() currentUser: string | undefined;

  constructor() { }

  ngOnInit(): void {
  }

  getDateFormat() {
    if (!this.message || !this.message.messageSent) return;

    const currentDate = new Date();
    const currentDay = currentDate.toDateString();
    const currentYear = currentDate.getFullYear();

    const sentDate = new Date(this.message.messageSent);
    const sentDay = sentDate.toDateString();
    const sentYear = sentDate.getFullYear();

    const yesterdayDate = new Date(currentDay);
    yesterdayDate.setDate(currentDate.getDate() - 1);
    const yesterdayDay = yesterdayDate.toDateString();

    const differenceInTime = currentDate.getTime() - sentDate.getTime();
    const differenceInDays = differenceInTime / (1000 * 3600 * 24);

    if (sentYear < currentYear) {
      return 'd MMM yyyy, H:mm';
    } 
    else if (sentDay === yesterdayDay) {
      return "'Yesterday' H:mm'";
    }
    else if (sentDay === currentDay) {
      return 'H:mm';
    }
    else if (differenceInDays < 7) {
      return 'EEEE H:mm'
    }
    else {
      return 'E, d MMM H:mm';
    }
  }
}
