import { Component, OnInit } from '@angular/core';
import { TrackedStats } from 'src/app/models/utility/tracked-stats.model';
import { GlobalService } from 'src/app/services/global-service.service';

@Component({
  selector: 'app-stats-view',
  templateUrl: './stats-view.component.html',
  styleUrls: ['./stats-view.component.css']
})
export class StatsViewComponent implements OnInit {
  trackedStats: TrackedStats;
  mostUsedAnimal: string;
  mostUsedAnimalCount: number;

  constructor(private globalService: GlobalService) { }

  ngOnInit(): void {
    this.trackedStats = this.globalService.globalVar.trackedStats;

    var maxCount = 0;
    this.globalService.globalVar.animals.forEach(animal => {
      if (animal.totalRacesRun > maxCount)
      {
        maxCount = animal.totalRacesRun;
        this.mostUsedAnimal = animal.name;
        this.mostUsedAnimalCount = maxCount;
      }
    });
  }

}
