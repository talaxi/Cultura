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
  displayRaceOrder = false;
  isRaceOrderOn: boolean;
  selectedDeckOrder: string[];
  dragSourceElement: any;

  editDeckForm = new FormGroup({
    deckName: new FormControl(''),
  });

  constructor(private globalService: GlobalService, private modalService: NgbModal, private lookupService: LookupService) { }

  ngOnInit(): void {
    this.isRaceOrderOn = false;
    this.newAnimalList = [];
    this.animalDecks = this.globalService.globalVar.animalDecks;
    this.raceCourseTypeList = this.lookupService.getAllRaceCourseTypes();
    var scouts = this.lookupService.getResourceByName("Scouts");
    if (scouts !== undefined && scouts !== null && scouts > 0) {      
      this.displayRaceOrder = true;
    }
    this.selectedDeckOrder = [];
    this.selectedDeckOrder.push("Flatland");
    this.selectedDeckOrder.push("Mountain");
    this.selectedDeckOrder.push("Ocean");
    this.selectedDeckOrder.push("Tundra");
    this.selectedDeckOrder.push("Volcanic");    
  }

  editDeck(content: any, deck: AnimalDeck) {
    this.selectedDeck = deck;
    this.newAnimalList = [];
    this.selectedAnimalName = "";
    this.selectedCourseType = "Flatland";  
    
    this.isRaceOrderOn = deck.isCourseOrderActive;
    console.log(this.selectedDeckOrder);
    if (deck.courseTypeOrder !== null && deck.courseTypeOrder !== undefined && deck.courseTypeOrder.length > 0)
    {
      this.selectedDeckOrder = [];
      deck.courseTypeOrder.forEach(item => {
        if (item === RaceCourseTypeEnum.Flatland)
        this.selectedDeckOrder.push("Flatland");
        if (item === RaceCourseTypeEnum.Mountain)
        this.selectedDeckOrder.push("Mountain");
        if (item === RaceCourseTypeEnum.Ocean)
        this.selectedDeckOrder.push("Ocean");
        if (item === RaceCourseTypeEnum.Tundra)
        this.selectedDeckOrder.push("Tundra");
        if (item === RaceCourseTypeEnum.Volcanic)
        this.selectedDeckOrder.push("Volcanic");
      });
    }

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

      if (this.displayRaceOrder && this.isRaceOrderOn) {
        var stringOrder = [];
        var first = document.getElementById("raceOrder1")?.innerHTML;
        var second = document.getElementById("raceOrder2")?.innerHTML;
        var third = document.getElementById("raceOrder3")?.innerHTML;
        var fourth = document.getElementById("raceOrder4")?.innerHTML;
        var fifth = document.getElementById("raceOrder5")?.innerHTML;

        stringOrder.push(first);
        stringOrder.push(second);
        stringOrder.push(third);
        stringOrder.push(fourth);
        stringOrder.push(fifth);

        stringOrder.forEach(stringItem => {
          if (stringItem === "Flatland")
            deckToEdit?.courseTypeOrder.push(RaceCourseTypeEnum.Flatland);
          if (stringItem === "Mountain")
            deckToEdit?.courseTypeOrder.push(RaceCourseTypeEnum.Mountain);
          if (stringItem === "Ocean")
            deckToEdit?.courseTypeOrder.push(RaceCourseTypeEnum.Ocean);
          if (stringItem === "Tundra")
            deckToEdit?.courseTypeOrder.push(RaceCourseTypeEnum.Tundra);
          if (stringItem === "Volcanic")
            deckToEdit?.courseTypeOrder.push(RaceCourseTypeEnum.Volcanic);
        });
      }
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

  dragStart(event: any) {
    this.dragSourceElement = event;
    event.dataTransfer.setData("text", event.target.id);
  }

  allowDrop(event: any) {
    event.preventDefault();
  }

  dropCourseType(event: any) {
    var data = event.dataTransfer.getData("text");
    var dataElement = document.getElementById(data);
    var targetEventHtml = event.target.innerHTML;

    var targetClass = "";
    var sourceClass = "";

    if (dataElement === null)
      return;

    if (targetEventHtml === null)
      return;

    var targetItem = this.selectedDeckOrder.indexOf(targetEventHtml);
    var sourceItem = this.selectedDeckOrder.indexOf(dataElement?.innerHTML);
    
    this.selectedDeckOrder[targetItem] = dataElement.innerHTML;
    this.selectedDeckOrder[sourceItem] = targetEventHtml;    

    event.target.innerHTML = "";
    event.target.className = targetClass;
    event.target.append(dataElement.innerHTML);

    dataElement.innerHTML = "";
    dataElement.className = sourceClass;
    dataElement.append(targetEventHtml);
  }

  toggleRaceOrder = (): void => {
    this.isRaceOrderOn = !this.isRaceOrderOn;
    this.selectedDeck.isCourseOrderActive = this.isRaceOrderOn;
  }

  getColorClass(courseTypeName: string) {    
      var colorConditional = {
        'flatlandColor': courseTypeName === 'Flatland',
        'mountainColor': courseTypeName === 'Mountain',
        'waterColor': courseTypeName === 'Ocean',
        'tundraColor': courseTypeName === 'Tundra',
        'volcanicColor': courseTypeName === 'Volcanic'
      };
      return colorConditional;    
  }
}
