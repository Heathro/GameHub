import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SharedModule } from './_modules/shared.module';
import { ErrorInterceptor } from './_interceptors/error.interceptor';
import { LoadingInterceptor } from './_interceptors/loading.interceptor';
import { JwtInterceptor } from './_interceptors/jwt.interceptor';
import { NavComponent } from './_components/basic/nav/nav.component';
import { HomeComponent } from './_components/basic/home/home.component';
import { RegisterComponent } from './_components/authorization/register/register.component';
import { LoginComponent } from './_components/authorization/login/login.component';
import { StoreComponent } from './_components/games/store/store.component';
import { LibraryComponent } from './_components/games/library/library.component';
import { TestErrorComponent } from './_components/errors/test-error/test-error.component';
import { NotFoundComponent } from './_components/errors/not-found/not-found.component';
import { ServerErrorComponent } from './_components/errors/server-error/server-error.component';
import { PlayersListComponent } from './_components/players/players-list/players-list.component';
import { PlayerCardComponent } from './_components/players/player-card/player-card.component';
import { GameCardComponent } from './_components/games/game-card/game-card.component';
import { PlayerProfileComponent } from './_components/players/player-profile/player-profile.component';
import { PlayerEditComponent } from './_components/players/player-edit/player-edit.component';
import { GameEditComponent } from './_components/games/game-edit/game-edit.component';
import { ScreenshotEditorComponent } from './_components/games/screenshot-editor/screenshot-editor.component';

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
    ScreenshotEditorComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    FormsModule,
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
