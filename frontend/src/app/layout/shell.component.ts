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
      <div class="w-full px-8 py-3 flex items-center justify-between">
        
        <div class="font-semibold text-slate-900">
          Training Tracker
        </div>

        <nav class="flex items-center gap-6">

          <a
            routerLink="/progress"
            routerLinkActive="font-semibold text-slate-900"
            class="text-slate-600 hover:text-slate-900 transition">
            Napredak
          </a>

          <a
            routerLink="/workouts"
            routerLinkActive="font-semibold text-slate-900"
            class="text-slate-600 hover:text-slate-900 transition">
            Treninzi
          </a>

          <button
            (click)="logout()"
            class="bg-slate-900 text-white px-4 py-2 rounded-xl hover:bg-slate-800 transition">
            Logout
          </button>

        </nav>
      </div>
    </header>

    <main class="w-full px-8 py-8">
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
