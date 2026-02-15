import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export type WorkoutDto = {
  id: string;
  type: number;
  startedAt: string;        
  startedTime?: string | null;       
  durationMinutes: number;
  caloriesBurned: number | null;
  intensity: number;
  fatigue: number;
  notes?: string | null;
};

export type WorkoutUpsert = {
  type: number;
  startedAt: string;        
  startedTime: string | null;       
  durationMinutes: number;
  caloriesBurned: number | null;
  intensity: number;
  fatigue: number;
  notes: string | null;
};

type PagedResult<T> = {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  items: T[];
};

@Injectable({ providedIn: 'root' })
export class WorkoutsService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<WorkoutDto[]> {
    return this.http
      .get<PagedResult<WorkoutDto>>('/api/workouts')
      .pipe(map(r => r.items ?? []));
  }

  create(payload: WorkoutUpsert): Observable<void> {
    return this.http.post<void>('/api/workouts', payload);
  }

  update(id: string, payload: WorkoutUpsert): Observable<void> {
    return this.http.put<void>(`/api/workouts/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`/api/workouts/${id}`);
  }
}
