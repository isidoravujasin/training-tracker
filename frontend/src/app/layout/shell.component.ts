import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterModule],
  template: `
  <div class="min-h-screen bg-gradient-to-b from-slate-50 to-white">
    <header class="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-200">
      <div class="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">

        <div class="flex items-center gap-3 select-none">
          <div class="h-9 w-9 rounded-xl bg-indigo-600 text-white grid place-items-center shadow-sm">
            <span class="text-sm font-semibold">TT</span>
          </div>
          <div class="leading-tight">
            <div class="font-semibold text-slate-900">Training Tracker</div>
            <div class="text-xs text-slate-500">Workouts • Progress</div>
          </div>
        </div>

        <nav class="flex items-center gap-2">
          <a
            routerLink="/progress"
            routerLinkActive="bg-indigo-50 text-indigo-700 border-indigo-200"
            [routerLinkActiveOptions]="{ exact: true }"
            class="px-3 py-2 rounded-xl border border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition cursor-pointer">
            Napredak
          </a>

          <a
            routerLink="/workouts"
            routerLinkActive="bg-indigo-50 text-indigo-700 border-indigo-200"
            [routerLinkActiveOptions]="{ exact: true }"
            class="px-3 py-2 rounded-xl border border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition cursor-pointer">
            Treninzi
          </a>

          <div class="w-px h-7 bg-slate-200 mx-1"></div>

          <button
            (click)="logout()"
            class="inline-flex items-center gap-2 rounded-xl bg-slate-900 text-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-slate-800 transition active:scale-[0.98] cursor-pointer">
            Logout
          </button>
        </nav>
      </div>
    </header>

    <main class="max-w-6xl mx-auto px-6 py-8">
      <router-outlet></router-outlet>
    </main>
  </div>
  `
})
export class ShellComponent {
  constructor(public auth: AuthService) {}

  logout(): void {
    this.auth.logout();
  }
}
