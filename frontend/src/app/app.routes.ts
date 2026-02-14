import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

import { LoginComponent } from './features/auth/login.component';
import { RegisterComponent } from './features/auth/register.component';
import { ShellComponent } from './layout/shell.component';

import { ProgressComponent } from './features/progress/progress.component';
import { WorkoutsComponent } from './features/workouts/workouts.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: 'workouts', component: WorkoutsComponent },
      { path: 'progress', component: ProgressComponent },

      { path: '', redirectTo: 'workouts', pathMatch: 'full' },
    ]
  },

  { path: '**', redirectTo: 'login' }
];
