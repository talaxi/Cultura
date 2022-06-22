import { Component, OnInit } from '@angular/core';
import { Animal } from 'src/app/models/animals/animal.model';
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

  getColorClass(animalString: string) {
    if (animalString !== null && animalString !== undefined && animalString.length > 0) {
      var availableAnimals = this.globalService.globalVar.animals.filter(item => item.isAvailable);
      var animal = new Animal();
      availableAnimals.forEach(availableAnimal => {
        if (animalString.includes(availableAnimal.name))
        {
          animal = availableAnimal;
        }
      });      

      var colorConditional = {
        'flatlandColor': animal.getRaceCourseType() === 'Flatland',
        'mountainColor': animal.getRaceCourseType() === 'Mountain',
        'waterColor': animal.getRaceCourseType() === 'Ocean',
        'tundraColor': animal.getRaceCourseType() === 'Tundra',
        'volcanicColor': animal.getRaceCourseType() === 'Volcanic'
      };
      return colorConditional;
    }
    else
      return {};
  }
}
