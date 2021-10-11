export interface WorkoutSegment {
	time: number;
	color: string;
	move: string;
	nextMove: string;
	sound: string;
	beepValue: number;
	finalBeep: boolean;
	lastSegmentInSet: boolean;
	started: boolean;
	blockId: string;
}