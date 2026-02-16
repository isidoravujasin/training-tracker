import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { finalize, timeout } from 'rxjs/operators';
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
          <input
            [(ngModel)]="email"
            (ngModelChange)="clearError()"
            type="email"
            class="w-full border rounded-xl px-3 py-2"
          />
        </div>

        <div>
          <label class="block text-sm text-slate-600 mb-1">Lozinka</label>
          <input
            [(ngModel)]="password"
            (ngModelChange)="clearError()"
            type="password"
            class="w-full border rounded-xl px-3 py-2"
          />
        </div>

        <div *ngIf="error"
          class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">
          {{ error }}
        </div>

        <button
          (click)="login()"
          [disabled]="loading || !canSubmit"
          class="w-full rounded-xl bg-slate-900 text-white py-2.5 font-medium disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer">
          {{ loading ? 'Prijavljivanje...' : 'Prijavi se' }}
        </button>

        <p class="text-sm text-slate-600">
          Nemaš nalog?
          <a routerLink="/register" class="font-medium underline cursor-pointer">Registruj se</a>
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
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  get canSubmit(): boolean {
    return !!this.email.trim() && !!this.password.trim();
  }

  clearError(): void {
    if (!this.error) return;
    this.error = '';
    this.cdr.markForCheck();
    try { this.cdr.detectChanges(); } catch {}
  }

  login() {
    if (!this.canSubmit) {
      this.error = 'Unesi email i lozinku.';
      this.cdr.markForCheck();
      try { this.cdr.detectChanges(); } catch {}
      return;
    }

    this.loading = true;
    this.error = '';
    this.cdr.markForCheck();
    try { this.cdr.detectChanges(); } catch {}

    this.http.post<LoginResponse>('/api/auth/login', {
      email: this.email.trim(),
      password: this.password
    })
    .pipe(
      timeout(10000),
      finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
        try { this.cdr.detectChanges(); } catch {}
      })
    )
    .subscribe({
      next: (res: LoginResponse) => {
        this.auth.setToken(res.token);
        this.router.navigateByUrl('/progress');
      },
      error: (err: HttpErrorResponse | any) => {
        console.log('LOGIN ERROR:', err);

        if (err?.name === 'TimeoutError') {
          this.error = 'Server ne odgovara (timeout).';
        } else if (err?.status === 0) {
          this.error = 'Ne mogu da se povežem sa serverom.';
        } else if (err?.status === 401) {
          this.error = 'Pogrešan email ili lozinka.';
        } else {
          this.error =
            (err as any)?.error?.error ??
            (err as any)?.error?.message ??
            (err as any)?.error?.detail ??
            (err as any)?.error?.title ??
            'Login nije uspeo.';
        }

        this.cdr.markForCheck();
        try { this.cdr.detectChanges(); } catch {}
      }
    });
  }
}
