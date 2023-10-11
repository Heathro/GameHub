import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './_components/home/home.component';
import { StoreComponent } from './_components/store/store.component';
import { LibraryComponent } from './_components/library/library.component';
import { LoginComponent } from './_components/login/login.component';
import { RegisterComponent } from './_components/register/register.component';
import { authGuard } from './_guards/auth.guard';
import { nonAuthGuard } from './_guards/non-auth.guard';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: '',
    runGuardsAndResolvers: 'always',
    canActivate: [authGuard],
    children: [
      { path: 'store', component: StoreComponent },
      { path: 'library', component: LibraryComponent },
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
  { path: '**', component: HomeComponent, pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
