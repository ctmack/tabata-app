import { WorkoutSegment } from './workout-segment';

export interface WorkoutPlan {
	name : string;
	sets : number;
	prepTime : number;
	exerciseTime: number;
	restTime: number;
	includeRests: boolean,
	segments : WorkoutSegment[];
}