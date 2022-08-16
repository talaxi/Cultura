import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { NavigationEnum } from 'src/app/models/navigation-enum.model';
import { ShopSection } from 'src/app/models/shop/shop-section.model';
import { ShopsEnum } from 'src/app/models/shops-enum.model';
import { ComponentCommunicationService } from 'src/app/services/component-communication.service';
import { GlobalService } from 'src/app/services/global-service.service';

@Component({
  selector: 'app-shop-view',
  templateUrl: './shop-view.component.html',
  styleUrls: ['./shop-view.component.css']
})
export class ShopViewComponent implements OnInit {
  sections: ShopSection[];
  filterAnimals = false;
  filterTrainings = false;
  filterEquipment = false;
  filterFood = false;
  filterSpecialty = false;
  filterAbilities = false;
  activeShopView: ShopsEnum;
  ShopsEnum = ShopsEnum;
  subscription: any;
  resetShopSubject: Subject<void> = new Subject<void>();

  constructor(private globalService: GlobalService, private componentCommunicationService: ComponentCommunicationService) { }

  ngOnInit(): void {
    this.componentCommunicationService.setNewView(NavigationEnum.shop);
    this.getShopOptions();

    this.subscription = this.componentCommunicationService.getShopView().subscribe((value) => {      
      this.activeShopView = value;      
    });
  }

  getShopOptions() {
    this.sections = [];
    var filtersActive = this.filtersActive();

    var animalShopSection = this.globalService.globalVar.shop.find(item => item.name === "Animals" &&
      (!filtersActive || (filtersActive && this.filterAnimals)));
    if (animalShopSection !== undefined)
      this.sections.push(animalShopSection);

    var trainingShopSection = this.globalService.globalVar.shop.find(item => item.name === "Trainings" &&
      (!filtersActive || (filtersActive && this.filterTrainings)));
    if (trainingShopSection !== undefined)
      this.sections.push(trainingShopSection);

    var equipmentShopSection = this.globalService.globalVar.shop.find(item => item.name === "Equipment" &&
      (!filtersActive || (filtersActive && this.filterEquipment)));
    if (equipmentShopSection !== undefined)
      this.sections.push(equipmentShopSection);

    var foodShopSection = this.globalService.globalVar.shop.find(item => item.name === "Food" &&
      (!filtersActive || (filtersActive && this.filterFood)));
    if (foodShopSection !== undefined)
      this.sections.push(foodShopSection);

    var specialtyShopSection = this.globalService.globalVar.shop.find(item => item.name === "Specialty" &&
      (!filtersActive || (filtersActive && this.filterSpecialty)));
    if (specialtyShopSection !== undefined)
      this.sections.push(specialtyShopSection);

    var abilitiesShopSection = this.globalService.globalVar.shop.find(item => item.name === "Abilities" &&
      (!filtersActive || (filtersActive && this.filterAbilities)));
    if (abilitiesShopSection !== undefined)
      this.sections.push(abilitiesShopSection);
  }


  toggleShopFilter(sectionName: string): void {
    if (sectionName === "Animals")
      this.filterAnimals = !this.filterAnimals;
    if (sectionName === "Trainings")
      this.filterTrainings = !this.filterTrainings;
    if (sectionName === "Equipment")
      this.filterEquipment = !this.filterEquipment;
    if (sectionName === "Food")
      this.filterFood = !this.filterFood;
    if (sectionName === "Specialty")
      this.filterSpecialty = !this.filterSpecialty;
    if (sectionName === "Abilities")
      this.filterAbilities = !this.filterAbilities;

    this.getShopOptions();
  }

  filtersActive(): boolean {
    if (this.filterAnimals || this.filterAbilities || this.filterEquipment || this.filterFood || this.filterSpecialty || this.filterTrainings)
      return true;
    else
      return false;
  }

  ResetShopFilters() {
    this.filterAnimals = false;
    this.filterAbilities = false;
    this.filterEquipment = false;
    this.filterFood = false;
    this.filterSpecialty = false;
    this.filterTrainings = false;
    this.getShopOptions();
  }

  ngOnDestroy() {
    if (this.subscription !== null && this.subscription !== undefined)
      this.subscription.unsubscribe();
  }

  itemPurchased($event: boolean) {  
    this.getShopOptions();
    this.resetShopSubject.next();
  }
}
