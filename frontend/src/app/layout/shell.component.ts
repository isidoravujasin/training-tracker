import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterModule],
  template: `
  <div class="min-h-screen bg-slate-50">
    <header class="bg-white border-b">
      <div class="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <div class="font-semibold">Training Tracker</div>

        <nav class="flex items-center gap-4 text-sm">
          <a routerLink="/progress" routerLinkActive="font-semibold">Napredak</a>
          <button (click)="auth.logout()"
            class="rounded-xl bg-slate-900 text-white px-3 py-2">
            Logout
          </button>
        </nav>
      </div>
    </header>

    <main class="max-w-5xl mx-auto px-4 py-6">
      <router-outlet></router-outlet>
    </main>
  </div>
  `
})
export class ShellComponent {
  constructor(public auth: AuthService) {}
}
