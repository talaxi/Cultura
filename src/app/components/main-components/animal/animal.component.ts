import { Component, Input, OnInit } from '@angular/core';
import { AnimalTraits } from 'src/app/models/animals/animal-traits.model';
import { Animal } from 'src/app/models/animals/animal.model';
import { GlobalService } from 'src/app/services/global-service.service';

@Component({
  selector: 'app-animal',
  templateUrl: './animal.component.html',
  styleUrls: ['./animal.component.css']
})

export class AnimalComponent implements OnInit {
  @Input() selectedAnimal: Animal;
  @Input() isTrainingTrackView: boolean = false;
  @Input() isAnimalDetailView = false;
  @Input() isIncubatorDetailView = false;
  colorConditional: any;
  trainingTrackRewardsRemaining = 0;
  trainingTrackTotalRewards = 0;  
  breedLevel = 0;
  trait: AnimalTraits;

  constructor() { }

  ngOnInit(): void {
    this.colorConditional = {
      'flatlandColor': this.selectedAnimal.getRaceCourseType() === 'Flatland',
      'mountainColor': this.selectedAnimal.getRaceCourseType() === 'Mountain',
      'waterColor': this.selectedAnimal.getRaceCourseType() === 'Ocean',
      'tundraColor': this.selectedAnimal.getRaceCourseType() === 'Tundra',
      'volcanicColor': this.selectedAnimal.getRaceCourseType() === 'Volcanic'
    };

    if (this.isTrainingTrackView) {
      this.trainingTrackRewardsRemaining = this.selectedAnimal.allTrainingTracks.getTotalRewardsRemaining();
      this.trainingTrackTotalRewards = this.selectedAnimal.allTrainingTracks.getTotalRewardCount();
    }

    this.breedLevel = this.selectedAnimal.breedLevel;
    this.trait = this.selectedAnimal.trait;
  }

  getTraitDetails() {
    if (this.trait !== undefined)
      return this.trait.traitName + " (" + this.trait.researchLevel + "%)";

    return "";
  }
}
