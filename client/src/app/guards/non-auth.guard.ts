import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';

import { map } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { AccountService } from '../services/account.service';

export const nonAuthGuard: CanActivateFn = (route, state) => {
  const accountService = inject(AccountService);
  const toastr = inject(ToastrService);

  return accountService.currentUser$.pipe(
    map(user => {
      if (user) {
        toastr.error('You already logged in');
        return false;
      } else {
        return true;
      }
    })
  );
};
