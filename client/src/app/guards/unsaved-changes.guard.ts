import { CanDeactivateFn } from '@angular/router';
import { inject } from '@angular/core';

import { ConfirmService } from '../services/confirm.service';
import { EditComponent } from '../interfaces/edit-component';

export const unsavedChangesGuard: CanDeactivateFn<EditComponent> = (component) => {
  const confirmService = inject(ConfirmService);
  
  if (component.isDirty()) {
    return confirmService.confirm(
      'Unsaved changes',
      'Are you sure you want to leave?',
      'Leave',
      'Cancel'
    );
  }
  return true;
};
