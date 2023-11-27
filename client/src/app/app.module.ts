import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SharedModule } from './modules/shared.module';
import { ErrorInterceptor } from './interceptors/error.interceptor';
import { LoadingInterceptor } from './interceptors/loading.interceptor';
import { JwtInterceptor } from './interceptors/jwt.interceptor';
import { NavComponent } from './components/basic/nav/nav.component';
import { HomeComponent } from './components/basic/home/home.component';
import { RegisterComponent } from './components/authorization/register/register.component';
import { LoginComponent } from './components/authorization/login/login.component';
import { StoreComponent } from './components/games/store/store.component';
import { LibraryComponent } from './components/games/library/library.component';
import { TestErrorComponent } from './components/errors/test-error/test-error.component';
import { NotFoundComponent } from './components/errors/not-found/not-found.component';
import { ServerErrorComponent } from './components/errors/server-error/server-error.component';
import { PlayersListComponent } from './components/players/players-list/players-list.component';
import { PlayerCardComponent } from './components/players/player-card/player-card.component';
import { GameCardComponent } from './components/games/game-card/game-card.component';
import { PlayerProfileComponent } from './components/players/player-profile/player-profile.component';
import { PlayerEditComponent } from './components/players/player-edit/player-edit.component';
import { GameEditComponent } from './components/games/game-edit/game-edit.component';
import { ScreenshotEditorComponent } from './components/games/screenshot-editor/screenshot-editor.component';
import { TextInputComponent } from './forms/text-input/text-input.component';
import { CheckboxInputComponent } from './forms/checkbox-input/checkbox-input.component';
import { TextareaInputComponent } from './forms/textarea-input/textarea-input.component';
import { MessengerComponent } from './components/messages/messenger/messenger.component';
import { MessageComponent } from './components/messages/message/message.component';
import { ContactCardComponent } from './components/messages/contact-card/contact-card.component';
import { AdminPanelComponent } from './components/admin/admin-panel/admin-panel.component';
import { HasRoleDirective } from './directives/has-role.directive';
import { UserManagementComponent } from './components/admin/user-management/user-management.component';
import { GameManagementComponent } from './components/admin/game-management/game-management.component';
import { RoleCardComponent } from './components/admin/role-card/role-card.component';
import { FriendsListComponent } from './components/players/friends-list/friends-list.component';
import { FriendsPanelComponent } from './components/players/friends-panel/friends-panel.component';
import { IncomeRequestsComponent } from './components/players/income-requests/income-requests.component';
import { OutcomeRequestsComponent } from './components/players/outcome-requests/outcome-requests.component';
import { FriendCardComponent } from './components/players/friend-card/friend-card.component';
import { GameCardMiniComponent } from './components/games/game-card-mini/game-card-mini.component';
import { PublicationComponent } from './components/games/publication/publication.component';

@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    HomeComponent,
    RegisterComponent,
    LoginComponent,
    StoreComponent,
    LibraryComponent,
    TestErrorComponent,
    NotFoundComponent,
    ServerErrorComponent,
    PlayersListComponent,
    PlayerCardComponent,
    GameCardComponent,
    PlayerProfileComponent,
    PlayerEditComponent,
    GameEditComponent,
    ScreenshotEditorComponent,
    TextInputComponent,
    CheckboxInputComponent,
    TextareaInputComponent,
    MessengerComponent,
    MessageComponent,
    ContactCardComponent,
    AdminPanelComponent,
    HasRoleDirective,
    UserManagementComponent,
    GameManagementComponent,
    RoleCardComponent,
    FriendsListComponent,
    FriendsPanelComponent,
    IncomeRequestsComponent,
    OutcomeRequestsComponent,
    FriendCardComponent,
    GameCardMiniComponent,
    PublicationComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
