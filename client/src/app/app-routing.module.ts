import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './components/basic/home/home.component';
import { StoreComponent } from './components/games/store/store.component';
import { LibraryComponent } from './components/games/library/library.component';
import { LoginComponent } from './components/authorization/login/login.component';
import { RegisterComponent } from './components/authorization/register/register.component';
import { authGuard } from './guards/auth.guard';
import { nonAuthGuard } from './guards/non-auth.guard';
import { unsavedChangesGuard } from './guards/unsaved-changes.guard';
import { TestErrorComponent } from './components/errors/test-error/test-error.component';
import { NotFoundComponent } from './components/errors/not-found/not-found.component';
import { ServerErrorComponent } from './components/errors/server-error/server-error.component';
import { PlayersListComponent } from './components/players/players-list/players-list.component';
import { PlayerProfileComponent } from './components/players/player-profile/player-profile.component';
import { GamePageComponent } from './components/games/game-page/game-page.component';
import { PlayerEditComponent } from './components/players/player-edit/player-edit.component';
import { GameEditComponent } from './components/games/game-edit/game-edit.component';
import { MessengerComponent } from './components/messages/messenger/messenger.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: '',
    runGuardsAndResolvers: 'always',
    canActivate: [authGuard],
    children: [
      { path: 'store', component: StoreComponent },
      { path: 'library', component: LibraryComponent },
      { path: 'games/:title', component: GamePageComponent },
      { path: 'games/:title/edit', component: GameEditComponent, canDeactivate: [unsavedChangesGuard] },
      { path: 'players', component: PlayersListComponent },
      { path: 'players/:username', component: PlayerProfileComponent },
      { path: 'edit-profile', component: PlayerEditComponent, canDeactivate: [unsavedChangesGuard] },
      { path: 'messenger', component: MessengerComponent }
    ]
  },
  { path: '',
    runGuardsAndResolvers: 'always',
    canActivate: [nonAuthGuard],
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent }, 
    ]
  },
  { path: 'errors', component: TestErrorComponent },
  { path: 'not-found', component: NotFoundComponent },
  { path: 'server-error', component: ServerErrorComponent },
  { path: '**', component: NotFoundComponent, pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
