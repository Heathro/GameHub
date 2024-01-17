import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ToastrModule } from 'ngx-toastr';
import { NgxSpinnerModule } from 'ngx-spinner';
import { FileUploadModule } from 'ng2-file-upload';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { TimeagoModule } from 'ngx-timeago';
import { ModalModule } from 'ngx-bootstrap/modal';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    BsDropdownModule.forRoot(),
    TabsModule.forRoot(),
    ToastrModule.forRoot({ positionClass: 'toast-bottom-left'}),
    NgxSpinnerModule.forRoot({ type: 'pacman' }),
    FileUploadModule,
    PaginationModule.forRoot(),
    TimeagoModule.forRoot(),
    ModalModule.forRoot()
  ],
  exports: [
    BsDropdownModule,
    TabsModule,
    ToastrModule,
    NgxSpinnerModule,
    FileUploadModule,
    PaginationModule,
    TimeagoModule,
    ModalModule
  ]
})
export class SharedModule { }
