import { Component, OnInit } from '@angular/core';
import { ShopSection } from 'src/app/models/shop/shop-section.model';
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
  filterFacility = false;
  filterFood = false;
  filterSpecialty = false;
  filterEnhancers = false;

  constructor(private globalService: GlobalService) { }

  ngOnInit(): void {
    this.getShopOptions();
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

    var facilityShopSection = this.globalService.globalVar.shop.find(item => item.name === "Facility" &&
      (!filtersActive || (filtersActive && this.filterFacility)));
    if (facilityShopSection !== undefined)
      this.sections.push(facilityShopSection);

    var foodShopSection = this.globalService.globalVar.shop.find(item => item.name === "Food" &&
      (!filtersActive || (filtersActive && this.filterFood)));
    if (foodShopSection !== undefined)
      this.sections.push(foodShopSection);

    var specialtyShopSection = this.globalService.globalVar.shop.find(item => item.name === "Specialty" &&
      (!filtersActive || (filtersActive && this.filterSpecialty)));
    if (specialtyShopSection !== undefined)
      this.sections.push(specialtyShopSection);

    var enhancersShopSection = this.globalService.globalVar.shop.find(item => item.name === "Enhancers" &&
      (!filtersActive || (filtersActive && this.filterEnhancers)));
    if (enhancersShopSection !== undefined)
      this.sections.push(enhancersShopSection);
  }

  toggleShopFilter(sectionName: string): void {
    if (sectionName === "Animals")
      this.filterAnimals = !this.filterAnimals;
    if (sectionName === "Trainings")
      this.filterTrainings = !this.filterTrainings;
    if (sectionName === "Facility")
      this.filterFacility = !this.filterFacility;
    if (sectionName === "Food")
      this.filterFood = !this.filterFood;
    if (sectionName === "Specialty")
      this.filterSpecialty = !this.filterSpecialty;
    if (sectionName === "Enhancers")
      this.filterEnhancers = !this.filterEnhancers;

    this.getShopOptions();
  }

  filtersActive(): boolean {
    if (this.filterAnimals || this.filterEnhancers || this.filterFacility || this.filterFood || this.filterSpecialty || this.filterTrainings)
      return true;
    else
      return false;
  }
}
