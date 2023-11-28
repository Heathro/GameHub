import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';

import { map, of, switchMap } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { AccountService } from '../services/account.service';
import { GamesService } from '../services/games.service';

export const gameOwnerGuard: CanActivateFn = (route, state) => {
  const accountService = inject(AccountService);
  const gamesService = inject(GamesService);
  const toastr = inject(ToastrService);

  return accountService.currentUser$.pipe(
    switchMap(user => {
      if (!user) return of(false);

      const title = route.params['title'];
      if (!title) return of(false);

      return gamesService.getGame(title).pipe(
        map(game => {
          if (gamesService.isGameOwned(game)) {
            return true;
          } else {
            toastr.error('You are not the publisher');
            return false;
          }
        })
      );
    })
  );
};