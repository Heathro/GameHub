import { CanDeactivateFn } from '@angular/router';

import { EditComponent } from '../interfaces/edit-component';

export const unsavedChangesGuard: CanDeactivateFn<EditComponent> = (component) => {
  if (component.isDirty()) {
    return confirm('Changes you made may not be saved.');
  }
  return true;
};
