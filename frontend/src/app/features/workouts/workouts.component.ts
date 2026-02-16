import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { WorkoutsService, WorkoutDto, WorkoutUpsert } from './workouts.service';

type WorkoutForm = {
  type: number;
  startedAt: string;
  time: string;
  durationMinutes: number;
  caloriesBurned: number | null;
  intensity: number;
  fatigue: number;
  notes: string;
};



@Component({
  selector: 'app-workouts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="flex items-start justify-between gap-4 mb-6">
    <div>
      <div class="flex items-center gap-2">
        <h2 class="text-3xl font-bold tracking-tight text-slate-900">Treninzi</h2>
        <span class="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
          {{ workouts.length }} ukupno
        </span>
      </div>
      <p class="text-slate-500 mt-1">Dodaj, izmeni i obriši treninge.</p>
    </div>

    <button (click)="openCreate()"
      class="inline-flex items-center gap-2 rounded-xl bg-indigo-600 text-white px-5 py-2.5 text-sm font-medium shadow-sm hover:bg-indigo-500 transition active:scale-[0.98] cursor-pointer">
      + Novi trening
    </button>
  </div>

  <div *ngIf="loading" class="text-slate-600">Učitavanje...</div>

  <div *ngIf="error" class="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">
    {{ error }}
  </div>

  <div class="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm" *ngIf="!loading">
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-slate-50 text-slate-600">
          <tr>
            <th class="text-left px-4 py-3 font-medium">Datum</th>
            <th class="text-left px-4 py-3 font-medium">Tip</th>
            <th class="text-right px-4 py-3 font-medium">Trajanje</th>
            <th class="text-right px-4 py-3 font-medium">Kalorije</th>
            <th class="text-right px-4 py-3 font-medium">Intenzitet</th>
            <th class="text-right px-4 py-3 font-medium">Umor</th>
            <th class="text-left px-4 py-3 font-medium">Napomena</th>
            <th class="text-right px-4 py-3 font-medium">Akcije</th>
          </tr>
        </thead>

        <tbody class="divide-y divide-slate-100">
          <tr *ngFor="let w of workouts" class="hover:bg-slate-50/70 transition">
            <td class="px-4 py-3">
              <div class="font-medium text-slate-900">
                {{ formatDate(w.startedAt) }}
                <span *ngIf="w.startedTime" class="text-slate-500 font-normal"> • {{ w.startedTime }}</span>
              </div>
            </td>

            <td class="px-4 py-3">
              <span class="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700">
                {{ workoutTypeLabel(w.type) }}
              </span>
            </td>

            <td class="px-4 py-3 text-right text-slate-900">{{ w.durationMinutes }} min</td>
            <td class="px-4 py-3 text-right text-slate-900">{{ w.caloriesBurned ?? '-' }}</td>
            <td class="px-4 py-3 text-right text-slate-900">{{ w.intensity }}</td>
            <td class="px-4 py-3 text-right text-slate-900">{{ w.fatigue }}</td>
            <td class="px-4 py-3 text-slate-700">{{ w.notes || '-' }}</td>

            <td class="px-4 py-3 text-right">
              <div class="inline-flex items-center gap-2">
                <button
                  class="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                  (click)="openEdit(w)">
                  Izmeni
                </button>
                <button
                  class="px-3 py-1.5 rounded-xl border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition cursor-pointer"
                  (click)="remove(w)">
                  Obriši
                </button>
              </div>
            </td>
          </tr>

          <tr *ngIf="workouts.length === 0">
            <td class="px-4 py-10 text-center" colspan="8">
              <div class="mx-auto max-w-md">
                <div class="text-slate-900 font-semibold">Nema treninga</div>
                <div class="text-slate-500 text-sm mt-1">Klikni na “Novi trening” da dodaš prvi trening.</div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- MODAL -->
  <div *ngIf="modalOpen" class="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
    <div class="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200">
      <div class="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
        <div>
          <div class="font-semibold text-slate-900">
            {{ editingId ? 'Izmeni trening' : 'Novi trening' }}
          </div>
          <div class="text-xs text-slate-500">Popuni podatke i sačuvaj.</div>
        </div>

        <button
          class="h-9 w-9 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition cursor-pointer"
          (click)="closeModal()">
          ✕
        </button>
      </div>

      <div class="p-5 space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-sm text-slate-600 mb-1">Datum</label>
            <input [(ngModel)]="form.startedAt" type="date"
              class="w-full border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200" />
          </div>

          <div>
            <label class="block text-sm text-slate-600 mb-1">Vreme (opciono)</label>
            <input [(ngModel)]="form.time" type="time"
              class="w-full border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200" />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-sm text-slate-600 mb-1">Tip treninga</label>
<select [(ngModel)]="form.type"
  class="w-full border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 cursor-pointer">
  <option *ngFor="let t of workoutTypes" [ngValue]="t.value">
    {{ t.label }}
  </option>
</select>

          </div>
          <div></div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-sm text-slate-600 mb-1">Trajanje (min)</label>
            <input [(ngModel)]="form.durationMinutes" type="number" min="1"
              class="w-full border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200" />
          </div>

          <div>
            <label class="block text-sm text-slate-600 mb-1">Kalorije</label>
            <input [(ngModel)]="form.caloriesBurned" type="number" min="0"
              class="w-full border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200" />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-sm text-slate-600 mb-1">Intenzitet (1-10)</label>
            <input [(ngModel)]="form.intensity" type="number" min="1" max="10"
              class="w-full border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200" />
          </div>

          <div>
            <label class="block text-sm text-slate-600 mb-1">Umor (1-10)</label>
            <input [(ngModel)]="form.fatigue" type="number" min="1" max="10"
              class="w-full border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200" />
          </div>
        </div>

        <div>
          <label class="block text-sm text-slate-600 mb-1">Napomena</label>
          <input [(ngModel)]="form.notes" type="text"
            class="w-full border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
            placeholder="Opcionalno" />
        </div>

        <div *ngIf="formError"
          class="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">
          {{ formError }}
        </div>
      </div>

      <div class="px-5 py-4 border-t border-slate-200 flex items-center justify-end gap-2">
        <button
          class="rounded-xl px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 transition cursor-pointer"
          (click)="closeModal()">
          Otkaži
        </button>

        <button (click)="save()" [disabled]="saving"
          class="rounded-xl bg-indigo-600 text-white px-4 py-2 shadow-sm hover:bg-indigo-500 transition active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer">
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

workoutTypes = [
  { value: 1, label: 'Trening snage' },
  { value: 2, label: 'Kardio' },
  { value: 3, label: 'Fleksibilnost' },
  { value: 4, label: 'Ostalo' }
];


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
      time: w.startedTime ?? '',
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

    const startedTime = this.form.time?.trim() ? this.form.time.trim() : null;

    const payload: WorkoutUpsert = {
      type: Number(this.form.type),
      startedAt: this.form.startedAt,
      startedTime,
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
      time: `${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`,
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
    const d = this.toDateInput(dateString);
    const [y, m, day] = d.split('-').map(Number);
    if (!y || !m || !day) return dateString;
    return new Date(y, m - 1, day).toLocaleDateString('sr-RS');
  }

  workoutTypeLabel(type: number): string {
  return this.workoutTypes.find(t => t.value === type)?.label ?? `Tip ${type}`;
}

}
