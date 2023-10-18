import { CanDeactivateFn } from '@angular/router';

import { PlayerEditComponent } from '../_components/players/player-edit/player-edit.component';

export const unsavedChangesGuard: CanDeactivateFn<PlayerEditComponent> = (component) => {
  if (component.editForm?.dirty) {
    return confirm('Changes you made may not be saved.');
  }
  return true;
};
