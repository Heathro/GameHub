import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { Message } from 'src/app/models/message';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css']
})
export class MessageComponent implements OnInit {
  @Output() deleteMessage = new EventEmitter<number>();
  @Input() previousMessage: Message | undefined;
  @Input() currentMessage: Message | undefined;
  @Input() nextMessage: Message | undefined;
  @Input() currentUser: string | undefined;

  avatarRequired = false;
  timeRequired = false;

  constructor() { }

  ngOnInit(): void {    
    this.checkRequirements();
  }

  checkRequirements() {
    this.avatarRequired = this.isAvatarRequired();
    this.timeRequired = this.isTimeRequired();
  }

  updatePreviousMessage(message?: Message) {
    this.previousMessage = message;
    this.avatarRequired = this.isAvatarRequired();
  }

  updateNextMessage(message?: Message) {
    this.nextMessage = message;
    this.timeRequired = this.isTimeRequired();
  }

  deleteCurrentMessage() {
    if (this.currentMessage) this.deleteMessage.next(this.currentMessage.id);
  }

  isAvatarRequired() {
    if (!this.previousMessage || !this.currentMessage) return true;

    return this.previousMessage.senderId !== this.currentMessage?.senderId;
  }

  isTimeRequired() {
    if (!this.nextMessage || !this.currentMessage) return true;

    const currentMessageDate = new Date(this.currentMessage?.messageSent);
    const nextMessageDate = new Date(this.nextMessage.messageSent);

    return !(this.nextMessage.senderId     === this.currentMessage?.senderId    &&
             nextMessageDate.getFullYear() === currentMessageDate.getFullYear() &&
             nextMessageDate.getMonth()    === currentMessageDate.getMonth()    &&
             nextMessageDate.getDay()      === currentMessageDate.getDay()      &&
             nextMessageDate.getHours()    === currentMessageDate.getHours()    &&
             nextMessageDate.getMinutes()  === currentMessageDate.getMinutes());
  }

  getDateFormat() {
    if (!this.currentMessage) return;

    const currentDate = new Date();
    const currentDay = currentDate.toDateString();
    const currentYear = currentDate.getFullYear();

    const sentDate = new Date(this.currentMessage.messageSent);
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
