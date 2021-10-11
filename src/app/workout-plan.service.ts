import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { WorkoutPlan } from './workout-plan'
import { WORKOUT_PLANS } from './mock-workout-plans'

@Injectable({
  providedIn: 'root'
})
export class WorkoutPlanService {

  constructor() { }

  getWorkoutPlans(): Observable<WorkoutPlan[]> {
    const workoutPlans = of(WORKOUT_PLANS);
    return workoutPlans;
  }
}
