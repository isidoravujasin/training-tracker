import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { WorkoutsService, WorkoutDto } from './workouts.service';

type WorkoutForm = {
  type: number;
  startedAt: string;
  durationMinutes: number;
  caloriesBurned: number | null;
  intensity: number;
  fatigue: number;
  notes: string;
};

type WorkoutUpsert = {
  type: number;
  startedAt: string;
  durationMinutes: number;
  caloriesBurned: number | null;
  intensity: number;
  fatigue: number;
  notes: string | null;
};

@Component({
  selector: 'app-workouts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="flex items-start justify-between gap-4 mb-6">
    <div>
      <h2 class="text-2xl font-semibold text-slate-900">Treninzi</h2>
      <p class="text-slate-600">Dodaj, izmeni i obriši treninge.</p>
    </div>

    <button (click)="openCreate()"
      class="rounded-xl bg-slate-900 text-white px-4 py-2.5 text-sm font-medium">
      + Novi trening
    </button>
  </div>

  <div *ngIf="loading" class="text-slate-600">Učitavanje...</div>

  <div *ngIf="error" class="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">
    {{ error }}
  </div>

  <!-- Lista -->
  <div class="bg-white border rounded-2xl overflow-hidden" *ngIf="!loading">
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-slate-50 text-slate-600">
          <tr>
            <th class="text-left px-4 py-3">Datum</th>
            <th class="text-left px-4 py-3">Tip</th>
            <th class="text-right px-4 py-3">Trajanje</th>
            <th class="text-right px-4 py-3">Kalorije</th>
            <th class="text-right px-4 py-3">Intenzitet</th>
            <th class="text-right px-4 py-3">Umor</th>
            <th class="text-left px-4 py-3">Napomena</th>
            <th class="text-right px-4 py-3">Akcije</th>
          </tr>
        </thead>

        <tbody>
          <tr *ngFor="let w of workouts" class="border-t">
            <td class="px-4 py-3">{{ formatDate(w.startedAt) }}</td>
            <td class="px-4 py-3">{{ workoutTypeLabel(w.type) }}</td>
            <td class="px-4 py-3 text-right">{{ w.durationMinutes }} min</td>
            <td class="px-4 py-3 text-right">{{ w.caloriesBurned ?? '-' }}</td>
            <td class="px-4 py-3 text-right">{{ w.intensity }}</td>
            <td class="px-4 py-3 text-right">{{ w.fatigue }}</td>
            <td class="px-4 py-3">{{ w.notes || '-' }}</td>
            <td class="px-4 py-3 text-right">
              <button class="text-slate-900 underline mr-3" (click)="openEdit(w)">Izmeni</button>
              <button class="text-red-700 underline" (click)="remove(w)">Obriši</button>
            </td>
          </tr>

          <tr *ngIf="workouts.length === 0" class="border-t">
            <td class="px-4 py-6 text-center text-slate-500" colspan="8">
              Nema treninga. Klikni “Novi trening”.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- MODAL -->
  <div *ngIf="modalOpen" class="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
    <div class="w-full max-w-lg bg-white rounded-2xl shadow border">
      <div class="px-5 py-4 border-b flex items-center justify-between">
        <div class="font-semibold">
          {{ editingId ? 'Izmeni trening' : 'Novi trening' }}
        </div>
        <button class="text-slate-500 hover:text-slate-900" (click)="closeModal()">✕</button>
      </div>

      <div class="p-5 space-y-3">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-sm text-slate-600 mb-1">Datum</label>
            <input [(ngModel)]="form.startedAt" type="date"
              class="w-full border rounded-xl px-3 py-2" />
          </div>

          <div>
            <label class="block text-sm text-slate-600 mb-1">Tip (enum)</label>
            <select [(ngModel)]="form.type" class="w-full border rounded-xl px-3 py-2 bg-white">
              <option [ngValue]="1">Strength</option>
              <option [ngValue]="2">Cardio</option>
              <option [ngValue]="3">Mobility</option>
              <option [ngValue]="4">Other</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-sm text-slate-600 mb-1">Trajanje (min)</label>
            <input [(ngModel)]="form.durationMinutes" type="number" min="1"
              class="w-full border rounded-xl px-3 py-2" />
          </div>

          <div>
            <label class="block text-sm text-slate-600 mb-1">Kalorije</label>
            <input [(ngModel)]="form.caloriesBurned" type="number" min="0"
              class="w-full border rounded-xl px-3 py-2" />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-sm text-slate-600 mb-1">Intenzitet (1-10)</label>
            <input [(ngModel)]="form.intensity" type="number" min="1" max="10"
              class="w-full border rounded-xl px-3 py-2" />
          </div>

          <div>
            <label class="block text-sm text-slate-600 mb-1">Umor (1-10)</label>
            <input [(ngModel)]="form.fatigue" type="number" min="1" max="10"
              class="w-full border rounded-xl px-3 py-2" />
          </div>
        </div>

        <div>
          <label class="block text-sm text-slate-600 mb-1">Napomena</label>
          <input [(ngModel)]="form.notes" type="text"
            class="w-full border rounded-xl px-3 py-2" placeholder="Opcionalno" />
        </div>

        <div *ngIf="formError"
          class="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">
          {{ formError }}
        </div>
      </div>

      <div class="px-5 py-4 border-t flex items-center justify-end gap-2">
        <button class="rounded-xl px-4 py-2 border" (click)="closeModal()">Otkaži</button>
        <button (click)="save()" [disabled]="saving"
          class="rounded-xl bg-slate-900 text-white px-4 py-2 disabled:opacity-60">
          {{ saving ? 'Čuvanje...' : 'Sačuvaj' }}
        </button>
      </div>
    </div>
  </div>
  `
})
export class WorkoutsComponent {
  workouts: WorkoutDto[] = [];
  loading = false;
  saving = false;
  error = '';

  modalOpen = false;
  editingId: string | null = null;
  formError = '';

  form: WorkoutForm = this.emptyForm();

  constructor(
    private workoutsApi: WorkoutsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.cdr.markForCheck();

    this.workoutsApi.getAll()
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
        try { this.cdr.detectChanges(); } catch {}
      }))
      .subscribe({
        next: (res) => {
          this.workouts = res ?? [];
          this.cdr.markForCheck();
          try { this.cdr.detectChanges(); } catch {}
        },
        error: (err) => {
          this.error = err?.error?.error ?? 'Ne mogu da učitam treninge.';
          this.workouts = [];
          this.cdr.markForCheck();
          try { this.cdr.detectChanges(); } catch {}
        }
      });
  }

  openCreate(): void {
    this.editingId = null;
    this.form = this.emptyForm();
    this.formError = '';
    this.modalOpen = true;
    this.cdr.markForCheck();
  }

  openEdit(w: WorkoutDto): void {
    this.editingId = w.id;
    this.form = {
      type: w.type,
      startedAt: this.toDateInput(w.startedAt),
      durationMinutes: w.durationMinutes,
      caloriesBurned: w.caloriesBurned ?? 0,
      intensity: w.intensity,
      fatigue: w.fatigue,
      notes: w.notes ?? ''
    };
    this.formError = '';
    this.modalOpen = true;
    this.cdr.markForCheck();
  }

  closeModal(): void {
    if (this.saving) return;
    this.modalOpen = false;
    this.cdr.markForCheck();
  }

  save(): void {
    this.formError = '';

    if (!this.form.startedAt) {
      this.formError = 'Datum je obavezan.';
      return;
    }

    const duration = Number(this.form.durationMinutes);
    const intensity = Number(this.form.intensity);
    const fatigue = Number(this.form.fatigue);

    const calories =
      this.form.caloriesBurned === null || this.form.caloriesBurned === undefined
        ? null
        : Number(this.form.caloriesBurned);

    if (!duration || duration < 1) {
      this.formError = 'Trajanje mora biti >= 1.';
      return;
    }

    if (intensity < 1 || intensity > 10) {
      this.formError = 'Intenzitet mora biti 1-10.';
      return;
    }

    if (fatigue < 1 || fatigue > 10) {
      this.formError = 'Umor mora biti 1-10.';
      return;
    }

    const payload: WorkoutUpsert = {
      type: Number(this.form.type),
      startedAt: this.form.startedAt,
      durationMinutes: duration,
      caloriesBurned: calories,
      intensity,
      fatigue,
      notes: this.form.notes?.trim() || null
    };

    this.saving = true;
    this.cdr.markForCheck();

    const req$ = this.editingId
      ? this.workoutsApi.update(this.editingId, payload)
      : this.workoutsApi.create(payload);

    req$
      .pipe(finalize(() => {
        this.saving = false;
        this.cdr.markForCheck();
        try { this.cdr.detectChanges(); } catch {}
      }))
      .subscribe({
        next: () => {
          this.modalOpen = false;
          this.load();
        },
        error: (err) => {
          this.formError = err?.error?.error ?? 'Greška pri čuvanju treninga.';
          this.cdr.markForCheck();
          try { this.cdr.detectChanges(); } catch {}
        }
      });
  }

  remove(w: WorkoutDto): void {
    const ok = confirm(`Obrisati trening za ${this.formatDate(w.startedAt)}?`);
    if (!ok) return;

    this.workoutsApi.delete(w.id).subscribe({
      next: () => {
        this.workouts = this.workouts.filter(x => x.id !== w.id);
        this.cdr.markForCheck();
        try { this.cdr.detectChanges(); } catch {}
      },
      error: (err) => alert(err?.error?.error ?? 'Ne mogu da obrišem trening.')
    });
  }

  emptyForm(): WorkoutForm {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');

    return {
      type: 1,
      startedAt: `${yyyy}-${mm}-${dd}`,
      durationMinutes: 45,
      caloriesBurned: 0,
      intensity: 5,
      fatigue: 5,
      notes: ''
    };
  }

  toDateInput(dateString: string): string {
    return (dateString || '').split('T')[0];
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const parts = dateString.split('T')[0];
    const [y, m, d] = parts.split('-').map(Number);
    if (!y || !m || !d) return dateString;
    return new Date(y, m - 1, d).toLocaleDateString('sr-RS');
  }

  workoutTypeLabel(type: number): string {
    switch (type) {
      case 1: return 'Strength';
      case 2: return 'Cardio';
      case 3: return 'Mobility';
      case 4: return 'Other';
      default: return `Type ${type}`;
    }
  }
}
