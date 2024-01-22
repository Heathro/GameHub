import { CanDeactivateFn } from '@angular/router';
import { inject } from '@angular/core';

import { ConfirmService } from '../services/confirm.service';
import { EditComponent } from '../interfaces/edit-component';
import { AccountService } from '../services/account.service';

export const unsavedChangesGuard: CanDeactivateFn<EditComponent> = (component) => {  
  const accountService = inject(AccountService);
  const confirmService = inject(ConfirmService);
  
  if (accountService.isLoggedIn() && component.isDirty()) {
    return confirmService.confirm(
      'Unsaved changes',
      'Are you sure you want to leave?',
      'Leave',
      'Cancel'
    );
  }
  return true;
};
