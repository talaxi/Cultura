import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Ability } from 'src/app/models/animals/ability.model';
import { Animal } from 'src/app/models/animals/animal.model';
import { GlobalService } from 'src/app/services/global-service.service';
import { LookupService } from 'src/app/services/lookup.service';

@Component({
  selector: 'app-selected-animal',
  templateUrl: './selected-animal.component.html',
  styleUrls: ['./selected-animal.component.css']
})
export class SelectedAnimalComponent implements OnInit {
  @Input() selectedAnimal: Animal;
  @Output() returnEmitter = new EventEmitter<boolean>();

  maxSpeedModifierAmount: number;
  accelerationModifierAmount: number;
  staminaModifierAmount: number;
  powerModifierAmount: number;
  focusModifierAmount: number;
  adaptabilityModifierAmount: number;
  colorConditional: any;
  editingName: boolean;
  newName: string;

  ability1: Ability;
  ability2: Ability;
  ability3: Ability;

  constructor(private lookupService: LookupService, private globalService: GlobalService) { }

  ngOnInit(): void {
    this.maxSpeedModifierAmount = this.lookupService.getMaxSpeedModifierByAnimalType(this.selectedAnimal.type);
    this.accelerationModifierAmount = this.lookupService.getAccelerationModifierByAnimalType(this.selectedAnimal.type);
    this.staminaModifierAmount = this.lookupService.getStaminaModifierByAnimalType(this.selectedAnimal.type);
    this.powerModifierAmount = this.lookupService.getPowerModifierByAnimalType(this.selectedAnimal.type);
    this.focusModifierAmount = this.lookupService.getFocusModifierByAnimalType(this.selectedAnimal.type);
    this.adaptabilityModifierAmount = this.lookupService.getAdaptabilityModifierByAnimalType(this.selectedAnimal.type);

    this.ability1 = this.selectedAnimal.availableAbilities[0];
    if (this.selectedAnimal.availableAbilities.length > 1)
    this.ability2 = this.selectedAnimal.availableAbilities[1];
    if (this.selectedAnimal.availableAbilities.length > 2)
    this.ability3 = this.selectedAnimal.availableAbilities[2];

    this.colorConditional = {'flatlandColor': this.selectedAnimal.getRaceCourseType() === 'Flatland',
  'mountainColor': this.selectedAnimal.getRaceCourseType() === 'Mountain', 'waterColor': this.selectedAnimal.getRaceCourseType() === 'Water'};
  }

  returnToAnimalView(): void {
    this.returnEmitter.emit(false);
  }

  breed(): void {
    this.globalService.BreedAnimal(this.selectedAnimal);
  }

  editName(): void {
    this.selectedAnimal.name = this.newName;
    this.editingName = false;
  }

  selectAbility(ability: Ability) {
    this.selectedAnimal.ability = ability;
    
  }
}
