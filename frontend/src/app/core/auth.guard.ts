import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { isTokenExpired } from './jwt.utils';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const token = auth.token;

  if (!token) {
    router.navigateByUrl('/login');
    return false;
  }

  if (isTokenExpired(token)) {
    auth.logout(); 
    return false;
  }

  return true;
};
