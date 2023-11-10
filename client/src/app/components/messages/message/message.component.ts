import { Component, Input, OnInit } from '@angular/core';
import { Message } from 'src/app/models/message';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css']
})
export class MessageComponent implements OnInit {
  @Input() previousMessage: Message | undefined;
  @Input() message: Message | undefined;
  @Input() nextMessage: Message | undefined;
  @Input() currentUser: string | undefined;

  avatarRequired = false;
  timeRequired = false;

  constructor() { }

  ngOnInit(): void {
    this.avatarRequired = this.isAvatarRequired();
    this.timeRequired = this.isTimeRequired();
  }

  isAvatarRequired() {
    if (!this.previousMessage) return true;
    if (!this.message) return true;

    const previousMessageDate = new Date(this.previousMessage.messageSent);
    const currentMessageDate = new Date(this.message?.messageSent);

    return !(this.previousMessage.senderId     === this.message?.senderId           &&
             previousMessageDate.getFullYear() === currentMessageDate.getFullYear() &&
             previousMessageDate.getMonth()    === currentMessageDate.getMonth()    &&
             previousMessageDate.getDay()      === currentMessageDate.getDay()      &&
             previousMessageDate.getHours()    === currentMessageDate.getHours()    &&
             previousMessageDate.getMinutes()  === currentMessageDate.getMinutes());
  }

  isTimeRequired() {
    if (!this.nextMessage) return true;
    if (!this.message) return true;

    const currentMessageDate = new Date(this.message?.messageSent);
    const nextMessageDate = new Date(this.nextMessage.messageSent);

    return !(this.nextMessage.senderId     === this.message?.senderId           &&
             nextMessageDate.getFullYear() === currentMessageDate.getFullYear() &&
             nextMessageDate.getMonth()    === currentMessageDate.getMonth()    &&
             nextMessageDate.getDay()      === currentMessageDate.getDay()      &&
             nextMessageDate.getHours()    === currentMessageDate.getHours()    &&
             nextMessageDate.getMinutes()  === currentMessageDate.getMinutes());
  }

  getDateFormat() {
    if (!this.message) return;

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
