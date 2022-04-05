import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AnimalDeck } from 'src/app/models/animals/animal-deck.model';
import { Animal } from 'src/app/models/animals/animal.model';
import { RaceCourseTypeEnum } from 'src/app/models/race-course-type-enum.model';
import { GlobalService } from 'src/app/services/global-service.service';
import { LookupService } from 'src/app/services/lookup.service';

@Component({
  selector: 'app-decks-view',
  templateUrl: './decks-view.component.html',
  styleUrls: ['./decks-view.component.css']
})
export class DecksViewComponent implements OnInit {
  //@ViewChild('editDeckModal') editDeckModal: any;
  animalDecks: AnimalDeck[];
  raceCourseTypeList: string[];
  possibleAnimalsList: string[];
  selectedDeck: AnimalDeck;
  newAnimalList: Animal[];
  selectedAnimalName: string;
  selectedCourseType: string;
  colorConditional: any;

  editDeckForm = new FormGroup({
    deckName: new FormControl(''),
  });

  constructor(private globalService: GlobalService, private modalService: NgbModal, private lookupService: LookupService) { }

  ngOnInit(): void {
    this.newAnimalList = [];
    this.animalDecks = this.globalService.globalVar.animalDecks;
    this.raceCourseTypeList = this.lookupService.getAllRaceCourseTypes();

  }

  editDeck(content: any, deck: AnimalDeck) {
    this.selectedDeck = deck;
    this.newAnimalList = [];
    this.selectedAnimalName = "";
    this.selectedCourseType = "Flatland";

    this.filterType(this.selectedCourseType);

    if (deck.selectedAnimals.length > 0) {
      deck.selectedAnimals.forEach(item => {
        this.newAnimalList.push(item);
      });
    }

    this.editDeckForm.patchValue({ deckName: deck.name });

    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', size: 'lg' });
  }

  saveDeck() {
    var deckToEdit = this.globalService.globalVar.animalDecks.find(item => item.deckNumber === this.selectedDeck.deckNumber);
    if (deckToEdit !== undefined && deckToEdit !== null) {
      deckToEdit.name = this.editDeckForm.get("deckName")?.value;
      deckToEdit.selectedAnimals = [];
      this.newAnimalList.forEach(item => {
        deckToEdit?.selectedAnimals.push(item);
      });
      deckToEdit?.selectedAnimals.sort(this.compare);
    }
    this.modalService.dismissAll();
  }

  compare(a: Animal, b: Animal): number {
    if (a.raceCourseType > b.raceCourseType)
      return 1;
    else if (b.raceCourseType > a.raceCourseType)
      return -1;
    else
      return 0;
  }

  filterType(type: string) {
    var animals = this.lookupService.getAnimalsByRaceCourseType(type);

    var availableAnimals: string[] = [];
    if (animals.length > 0) {
      animals.forEach(animal => {
        var userAnimal = this.globalService.globalVar.animals.find(item => item.getAnimalType() === animal);
        if (userAnimal?.isAvailable)
          availableAnimals.push(userAnimal.getAnimalType());
      });
    }
    this.possibleAnimalsList = availableAnimals;
    this.selectedCourseType = type;

    var defaultAnimal = this.selectedDeck.selectedAnimals.find(item => item.getRaceCourseType() === type);
    if (defaultAnimal !== undefined && defaultAnimal !== null)
      this.selectedAnimalName = defaultAnimal.getAnimalType();
  }

  selectAnimal(animalType: string) {
    var selectedAnimal = this.globalService.globalVar.animals.find(item => item.getAnimalType() === animalType);
    if (selectedAnimal === undefined || selectedAnimal === null)
      return;

    var index = -1;
    var raceCourseType = selectedAnimal.getRaceCourseType();

    this.newAnimalList.forEach(animal => {
      if (animal.getRaceCourseType() === raceCourseType) {
        index = this.newAnimalList.indexOf(animal);
      }
    });

    if (index >= 0) {
      this.newAnimalList.splice(index, 1);
    }

    //toggle out
    if (this.selectedAnimalName === selectedAnimal.getAnimalType()) {
      this.selectedAnimalName = "";
    }
    //toggle in
    else {
      this.newAnimalList.push(selectedAnimal);
      this.selectedAnimalName = selectedAnimal.getAnimalType();
    }
  }

  setAsPrimary(deck: AnimalDeck) {
    var existingPrimaryDeck = this.globalService.globalVar.animalDecks.find(item => item.isPrimaryDeck);
    var selectedDeck = this.globalService.globalVar.animalDecks.find(item => item.deckNumber === deck.deckNumber);

    if (selectedDeck !== undefined && selectedDeck !== null) {
      selectedDeck.isPrimaryDeck = true;

      if (existingPrimaryDeck !== undefined && existingPrimaryDeck !== null)
        existingPrimaryDeck.isPrimaryDeck = false;
    }
  }
}
