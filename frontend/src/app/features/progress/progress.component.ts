import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize, Subject, takeUntil } from 'rxjs';
import { ProgressService, MonthlyProgressDto } from './progress.service';

@Component({
  selector: 'app-progress',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="flex items-start justify-between gap-4 mb-6">
    <div>
      <h2 class="text-2xl font-semibold text-slate-900">Napredak</h2>
      <p class="text-slate-600">Pregled po nedeljama za izabrani mesec.</p>
    </div>

    <div class="flex items-center gap-2">
      <select [(ngModel)]="selectedYear" (ngModelChange)="onFilterChange()"
        class="border rounded-xl px-3 py-2 bg-white">
        <option *ngFor="let y of years" [ngValue]="y">{{ y }}</option>
      </select>

      <select [(ngModel)]="selectedMonth" (ngModelChange)="onFilterChange()"
        class="border rounded-xl px-3 py-2 bg-white">
        <option *ngFor="let m of months" [ngValue]="m.value">{{ m.label }}</option>
      </select>
    </div>
  </div>

  <div *ngIf="loading" class="text-slate-600">Učitavanje...</div>

  <div *ngIf="error" class="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">
    {{ error }}
  </div>

  <ng-container *ngIf="data && !loading">

    <div class="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-6">
      <div class="bg-white border rounded-2xl p-4">
        <div class="text-sm text-slate-500">Broj treninga</div>
        <div class="text-2xl font-semibold">{{ totalWorkouts }}</div>
      </div>
      <div class="bg-white border rounded-2xl p-4">
        <div class="text-sm text-slate-500">Ukupno trajanje</div>
        <div class="text-2xl font-semibold">{{ totalMinutes }} min</div>
      </div>
      <div class="bg-white border rounded-2xl p-4">
        <div class="text-sm text-slate-500">Prosečan intenzitet</div>
        <div class="text-2xl font-semibold">{{ avgIntensity }}</div>
      </div>
      <div class="bg-white border rounded-2xl p-4">
        <div class="text-sm text-slate-500">Prosečan umor</div>
        <div class="text-2xl font-semibold">{{ avgFatigue }}</div>
      </div>
    </div>

    <div class="bg-white border rounded-2xl overflow-hidden">
      <div class="px-4 py-3 border-b font-medium">Nedelje</div>

      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-slate-50 text-slate-600">
            <tr>
              <th class="text-left px-4 py-3">Period</th>
              <th class="text-right px-4 py-3">Treninzi</th>
              <th class="text-right px-4 py-3">Trajanje (min)</th>
              <th class="text-right px-4 py-3">Avg intenzitet</th>
              <th class="text-right px-4 py-3">Avg umor</th>
            </tr>
          </thead>

          <tbody>
            <tr *ngFor="let w of data.weeks" class="border-t">
              <td class="px-4 py-3">
                {{ formatDate(w.weekStart) }} – {{ formatDate(getWeekEnd(w.weekStart)) }}
              </td>
              <td class="px-4 py-3 text-right">{{ w.workoutCount }}</td>
              <td class="px-4 py-3 text-right">{{ w.totalDurationMinutes }}</td>
              <td class="px-4 py-3 text-right">{{ displayAvg(w.avgIntensity, w.workoutCount) }}</td>
              <td class="px-4 py-3 text-right">{{ displayAvg(w.avgFatigue, w.workoutCount) }}</td>
            </tr>

            <tr *ngIf="data.weeks.length === 0" class="border-t">
              <td class="px-4 py-6 text-center text-slate-500" colspan="5">
                Nema treninga za izabrani mesec.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </ng-container>
  `
})
export class ProgressComponent implements OnDestroy {
  data: MonthlyProgressDto | null = null;
  loading = false;
  error = '';

  selectedYear = new Date().getFullYear();
  selectedMonth = new Date().getMonth() + 1;

  years = [this.selectedYear - 1, this.selectedYear, this.selectedYear + 1];

  months = [
    { value: 1, label: 'Januar' }, { value: 2, label: 'Februar' }, { value: 3, label: 'Mart' },
    { value: 4, label: 'April' }, { value: 5, label: 'Maj' }, { value: 6, label: 'Jun' },
    { value: 7, label: 'Jul' }, { value: 8, label: 'Avgust' }, { value: 9, label: 'Septembar' },
    { value: 10, label: 'Oktobar' }, { value: 11, label: 'Novembar' }, { value: 12, label: 'Decembar' },
  ];

  private destroy$ = new Subject<void>();
  private cancel$ = new Subject<void>();

  constructor(
    private progress: ProgressService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.load();
  }

  ngOnDestroy(): void {
    this.cancel$.next();
    this.cancel$.complete();
    this.destroy$.next();
    this.destroy$.complete();
  }

  onFilterChange(): void {
    this.cancel$.next();
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.cdr.markForCheck();

    this.progress.getMonthlyProgress(this.selectedYear, this.selectedMonth)
      .pipe(
        takeUntil(this.cancel$),
        takeUntil(this.destroy$),
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
          try { this.cdr.detectChanges(); } catch {}
        })
      )
      .subscribe({
        next: (res) => {
          this.data = res;
          this.cdr.markForCheck();
          try { this.cdr.detectChanges(); } catch {}
        },
        error: (err) => {
          this.error = err?.error?.error ?? 'Ne mogu da učitam napredak.';
          this.data = { year: this.selectedYear, month: this.selectedMonth, weeks: [] };
          this.cdr.markForCheck();
          try { this.cdr.detectChanges(); } catch {}
        }
      });
  }

  get totalWorkouts(): number {
    return this.data?.weeks.reduce((sum, w) => sum + (w.workoutCount ?? 0), 0) ?? 0;
  }

  get totalMinutes(): number {
    return this.data?.weeks.reduce((sum, w) => sum + (w.totalDurationMinutes ?? 0), 0) ?? 0;
  }

  get avgIntensity(): string {
    const weeks = this.data?.weeks ?? [];
    const total = weeks.reduce((s, w) => s + (w.workoutCount ?? 0), 0);
    if (!total) return '0';
    const weighted = weeks.reduce((s, w) => s + ((w.avgIntensity ?? 0) * (w.workoutCount ?? 0)), 0) / total;
    return this.round1(weighted).toString();
  }

  get avgFatigue(): string {
    const weeks = this.data?.weeks ?? [];
    const total = weeks.reduce((s, w) => s + (w.workoutCount ?? 0), 0);
    if (!total) return '0';
    const weighted = weeks.reduce((s, w) => s + ((w.avgFatigue ?? 0) * (w.workoutCount ?? 0)), 0) / total;
    return this.round1(weighted).toString();
  }

  round1(n: number | null | undefined): number {
    if (n === null || n === undefined) return 0;
    if (Number.isNaN(n)) return 0;
    return Math.round(n * 10) / 10;
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const parts = dateString.split('T')[0];
    const [year, month, day] = parts.split('-').map(Number);
    if (!year || !month || !day) return dateString;
    return new Date(year, month - 1, day).toLocaleDateString('sr-RS');
  }

  getWeekEnd(weekStart: string): string {
    const parts = weekStart.split('T')[0].split('-').map(Number);
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    d.setDate(d.getDate() + 6);

    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  displayAvg(value: number, workoutCount: number): string {
    if (!workoutCount) return '-';
    return this.round1(value).toString();
  }
}
