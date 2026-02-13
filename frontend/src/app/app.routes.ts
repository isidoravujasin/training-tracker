import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

import { LoginComponent } from './features/auth/login.component';
import { RegisterComponent } from './features/auth/register.component';
import { ShellComponent } from './layout/shell.component';


import { ProgressComponent } from './features/progress/progress.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: 'progress', component: ProgressComponent },
      { path: '', redirectTo: 'progress', pathMatch: 'full' }
    ]
  },

  { path: '**', redirectTo: 'login' }
];
