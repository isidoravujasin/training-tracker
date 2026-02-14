import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

function normalizePath(url: string): string {
  try {
    return new URL(url, window.location.origin).pathname;
  } catch {
    return url;
  }
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.token;

  const path = normalizePath(req.url);

  const isApiCall =
    path.startsWith('/api') || req.url.startsWith('/api') || req.url.startsWith('api');

  const isAuthCall =
    path.startsWith('/api/auth') || req.url.startsWith('/api/auth') || req.url.startsWith('api/auth');

  if (token && isApiCall && !isAuthCall) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(req);
};
