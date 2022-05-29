import { Injectable } from '@angular/core';
import { AnimalStats } from 'src/app/models/animals/animal-stats.model';
import { FacilitySizeEnum } from 'src/app/models/facility-size-enum.model';
import { RaceCourseTypeEnum } from 'src/app/models/race-course-type-enum.model';
import { Terrain } from 'src/app/models/races/terrain.model';
import { ResourceValue } from 'src/app/models/resources/resource-value.model';
import { TerrainTypeEnum } from 'src/app/models/terrain-type-enum.model';
import { TrainingOptionsEnum } from 'src/app/models/training-options-enum.model';
import { TrainingOption } from 'src/app/models/training/training-option.model';

@Injectable({
  providedIn: 'root'
})
export class InitializeService {

  constructor() { }

  initializeShop(): void {

  }

  initializeResource(name: string, amount: number) {
    return new ResourceValue(name, amount);
  }

  initializeTraining(trainingType: TrainingOptionsEnum) {
    var training = new TrainingOption();

    if (trainingType === TrainingOptionsEnum.ShortTrackRunning) {
      training.trainingName = "Short Track Running";
      training.isAvailable = true;
      training.facilitySize = FacilitySizeEnum.Small;
      training.timeToComplete = 30;
      training.trainingType = TrainingOptionsEnum.ShortTrackRunning;
      training.trainingCourseType = RaceCourseTypeEnum.Flatland;
      training.statGain = 1;
      training.affectedStatRatios = new AnimalStats(1, 0, 0, 0, 0, 0);
    }

    if (trainingType === TrainingOptionsEnum.Sprints) {
      training.trainingName = "Sprints";
      training.isAvailable = true;
      training.facilitySize = FacilitySizeEnum.Small;
      training.timeToComplete = 20;
      training.trainingType = TrainingOptionsEnum.Sprints;
      training.trainingCourseType = RaceCourseTypeEnum.Flatland;
      training.statGain = 1;
      training.affectedStatRatios = new AnimalStats(0, 1, 0, 0, 0, 0);
    }

    if (trainingType === TrainingOptionsEnum.TrailRunning) {
      training.trainingName = "Trail Running";
      training.isAvailable = true;
      training.facilitySize = FacilitySizeEnum.Small;
      training.timeToComplete = 45;
      training.trainingType = TrainingOptionsEnum.TrailRunning;
      training.trainingCourseType = RaceCourseTypeEnum.Flatland;
      training.statGain = 1;
      training.affectedStatRatios = new AnimalStats(.5, 0, 1, 0, 0, 0);
    }

    if (trainingType === TrainingOptionsEnum.MoveLogs) {      
      training.trainingName = "Move Logs";
      training.isAvailable = false;
      training.facilitySize = FacilitySizeEnum.Small;
      training.timeToComplete = 30;
      training.trainingType = TrainingOptionsEnum.MoveLogs;
      training.trainingCourseType = RaceCourseTypeEnum.Flatland;
      training.statGain = 1;
      training.affectedStatRatios = new AnimalStats(0, 0, 0, 1, 0, 0);
    }

    if (trainingType === TrainingOptionsEnum.Footwork) {      
      training.trainingName = "Footwork";
      training.isAvailable = false;
      training.facilitySize = FacilitySizeEnum.Small;
      training.timeToComplete = 45;
      training.trainingType = TrainingOptionsEnum.Footwork;
      training.trainingCourseType = RaceCourseTypeEnum.Flatland;
      training.statGain = 1;
      training.affectedStatRatios = new AnimalStats(0, .5, 0, 0, 0, 1);
    }

    if (trainingType === TrainingOptionsEnum.PracticeCommands) {      
      training.trainingName = "Practice Commands";
      training.isAvailable = false;
      training.facilitySize = FacilitySizeEnum.Small;
      training.timeToComplete = 40;
      training.trainingType = TrainingOptionsEnum.PracticeCommands;
      training.trainingCourseType = RaceCourseTypeEnum.Flatland;
      training.statGain = 1;
      training.affectedStatRatios = new AnimalStats(0, 0, 0, 0, 1, .25);
    }

    if (trainingType === TrainingOptionsEnum.ScentTraining) {      
      training.trainingName = "Scent Training";
      training.isAvailable = false;
      training.facilitySize = FacilitySizeEnum.Small;
      training.timeToComplete = 45;
      training.trainingType = TrainingOptionsEnum.ScentTraining;
      training.trainingCourseType = RaceCourseTypeEnum.Flatland;
      training.statGain = 1;
      training.affectedStatRatios = new AnimalStats(0, 0, .5, 0, 1, 0);
    }

    if (trainingType === TrainingOptionsEnum.SmallWagonTow) {      
      training.trainingName = "Small Wagon Tow";
      training.isAvailable = false;
      training.facilitySize = FacilitySizeEnum.Small;
      training.timeToComplete = 45;
      training.trainingType = TrainingOptionsEnum.SmallWagonTow;
      training.trainingCourseType = RaceCourseTypeEnum.Flatland;
      training.statGain = 1;
      training.affectedStatRatios = new AnimalStats(.25, 0, 0, 1.5, 0, 0);
    }

    if (trainingType === TrainingOptionsEnum.Sidestep) {      
      training.trainingName = "Sidestep";
      training.isAvailable = false;
      training.facilitySize = FacilitySizeEnum.Small;
      training.timeToComplete = 35;
      training.trainingType = TrainingOptionsEnum.Sidestep;
      training.trainingCourseType = RaceCourseTypeEnum.Flatland;
      training.statGain = 1;
      training.affectedStatRatios = new AnimalStats(0, 2, 0, 0, 0, 0);
    }

    if (trainingType === TrainingOptionsEnum.MediumTrackRunning) {      
      training.trainingName = "Medium Track Running";
      training.isAvailable = false;
      training.facilitySize = FacilitySizeEnum.Medium;
      training.purchasePrice *= 4;
      training.timeToComplete = 60;
      training.trainingType = TrainingOptionsEnum.MediumTrackRunning;
      training.trainingCourseType = RaceCourseTypeEnum.Flatland;
      training.statGain = 1;
      training.affectedStatRatios = new AnimalStats(2, 0, 1, 0, 0, 0);
    }

    if (trainingType === TrainingOptionsEnum.UphillRun) {      
      training.trainingName = "Uphill Run";
      training.isAvailable = false;
      training.facilitySize = FacilitySizeEnum.Medium;
      training.purchasePrice *= 4;
      training.timeToComplete = 75;
      training.trainingType = TrainingOptionsEnum.UphillRun;
      training.trainingCourseType = RaceCourseTypeEnum.Flatland;
      training.statGain = 1;
      training.affectedStatRatios = new AnimalStats(0, 1, 2, 0, 0, 0);
    }

    if (trainingType === TrainingOptionsEnum.Puzzles) {      
      training.trainingName = "Puzzles";
      training.isAvailable = false;
      training.facilitySize = FacilitySizeEnum.Medium;
      training.purchasePrice *= 4;
      training.timeToComplete = 60;
      training.trainingType = TrainingOptionsEnum.Puzzles;
      training.trainingCourseType = RaceCourseTypeEnum.Flatland;
      training.statGain = 1;
      training.affectedStatRatios = new AnimalStats(0, 0, 0, 0, 2, 1);
    }
    
    if (trainingType === TrainingOptionsEnum.MoveRocks) {      
      training.trainingName = "Move Rocks";
      training.isAvailable = false;
      training.facilitySize = FacilitySizeEnum.Medium;
      training.purchasePrice *= 4;
      training.timeToComplete = 60;
      training.trainingType = TrainingOptionsEnum.MoveRocks;
      training.trainingCourseType = RaceCourseTypeEnum.Flatland;
      training.statGain = 1;
      training.affectedStatRatios = new AnimalStats(0, 1, 0, 2, 0, 0);
    }

    if (trainingType === TrainingOptionsEnum.DodgeBall) {      
      training.trainingName = "Dodge Ball";
      training.isAvailable = false;
      training.facilitySize = FacilitySizeEnum.Medium;
      training.purchasePrice *= 4;
      training.timeToComplete = 75;
      training.trainingType = TrainingOptionsEnum.DodgeBall;
      training.trainingCourseType = RaceCourseTypeEnum.Flatland;
      training.statGain = 1;
      training.affectedStatRatios = new AnimalStats(0, 2.5, 0, 0, 0, .5);
    }

    if (trainingType === TrainingOptionsEnum.LateralVerticalDrill) {      
      training.trainingName = "Lateral Vertical Drill";
      training.isAvailable = false;
      training.facilitySize = FacilitySizeEnum.Medium;
      training.purchasePrice *= 4;
      training.timeToComplete = 75;
      training.trainingType = TrainingOptionsEnum.LateralVerticalDrill;
      training.trainingCourseType = RaceCourseTypeEnum.Flatland;
      training.statGain = 1;
      training.affectedStatRatios = new AnimalStats(1.5, 0, 0, 0, 2, 0);
    }

    if (trainingType === TrainingOptionsEnum.BurstPractice) {      
      training.trainingName = "Burst Practice";
      training.isAvailable = false;
      training.facilitySize = FacilitySizeEnum.Medium;
      training.purchasePrice *= 4;
      training.timeToComplete = 75;
      training.trainingType = TrainingOptionsEnum.BurstPractice;
      training.trainingCourseType = RaceCourseTypeEnum.Flatland;
      training.statGain = 1;
      training.affectedStatRatios = new AnimalStats(0, 0, 0, 1.5, 1.5, 1.5);
    }

    if (trainingType === TrainingOptionsEnum.Acrobatics) {      
      training.trainingName = "Acrobatics";
      training.isAvailable = false;
      training.facilitySize = FacilitySizeEnum.Medium;
      training.purchasePrice *= 4;
      training.timeToComplete = 75;
      training.trainingType = TrainingOptionsEnum.Acrobatics;
      training.trainingCourseType = RaceCourseTypeEnum.Flatland;
      training.statGain = 1;
      training.affectedStatRatios = new AnimalStats(.5, 0, .5, 3, 0, 0);
    }
    
    if (trainingType === TrainingOptionsEnum.LongTrackRunning) {      
      training.trainingName = "Long Track Running";
      training.isAvailable = false;
      training.facilitySize = FacilitySizeEnum.Large;
      training.purchasePrice *= 10;
      training.timeToComplete = 90;
      training.trainingType = TrainingOptionsEnum.LongTrackRunning;
      training.trainingCourseType = RaceCourseTypeEnum.Flatland;
      training.statGain = 1;
      training.affectedStatRatios = new AnimalStats(5, 0, 0, 0, 2, 0);
    }

    if (trainingType === TrainingOptionsEnum.VehicleTow) {      
      training.trainingName = "Vehicle Tow";
      training.isAvailable = false;
      training.facilitySize = FacilitySizeEnum.Large;
      training.purchasePrice *= 10;
      training.timeToComplete = 90;
      training.trainingType = TrainingOptionsEnum.VehicleTow;
      training.trainingCourseType = RaceCourseTypeEnum.Flatland;
      training.statGain = 1;
      training.affectedStatRatios = new AnimalStats(0, 0, 2, 5, 0, 0);
    }

    if (trainingType === TrainingOptionsEnum.LogJump) {      
      training.trainingName = "Log Jump";
      training.isAvailable = false;
      training.facilitySize = FacilitySizeEnum.Large;
      training.purchasePrice *= 10;
      training.timeToComplete = 90;
      training.trainingType = TrainingOptionsEnum.LogJump;
      training.trainingCourseType = RaceCourseTypeEnum.Flatland;
      training.statGain = 1;
      training.affectedStatRatios = new AnimalStats(1, 1, 0, 0, 0, 5);
    }
    
    if (trainingType === TrainingOptionsEnum.Meditation) {      
      training.trainingName = "Meditation";
      training.isAvailable = false;
      training.facilitySize = FacilitySizeEnum.Large;
      training.purchasePrice *= 10;
      training.timeToComplete = 90;
      training.trainingType = TrainingOptionsEnum.Meditation;
      training.trainingCourseType = RaceCourseTypeEnum.Flatland;
      training.statGain = 1;
      training.affectedStatRatios = new AnimalStats(0, 0, 0, 2, 5, 0);
    }
    
    if (trainingType === TrainingOptionsEnum.WindSprints) {      
      training.trainingName = "Wind Sprints";
      training.isAvailable = false;
      training.facilitySize = FacilitySizeEnum.Large;
      training.purchasePrice *= 10;
      training.timeToComplete = 90;
      training.trainingType = TrainingOptionsEnum.WindSprints;
      training.trainingCourseType = RaceCourseTypeEnum.Flatland;
      training.statGain = 1;
      training.affectedStatRatios = new AnimalStats(2, 5, 0, 0, 0, 0);
    }
    
    if (trainingType === TrainingOptionsEnum.GreenwayHike) {      
      training.trainingName = "Greenway Hike";
      training.isAvailable = false;
      training.facilitySize = FacilitySizeEnum.Large;
      training.purchasePrice *= 10;
      training.timeToComplete = 90;
      training.trainingType = TrainingOptionsEnum.GreenwayHike;
      training.trainingCourseType = RaceCourseTypeEnum.Flatland;
      training.statGain = 1;
      training.affectedStatRatios = new AnimalStats(0, 0, 5, 0, 0, 2);
    }
    
    if (trainingType === TrainingOptionsEnum.Marathon) {      
      training.trainingName = "Marathon";
      training.isAvailable = false;
      training.facilitySize = FacilitySizeEnum.Large;
      training.purchasePrice *= 10;
      training.timeToComplete = 120;
      training.trainingType = TrainingOptionsEnum.Marathon;
      training.trainingCourseType = RaceCourseTypeEnum.Flatland;
      training.statGain = 1;
      training.affectedStatRatios = new AnimalStats(2, 0, 3, 0, 3, 0);
    }

    if (trainingType === TrainingOptionsEnum.AgilityCourse) {      
      training.trainingName = "Agility Course";
      training.isAvailable = false;
      training.facilitySize = FacilitySizeEnum.Large;
      training.purchasePrice *= 10;
      training.timeToComplete = 120;
      training.trainingType = TrainingOptionsEnum.AgilityCourse;
      training.trainingCourseType = RaceCourseTypeEnum.Flatland;
      training.statGain = 1;
      training.affectedStatRatios = new AnimalStats(0, 3, 0, 2, 0, 3);
    }


    return training;
  }
}
