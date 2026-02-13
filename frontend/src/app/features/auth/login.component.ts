import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/auth.service';

type LoginResponse = { token: string }; 

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
  <div class="min-h-screen flex items-center justify-center bg-slate-50 p-4">
    <div class="w-full max-w-md bg-white rounded-2xl shadow p-6">
      <h1 class="text-2xl font-semibold mb-1">Prijava</h1>
      <p class="text-slate-500 mb-6">Uloguj se da bi pratio treninge.</p>

      <div class="space-y-3">
        <div>
          <label class="block text-sm text-slate-600 mb-1">Email</label>
          <input [(ngModel)]="email" type="email"
            class="w-full border rounded-xl px-3 py-2" />
        </div>

        <div>
          <label class="block text-sm text-slate-600 mb-1">Lozinka</label>
          <input [(ngModel)]="password" type="password"
            class="w-full border rounded-xl px-3 py-2" />
        </div>

        <div *ngIf="error"
          class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">
          {{ error }}
        </div>

        <button (click)="login()" [disabled]="loading"
          class="w-full rounded-xl bg-slate-900 text-white py-2.5 font-medium disabled:opacity-60">
          {{ loading ? 'Prijavljivanje...' : 'Prijavi se' }}
        </button>

        <p class="text-sm text-slate-600">
          Nemaš nalog?
          <a routerLink="/register" class="font-medium underline">Registruj se</a>
        </p>
      </div>
    </div>
  </div>
  `
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  error = '';

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private router: Router
  ) {}

  login() {
    this.loading = true;
    this.error = '';

    this.http.post<LoginResponse>('/api/auth/login', {
      email: this.email,
      password: this.password
    }).subscribe({
      next: (res) => {
        this.auth.setToken(res.token);
        this.router.navigateByUrl('/progress');
      },
      error: (err) => {
        this.error = err?.error?.error ?? 'Login nije uspeo.';
        this.loading = false;
      },
      complete: () => this.loading = false
    });
  }
}
