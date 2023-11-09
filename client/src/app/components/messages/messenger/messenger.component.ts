import { Component, OnInit } from '@angular/core';
import { Message } from 'src/app/models/message';
import { Pagination, PaginationParams } from 'src/app/models/pagination';
import { MessagesService } from 'src/app/services/messages.service';

@Component({
  selector: 'app-messenger',
  templateUrl: './messenger.component.html',
  styleUrls: ['./messenger.component.css']
})
export class MessengerComponent implements OnInit {
  messages?: Message[];
  pagination?: Pagination;

  constructor(private messagesService: MessagesService) { }

  ngOnInit(): void {
    this.loadMessages();
  }

  loadMessages() {
    this.messagesService.getMessages().subscribe({
      next: response => {
        this.messages = response.result;
        this.pagination = response.pagination;
      }
    });
  }

  pageChanged(event: any) {
    if (this.messagesService.getPaginationParams().currentPage !== event.page) {
      this.messagesService.setPaginationPage(event.page);
      this.loadMessages();
    }
  } 
}
