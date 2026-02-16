import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

type RegisterResponse = { message?: string };

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
  <div class="min-h-screen flex items-center justify-center bg-slate-50 p-4">
    <div class="w-full max-w-md bg-white rounded-2xl shadow p-6">
      <h1 class="text-2xl font-semibold mb-1">Registracija</h1>
      <p class="text-slate-500 mb-6">Napravi nalog da bi pratio treninge.</p>

      <form (ngSubmit)="register()" #f="ngForm" class="space-y-3">

        <div>
          <label class="block text-sm text-slate-600 mb-1">Email</label>
          <input
            name="email"
            [(ngModel)]="email"
            required
            email
            type="email"
            class="w-full border rounded-xl px-3 py-2"
          />
          <p *ngIf="f.submitted && !isEmailValid()" class="text-sm text-red-600 mt-1">
            Unesi validan email.
          </p>
        </div>

        <div>
          <label class="block text-sm text-slate-600 mb-1">Lozinka</label>
          <input
            name="password"
            [(ngModel)]="password"
            required
            minlength="6"
            type="password"
            class="w-full border rounded-xl px-3 py-2"
          />
          <p *ngIf="f.submitted && password.trim().length < 6" class="text-sm text-red-600 mt-1">
            Lozinka mora imati bar 6 karaktera.
          </p>
        </div>

        <div>
          <label class="block text-sm text-slate-600 mb-1">Potvrdi lozinku</label>
          <input
            name="confirmPassword"
            [(ngModel)]="confirmPassword"
            required
            type="password"
            class="w-full border rounded-xl px-3 py-2"
          />
          <p *ngIf="f.submitted && !passwordsMatch()" class="text-sm text-red-600 mt-1">
            Lozinke se ne poklapaju.
          </p>
        </div>

        <div *ngIf="error"
          class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">
          {{ error }}
        </div>

        <button
          type="submit"
          [disabled]="loading || f.invalid || !passwordsMatch()"
          class="w-full rounded-xl bg-slate-900 text-white py-2.5 font-medium disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer">
          {{ loading ? 'Kreiranje naloga...' : 'Registruj se' }}
        </button>

        <p class="text-sm text-slate-600">
          Već imaš nalog?
          <a routerLink="/login" class="font-medium underline cursor-pointer">Prijavi se</a>
        </p>

      </form>
    </div>
  </div>
  `
})
export class RegisterComponent {
  email = '';
  password = '';
  confirmPassword = '';
  loading = false;
  error = '';

  constructor(private http: HttpClient, private router: Router) {}

  isEmailValid(): boolean {
    return !!this.email && this.email.includes('@') && this.email.includes('.');
  }

  passwordsMatch(): boolean {
    return this.password.trim().length > 0 && this.password === this.confirmPassword;
  }

  register(): void {
    this.error = '';

    if (!this.isEmailValid() || this.password.trim().length < 6 || !this.passwordsMatch()) {
      this.error = 'Proveri uneta polja.';
      return;
    }

    this.loading = true;

    this.http.post<RegisterResponse>('/api/auth/register', {
      email: this.email.trim(),
      password: this.password
    }).subscribe({
      next: () => {
        this.router.navigateByUrl('/login');
      },
      error: (err) => {
        this.error = err?.error?.error ?? 'Registracija nije uspela.';
        this.loading = false;
      },
      complete: () => (this.loading = false)
    });
  }
}
