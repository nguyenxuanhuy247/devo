import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./features/time-tracking/time-tracking.component').then(
        (m) => m.TimeTrackingComponent,
      ),
  },
];
