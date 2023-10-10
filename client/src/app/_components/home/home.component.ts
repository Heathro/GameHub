import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  @Input() fromParent = 'none';
  @Output() toParent = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  setHomepageMode(event: string) {
    this.toParent.emit(event);
  }
}
