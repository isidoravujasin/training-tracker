import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly key = 'token';

  constructor(private router: Router) {}

  get token(): string | null {
    return localStorage.getItem(this.key);
  }

  setToken(token: string) {
    localStorage.setItem(this.key, token);
  }

  clear() {
    localStorage.removeItem(this.key);
  }

  logout() {
    this.clear();
    this.router.navigateByUrl('/login');
  }

  isLoggedIn(): boolean {
    return !!this.token;
  }
}
