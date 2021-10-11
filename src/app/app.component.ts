import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { WorkoutSegment } from './workout-segment';
import { WorkoutPlan } from './workout-plan';
import { WorkoutPlanService } from './workout-plan.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {

  timer: number = 0;
  startTime: number = 0;
  finishTime: number = 0;

  paused: boolean = true;
  finalBeep: boolean = true;
  workoutComplete: boolean = false;
  beepValue: number = 4;
  showRests: boolean = false;

  segments: WorkoutSegment[] = [];
  activeSegment?: WorkoutSegment;
  currentWorkoutPlan: WorkoutPlan;
  workoutPlans: WorkoutPlan[] = [];

  constructor(private workoutPlanService: WorkoutPlanService) {
    this.currentWorkoutPlan = <WorkoutPlan>{};
  }

  getWorkoutPlans(): void {
    this.workoutPlanService.getWorkoutPlans().subscribe(
      workoutPlans => {
        this.workoutPlans = workoutPlans;
      }
    );
  }

  ngOnInit(): void {
    this.getWorkoutPlans();
    (<HTMLElement> document.getElementById("controller-expanded")).style.color = "rgb(50,50,50)";
    this.showSimpleDisplay();
    this.createWorkoutPlanFromInputs();
    this.populateSegments();
    this.resetTimer();

    document.getElementById('start-pause')!.addEventListener("click", () => {
      this.startPauseFunctionality();
    });

    document.getElementById('simple-start-pause')!.addEventListener("click", () => {
      this.startPauseFunctionality();
    });

    (<HTMLElement> document.getElementById("controller-simple"))!.addEventListener("click", () => {
      this.showSimpleDisplay();
    });

    (<HTMLElement> document.getElementById("controller-expanded"))!.addEventListener("click", () => {
      this.showExpandedDisplay();
    });

    (<HTMLElement> document.getElementById("reset"))!.addEventListener("click", () => {
      this.createWorkoutPlanFromInputs();
      this.resetTimer();
    });

    (<HTMLElement> document.getElementById("simple-reset"))!.addEventListener("click", () => {
      this.createWorkoutPlanFromInputs();
      this.resetTimer();
    });

    (<HTMLElement> document.getElementById('exercise-length-minus'))!.addEventListener("click", () => {
      this.timeMinus('exercise-length');
    });

    (<HTMLElement> document.getElementById('exercise-length-plus'))!.addEventListener("click", () => {
      this.timePlus('exercise-length');
    });

    (<HTMLElement> document.getElementById('rest-length-minus'))!.addEventListener("click", () => {
      this.timeMinus('rest-length');
    });

    (<HTMLElement> document.getElementById('rest-length-plus'))!.addEventListener("click", () => {
      this.timePlus('rest-length');
    });

    (<HTMLElement> document.getElementById('prep-length-minus'))!.addEventListener("click", () => {
      this.timeMinus('prep-length');
    });

    (<HTMLElement> document.getElementById('prep-length-plus'))!.addEventListener("click", () => {
      this.timePlus('prep-length');
    });

    (<HTMLElement> document.getElementById('exercise-count-minus'))!.addEventListener("click", () => {
      if(parseInt((<HTMLInputElement> document.getElementById('exercise-count'))!.value) > 1){
        (<HTMLInputElement> document.getElementById('exercise-count'))!.value = (parseInt((<HTMLInputElement> document.getElementById('exercise-count'))!.value) - 1).toString();
      }
      this.createWorkoutPlanFromInputs();
      this.resetTimer();
    });
    (<HTMLElement> document.getElementById('exercise-count-plus'))!.addEventListener("click", () => {
      if(parseInt((<HTMLInputElement> document.getElementById('exercise-count'))!.value) < 99){
        (<HTMLInputElement> document.getElementById('exercise-count'))!.value = (parseInt((<HTMLInputElement> document.getElementById('exercise-count'))!.value) + 1).toString();
      }
      this.createWorkoutPlanFromInputs();
      this.resetTimer();
    });
    (<HTMLElement> document.getElementById('exercise-sets-minus'))!.addEventListener("click", () => {
      if(parseInt((<HTMLInputElement> document.getElementById('exercise-sets'))!.value) > 1){
        (<HTMLInputElement> document.getElementById('exercise-sets'))!.value = (parseInt((<HTMLInputElement> document.getElementById('exercise-sets'))!.value) - 1).toString();
      }
      this.createWorkoutPlanFromInputs();
      this.resetTimer();
    });
    (<HTMLElement> document.getElementById('exercise-sets-plus'))!.addEventListener("click", () => {
      if(parseInt((<HTMLInputElement> document.getElementById('exercise-sets'))!.value) < 99){
        (<HTMLInputElement> document.getElementById('exercise-sets'))!.value = (parseInt((<HTMLInputElement> document.getElementById('exercise-sets'))!.value) + 1).toString();
      }
      this.createWorkoutPlanFromInputs();
      this.resetTimer();
    });

    (<HTMLElement> document.getElementById('exercise-sets'))!.addEventListener("change", () => {
      this.formatCount('exercise-sets');
    });

    (<HTMLElement> document.getElementById('exercise-count'))!.addEventListener("change", () => {
      this.formatCount('exercise-count');
    });

    (<HTMLElement> document.getElementById('exercise-length-minutes'))!.addEventListener("change", () => {
      this.formatTime('exercise-length-minutes');
    });
    (<HTMLElement> document.getElementById('exercise-length-seconds'))!.addEventListener("change", () => {
      this.formatTime('exercise-length-seconds');
    });
    (<HTMLElement> document.getElementById('prep-length-minutes'))!.addEventListener("change", () => {
      this.formatTime('prep-length-minutes');
    });
    (<HTMLElement> document.getElementById('prep-length-seconds'))!.addEventListener("change", () => {
      this.formatTime('prep-length-seconds');
    });
    (<HTMLElement> document.getElementById('rest-length-minutes'))!.addEventListener("change", () => {
      this.formatTime('rest-length-minutes');
    });
    (<HTMLElement> document.getElementById('rest-length-seconds'))!.addEventListener("change", () => {
      this.formatTime('rest-length-seconds');
    });

    (<HTMLElement> document.getElementById('show-rests-button'))!.addEventListener("click", () => {
      if(this.showRests){
        this.showRests = false;
        document.getElementById('show-rests-button')!.innerHTML = "Show Rests";
      }
      else{
        this.showRests = true;
        document.getElementById('show-rests-button')!.innerHTML = "Hide Rests";
      }
      this.setExerciseBlocks();
    });

    this.setWorkoutPlanPresets();
  }

  ngOnDestroy(): void {
    (<HTMLElement> document.getElementById("controller-planner")).style.color = "rgb(180,180,180)";
  }

  startPauseFunctionality(): void{
    if(this.segments!.length <= 0){
      this.populateSegments();
      (<HTMLAudioElement> document.getElementById(this.segments[0]!.sound))!.play();
    }
    if(this.segments[0]!.started == false){
      this.segments[0]!.started = true;
      (<HTMLAudioElement> document.getElementById(this.segments[0]!.sound))!.play();
    }

    this.startTime = Date.now();
    this.finishTime = Date.now() + (this.segments[0]!.time*1000);
    clearTimeout(this.timer);
    this.setMoveStatus();

    if(this.segments[0]!.time == 0){
      document.getElementById('start-pause')!.innerHTML = "Pause";
      document.getElementById('start-pause')!.classList.remove('start-pause-inactive');
      document.getElementById('start-pause')!.classList.add('start-pause-active');
      document.getElementById('simple-start-pause')!.innerHTML = "Pause";
      document.getElementById('simple-start-pause')!.classList.remove('start-pause-inactive');
      document.getElementById('simple-start-pause')!.classList.add('start-pause-active');

      (<HTMLAudioElement> document.getElementById(this.segments[0]!.sound))!.play();

      this.startTime = Date.now();
      this.finishTime = Date.now() + (this.segments[0]!.time*1000);

      this.setTimer(Math.floor(this.segments[0]!.time), this.segments[0]!.color);
      this.setMoveStatus();
      this.paused = false;
      this.counter();
    }
    else {
      this.paused = !this.paused;
      if(!this.paused) {
        this.counter();
        document.getElementById('start-pause')!.innerHTML = "Pause";
        document.getElementById('start-pause')!.classList.remove('start-pause-inactive');
        document.getElementById('start-pause')!.classList.add('start-pause-active');
        document.getElementById('simple-start-pause')!.innerHTML = "Pause";
        document.getElementById('simple-start-pause')!.classList.remove('start-pause-inactive');
        document.getElementById('simple-start-pause')!.classList.add('start-pause-active');
      }
      else {
        document.getElementById('start-pause')!.innerHTML = "Start";
        document.getElementById('start-pause')!.classList.remove('start-pause-active');
        document.getElementById('start-pause')!.classList.add('start-pause-inactive');
        document.getElementById('simple-start-pause')!.innerHTML = "Start";
        document.getElementById('simple-start-pause')!.classList.remove('start-pause-active');
        document.getElementById('simple-start-pause')!.classList.add('start-pause-inactive');
      }
    }
  }

  populateSegments(): void {
    this.segments = [];

    if(this.currentWorkoutPlan.prepTime >= 1){
      this.segments.unshift({time: this.currentWorkoutPlan.prepTime, color: "rgb(137,157,210)", move: "Get Ready", nextMove: "", sound: "getready", beepValue: Math.min(Math.floor(this.currentWorkoutPlan.prepTime), 4), finalBeep: true, lastSegmentInSet: false, started: false, blockId: ""});
    }
    
    for(var i = 0; i < this.currentWorkoutPlan.sets; i++){
      for(var j = 0; j < this.currentWorkoutPlan.segments.length; j++){
        if(this.segments!.length >= 1){
          this.segments[this.segments!.length-1]!.nextMove = this.currentWorkoutPlan.segments[j].move;
        }
        var segmentId = "segment-" + (j + 1);
        this.segments.push({
          time: this.currentWorkoutPlan.segments[j].time, 
          color: this.currentWorkoutPlan.segments[j].color, 
          move: this.currentWorkoutPlan.segments[j].move, 
          nextMove: "", 
          sound: "work", 
          beepValue: Math.min(Math.floor(this.currentWorkoutPlan.segments[j].time), 4), 
          finalBeep: true, 
          lastSegmentInSet: false, 
          started: false, 
          blockId: segmentId
        });
        if(this.currentWorkoutPlan.restTime >= 1 && this.currentWorkoutPlan.includeRests == true){
          this.segments[this.segments!.length-1]!.nextMove = "Rest";
          var restSegmentId = "rest-segment-" + (j + 1);
          this.segments!.push({
            time: this.currentWorkoutPlan.restTime, 
            color: "rgb(221,204,123)", 
            move: "Rest", 
            nextMove: "", 
            sound: "rest", 
            beepValue: Math.min(Math.floor(this.currentWorkoutPlan.restTime), 4), 
            finalBeep: true, 
            lastSegmentInSet: false, 
            started: false, 
            blockId: restSegmentId});
        }
        if(j == this.currentWorkoutPlan.segments.length - 1){
          this.segments[this.segments.length-1].lastSegmentInSet = true;  
        }

      }
    }

    if(this.segments.length > 0){
      //Remove last element (extra rest)
      if(this.currentWorkoutPlan.restTime >= 1 && this.segments.length > 0){
        this.segments.pop();
      }
      //Add last move as done
      this.segments[this.segments.length-1].nextMove = "Done";
    }
    this.setTimer(this.getTotalSegmentTime(), "black");
  }

  setTimer(time: number, color: string) : void {
    if(time <= 0){
      var minutes = 0;
      var seconds = 0;
    }
    else{
      var timeVal = time;
      var minutes = Math.floor(timeVal / 60);
      var seconds = Math.floor(timeVal % 60);
    }
    document.getElementById('timer')!.innerHTML = minutes + ":" + seconds.toLocaleString('en-US', {
      minimumIntegerDigits: 2,
      useGrouping: false
    });
    if(document.getElementById(this.segments[0].blockId) != null){
      (<HTMLElement> document.getElementById(this.segments[0].blockId)!.childNodes[1]).innerHTML = minutes + ":" + seconds.toLocaleString('en-US', {
        minimumIntegerDigits: 2,
        useGrouping: false
      });
    }
    document.getElementById('timer')!.style.color = color;
  }

  createWorkoutPlanFromInputs(): void{
    this.currentWorkoutPlan = <WorkoutPlan>{};
    var sets = parseInt((<HTMLInputElement>document.getElementById("exercise-sets"))!.value);
    var prepTime = parseInt((<HTMLInputElement>document.getElementById("prep-length-seconds"))!.value) + (parseInt((<HTMLInputElement>document.getElementById("prep-length-minutes"))!.value)*60) + 0.9;
    var restTime = parseInt((<HTMLInputElement>document.getElementById("rest-length-seconds"))!.value) + (parseInt((<HTMLInputElement>document.getElementById("rest-length-minutes"))!.value)*60) + 0.9;
    var exerciseTime = parseInt((<HTMLInputElement>document.getElementById("exercise-length-seconds"))!.value) + (parseInt((<HTMLInputElement>document.getElementById("exercise-length-minutes"))!.value)*60) + 0.9;
    var includeRests = true;
    var name = "Custom Tabata";
    var segments = [];
    for(var i = 0; i < parseInt((<HTMLInputElement>document.getElementById("exercise-count"))!.value); i++){
      segments.push(<WorkoutSegment> {time: exerciseTime, color: "rgb(114,148,130)", move: ("Exercise " + (i+1)), nextMove: "", sound: "work", beepValue: Math.min(Math.floor(exerciseTime), 4), finalBeep: true, lastSegmentInSet: false, started: false});
    }
    this.currentWorkoutPlan = (<WorkoutPlan> {sets: sets, prepTime: prepTime, restTime: restTime, exerciseTime: exerciseTime, includeRests: includeRests, name: name, segments: segments});
  }

  getTotalSegmentTime(): number {
    var totalTime = 0;
    this.segments.forEach(function(segment){
      totalTime = Math.floor(totalTime) + Math.floor(segment.time);
    });
    return totalTime;
  }

  setMoveStatus(): void {
    var curr = "-";
    var next = "-";
    if(this.segments!.length > 0){
      curr = (this.segments[0]!.move == null) ? "-" : this.segments[0]!.move;
      next = (this.segments[0]!.nextMove == null) ? "-" : this.segments[0]!.nextMove;
    }
    document.getElementById('current-move')!.innerHTML = curr;
    document.getElementById('next-move')!.innerHTML = next;
    document.getElementById('simple-current-move')!.innerHTML = curr;
    document.getElementById('simple-next-move')!.innerHTML = next;
  }

  resetTimer(): void {
    clearTimeout(this.timer);
    this.segments = [];
    this.setMoveStatus();
    this.populateSegments();
    this.setExerciseBlocks();
    this.activeSegment = (<WorkoutSegment>{});
    document.getElementById("timer")!.style.color = "black";
    this.paused = true;
    document.getElementById('tabata-name')!.innerHTML = this.currentWorkoutPlan.name;
    document.getElementById('start-pause')!.innerHTML = "Start";
    document.getElementById('start-pause')!.classList.remove('start-pause-active');
    document.getElementById('start-pause')!.classList.add('start-pause-inactive');
    document.getElementById('simple-start-pause')!.innerHTML = "Start";
    document.getElementById('simple-start-pause')!.classList.remove('start-pause-active');
    document.getElementById('simple-start-pause')!.classList.add('start-pause-inactive');
  }

  counter(): void {
    var timeRemaining = (this.finishTime - Date.now())/1000;
    this.activeSegment = this.segments[0];
    var segList =  document.getElementsByClassName("segment");
    var restSegList =  document.getElementsByClassName("rest-segment");

    for (let i = 0; i < segList.length; i++) {
      const seg = segList[i] as HTMLElement;
      seg.style.backgroundColor = "rgb(240,240,240)";
    }
    for (let i = 0; i < restSegList.length; i++) {
      const restSeg = restSegList[i] as HTMLElement;
      restSeg.style.backgroundColor = "rgb(230,230,230)";
    }
    if(document.getElementById(this.segments[0].blockId) != null){
      document.getElementById(this.segments[0].blockId)!.style.backgroundColor = "rgb(221,204,123)";
    }
    if(this.segments!.length > 0){
      this.activeSegment.time = timeRemaining;
    }

    if(timeRemaining <= 0){
      //If finished segment is the last move in a set, reduce sets number on set grid
      if(this.segments[0].lastSegmentInSet == true){
        var newSetsValue = parseInt(document.getElementById("sets-text-number")!.innerHTML) - 1;
        document.getElementById('sets-text-number')!.innerHTML = newSetsValue.toString();
        document.getElementById('sets-text-word')!.innerHTML = (newSetsValue > 1 || newSetsValue == 0) ? "Sets" : "Set";
        this.setExerciseBlocks();
        var restSegments = document.getElementsByClassName("rest-segment");
        if(restSegments != null && restSegments != undefined){
          (<HTMLElement> restSegments[restSegments.length-1]!.childNodes[0]).innerHTML = "Done";
          (<HTMLElement> restSegments[restSegments.length-1]!.childNodes[1]).innerHTML = "-";
        }
      }

      this.segments!.shift();
      if(this.segments!.length > 0){
        this.segments[0]!.started = true;
        (<HTMLAudioElement> document.getElementById(this.segments[0]!.sound))!.play();
        this.startTime = Date.now();
        this.finishTime = Date.now() + (this.segments[0]!.time*1000);
      }
      else {
        this.paused = true;
        document.getElementById('start-pause')!.innerHTML = "Start";
        document.getElementById('start-pause')!.classList.remove('start-pause-active');
        document.getElementById('start-pause')!.classList.add('start-pause-inactive');
        document.getElementById("timer")!.style.color = "black";
        (<HTMLAudioElement> document.getElementById("alldone"))!.play();
        document.getElementById('current-move')!.innerHTML = "Done";
        document.getElementById('next-move')!.innerHTML = "";
        document.getElementById('simple-current-move')!.innerHTML = "Done";
        document.getElementById('simple-next-move')!.innerHTML = "";
        return;
      }
    }

    if(Math.floor(timeRemaining) == this.segments[0]!.beepValue && this.segments[0]!.beepValue > 0){
      this.segments[0]!.beepValue = this.segments[0]!.beepValue - 1;
      var beep = <HTMLAudioElement> document.getElementById("beep2");
      beep!.volume = 0.3;
      beep!.play();
    } else if (Math.floor(timeRemaining) == this.segments[0]!.beepValue && this.segments[0]!.beepValue == 0 && this.segments[0]!.finalBeep == true){
      this.segments[0]!.finalBeep = false;
      var beep = <HTMLAudioElement> document.getElementById("beep");
      beep!.volume = 0.3;
      beep!.play();
    }

    this.setTimer(Math.floor(timeRemaining), this.segments[0]!.color);
    this.setMoveStatus();

    this.timer = setTimeout( () => {
      this.counter();
    }, 50);
  }

  timeMinus(idName: string): void{
    if(parseInt((<HTMLInputElement> document.getElementById( idName + '-seconds'))!.value) > 0){
      (<HTMLInputElement> document.getElementById( idName + '-seconds'))!.value = ((parseInt((<HTMLInputElement> document.getElementById( idName + '-seconds'))!.value) - 1).toLocaleString('en-US', {
        minimumIntegerDigits: 2,
        useGrouping: false
      }));
    }
    else{
      var minutes = parseInt((<HTMLInputElement>  document.getElementById(idName + '-minutes'))!.value);
      if(minutes > 0){
        (<HTMLInputElement> document.getElementById( idName + '-minutes'))!.value = (minutes - 1).toLocaleString('en-US', {
          minimumIntegerDigits: 2,
          useGrouping: false
        });
        (<HTMLInputElement> document.getElementById( idName + '-seconds'))!.value = "59";
      }
    }
    this.createWorkoutPlanFromInputs();
    this.resetTimer();
  }

  timePlus(idName: string): void {
    if(parseInt((<HTMLInputElement> document.getElementById( idName + '-seconds'))!.value) < 59){
      (<HTMLInputElement> document.getElementById( idName + '-seconds'))!.value = (parseInt((<HTMLInputElement> document.getElementById( idName + '-seconds'))!.value) + 1).toLocaleString('en-US', {
          minimumIntegerDigits: 2,
          useGrouping: false
        });
    }
    else{
      var minutes = parseInt((<HTMLInputElement> document.getElementById( idName + '-minutes'))!.value);
      if(minutes < 59){
        (<HTMLInputElement> document.getElementById( idName + '-minutes'))!.value = ((minutes + 1).toLocaleString('en-US', {
          minimumIntegerDigits: 2,
          useGrouping: false
        }));
        (<HTMLInputElement> document.getElementById( idName + '-seconds'))!.value = ((0).toLocaleString('en-US', {
          minimumIntegerDigits: 2,
          useGrouping: false
        }));
      }
    }
    this.createWorkoutPlanFromInputs();
    this.resetTimer();
  }

  getFormattedTime(time: number): string{
    return Math.floor(time/60).toString() + ":" + (time%60).toLocaleString('en-US', {
      minimumIntegerDigits: 2,
      useGrouping: false
    });
  }

  formatTime(idName: string){
    if(parseInt((<HTMLInputElement> document.getElementById(idName))!.value) < 0){
      (<HTMLInputElement> document.getElementById(idName))!.value = "00";
    }
    if(parseInt((<HTMLInputElement> document.getElementById(idName))!.value) < 10){
      var newVal = parseInt((<HTMLInputElement> document.getElementById(idName))!.value).toLocaleString('en-US', {
          minimumIntegerDigits: 2,
          useGrouping: false
        });
      (<HTMLInputElement> document.getElementById(idName))!.value = newVal;
    }
    if(parseInt((<HTMLInputElement> document.getElementById(idName))!.value) > 59){
      (<HTMLInputElement> document.getElementById(idName))!.value = "59";
    }
    this.createWorkoutPlanFromInputs();
    this.resetTimer();
  }

  formatCount(idName: string): void {
    if(parseInt((<HTMLInputElement> document.getElementById(idName))!.value) < 0){
      (<HTMLInputElement> document.getElementById(idName))!.value = "0";
    }
    if(parseInt((<HTMLInputElement> document.getElementById(idName))!.value) > 99){
      (<HTMLInputElement> document.getElementById(idName))!.value = "99";
    }
    this.createWorkoutPlanFromInputs();
    this.resetTimer();
  }

  removeExerciseBlocks(): void{
    var segmentsDOM = <HTMLElement> document.getElementById('segments');
    while (segmentsDOM!.firstChild) {
      segmentsDOM!.removeChild(segmentsDOM!.firstChild);
    }
  }

  setExerciseBlocks(): void{
    this.removeExerciseBlocks();
    var setsValue = ('sets' in this.currentWorkoutPlan) ? this.currentWorkoutPlan.sets : 1;
    document.getElementById('sets-text-number')!.innerHTML = setsValue.toString();
    document.getElementById('sets-text-word')!.innerHTML = (setsValue > 1) ? "Sets" : "Set";
    var segmentsDOM = <HTMLInputElement> document.getElementById('segments');
    if(this.showRests && this.currentWorkoutPlan.includeRests && Math.floor(this.currentWorkoutPlan.restTime) > 0){
      segmentsDOM!.style.gridTemplateColumns = "139px 62px 139px 62px 139px 62px";
    }
    else {
      segmentsDOM!.style.gridTemplateColumns = "154px 154px 154px 154px";
    }
    for(var i = 0; i < this.currentWorkoutPlan!.segments!.length; i++){
      var segmentBlock = document.createElement('div');
      segmentBlock.classList.add('segment');
      segmentBlock.id = "segment-" + (i+1);
      var segmentTitle = document.createElement('div');
      segmentTitle.innerHTML = this.currentWorkoutPlan.segments[i].move;
      segmentBlock.appendChild(segmentTitle);
      var segmentTime = document.createElement('div');
      segmentTime.classList.add('segment-time');
      segmentTime.innerHTML = this.getFormattedTime(Math.floor(this.currentWorkoutPlan.segments[i].time));
      segmentBlock.appendChild(segmentTime);
      segmentsDOM.appendChild(segmentBlock);
      if(this.showRests && this.currentWorkoutPlan.includeRests && Math.floor(this.currentWorkoutPlan.restTime) > 0){
        var restSegmentBlock = document.createElement('div');
        restSegmentBlock.id = "rest-segment-" + (i+1);
        restSegmentBlock.classList.add('rest-segment');
        var restSegmentTitle = document.createElement('div');
        restSegmentTitle.innerHTML = "Rest";
        var restSegmentTime = document.createElement('div');
        restSegmentTime.classList.add('segment-time');
        restSegmentTime.innerHTML = this.getFormattedTime(Math.floor(this.currentWorkoutPlan.restTime));
        restSegmentBlock.appendChild(restSegmentTitle);
        restSegmentBlock.appendChild(restSegmentTime);
        segmentsDOM.appendChild(restSegmentBlock);
      }
    }
    if(this.currentWorkoutPlan.sets == 1 && this.currentWorkoutPlan.includeRests && Math.floor(this.currentWorkoutPlan.restTime) > 0){
      var restSegments = document.getElementsByClassName("rest-segment");
      if(restSegments != null && restSegments.length > 0){
        (<HTMLElement> restSegments[restSegments.length-1]!.childNodes[0]).innerHTML = "Done";
        (<HTMLElement> restSegments[restSegments.length-1]!.childNodes[1]).innerHTML = "";
      }
    }
  }

  showSimpleDisplay(): void {
    (<HTMLElement> document.getElementById("controller-simple")).style.color = "rgb(50,50,50)";
    (<HTMLElement> document.getElementById("controller-expanded")).style.color = "rgb(180,180,180)";
    (<HTMLElement> document.getElementById("exercise-content")).style.display = "none";
    (<HTMLElement> document.getElementById("simple-move-blocks")).style.display = "inline-flex";
    (<HTMLElement> document.getElementById("start-pause")).style.display = "none";
    (<HTMLElement> document.getElementById("reset")).style.display = "none";
    (<HTMLElement> document.getElementById("simple-start-pause")).style.display = "block";
    (<HTMLElement> document.getElementById("simple-reset")).style.display = "block";
    (<HTMLElement> document.getElementById("show-rests-button")).style.display = "none";
  }

  showExpandedDisplay(): void {
    (<HTMLElement> document.getElementById("controller-expanded")).style.color = "rgb(50,50,50)";
    (<HTMLElement> document.getElementById("controller-simple")).style.color = "rgb(180,180,180)";
    (<HTMLElement> document.getElementById("exercise-content")).style.display = "block";
    (<HTMLElement> document.getElementById("simple-move-blocks")).style.display = "none";
    (<HTMLElement> document.getElementById("start-pause")).style.display = "block";
    (<HTMLElement> document.getElementById("reset")).style.display = "block";
    (<HTMLElement> document.getElementById("simple-start-pause")).style.display = "none";
    (<HTMLElement> document.getElementById("simple-reset")).style.display = "none";
    (<HTMLElement> document.getElementById("show-rests-button")).style.display = "block";
  }

  setWorkoutPlanPresets(): void {
    var presetsBlock = document.getElementById("presets");
    for(var i = 0; i < this.workoutPlans.length; i++){
      var planBlock = document.createElement('div');
      planBlock.classList.add('plan-block');
      planBlock.id = "plan-" + (i);
      planBlock.addEventListener("click", (event) => {
        var idNum = parseInt((<HTMLElement> event.target).parentElement!.id.split("-")[1]);
        this.currentWorkoutPlan = this.workoutPlans[idNum];
        this.resetTimer();
      });
      var planTitle = document.createElement('div');
      planTitle.innerHTML = this.workoutPlans[i].name;
      planBlock.appendChild(planTitle);
      presetsBlock!.appendChild(planBlock);
    }

  }


}
