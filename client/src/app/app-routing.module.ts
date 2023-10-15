import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './_components/basic/home/home.component';
import { StoreComponent } from './_components/games/store/store.component';
import { LibraryComponent } from './_components/games/library/library.component';
import { LoginComponent } from './_components/authorization/login/login.component';
import { RegisterComponent } from './_components/authorization/register/register.component';
import { authGuard } from './_guards/auth.guard';
import { nonAuthGuard } from './_guards/non-auth.guard';
import { TestErrorComponent } from './_components/errors/test-error/test-error.component';
import { NotFoundComponent } from './_components/errors/not-found/not-found.component';
import { ServerErrorComponent } from './_components/errors/server-error/server-error.component';
import { PlayersListComponent } from './_components/players/players-list/players-list.component';
import { PlayerProfileComponent } from './_components/players/player-profile/player-profile.component';
import { GamePageComponent } from './_components/games/game-page/game-page.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: '',
    runGuardsAndResolvers: 'always',
    canActivate: [authGuard],
    children: [
      { path: 'store', component: StoreComponent },
      { path: 'library', component: LibraryComponent },
      { path: 'games/:title', component: GamePageComponent },
      { path: 'players', component: PlayersListComponent },
      { path: 'players/:username', component: PlayerProfileComponent }
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
  { path: '**', component: HomeComponent, pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
