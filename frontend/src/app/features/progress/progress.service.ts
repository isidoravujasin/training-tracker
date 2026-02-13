import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type WeeklyProgressDto = {
  weekStart: string;       
  workoutCount: number;
  totalDurationMinutes: number;
  avgIntensity: number;
  avgFatigue: number;
};

export type MonthlyProgressDto = {
  year: number;
  month: number; 
  weeks: WeeklyProgressDto[];
};


@Injectable({ providedIn: 'root' })
export class ProgressService {
  constructor(private http: HttpClient) {}

  getMonthlyProgress(year: number, month: number): Observable<MonthlyProgressDto> {
    return this.http.get<MonthlyProgressDto>(`/api/progress/monthly?year=${year}&month=${month}`);
  }
}
