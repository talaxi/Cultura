import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NavigationEnum } from 'src/app/models/navigation-enum.model';
import { ResourceValue } from 'src/app/models/resources/resource-value.model';
import { ShopItemTypeEnum } from 'src/app/models/shop-item-type-enum.model';
import { ComponentCommunicationService } from 'src/app/services/component-communication.service';
import { GlobalService } from 'src/app/services/global-service.service';
import { LookupService } from 'src/app/services/lookup.service';
import { UtilityService } from 'src/app/services/utility/utility.service';

@Component({
  selector: 'app-resources-view',
  templateUrl: './resources-view.component.html',
  styleUrls: ['./resources-view.component.css']
})
export class ResourcesViewComponent implements OnInit {
  resources: ResourceValue[] = [];
  equipment: ResourceValue[] = [];
  specialtyItems: ResourceValue[] = [];
  progressionResources: ResourceValue[] = [];

  constructor(private globalService: GlobalService, private lookupService: LookupService, 
    private componentCommunicationService: ComponentCommunicationService, private utilityService: UtilityService,
    private modalService: NgbModal) { }

  ngOnInit(): void {
    this.componentCommunicationService.setNewView(NavigationEnum.resources);
    
    this.resources = this.globalService.globalVar.resources.filter(item => item.amount > 0 && item.itemType === ShopItemTypeEnum.Food || item.itemType === ShopItemTypeEnum.Resources).sort();
    this.equipment = this.globalService.globalVar.resources.filter(item => item.amount > 0 && item.itemType === ShopItemTypeEnum.Equipment).sort();
    this.specialtyItems = this.globalService.globalVar.resources.filter(item => item.amount > 0 && item.itemType === ShopItemTypeEnum.Specialty).sort();
    this.progressionResources = this.globalService.globalVar.resources.filter(item => item.amount > 0 && item.itemType === ShopItemTypeEnum.Progression).sort();
  }

  getPopover(name: string, itemType: ShopItemTypeEnum) {
    return this.utilityService.getSanitizedHtml(this.lookupService.getResourcePopover(name, itemType));
  }

  //check if it's an orb, if it is then open a modal with the orb view displaying
  isResourceAnOrb(resource: ResourceValue) {
    if (resource.itemType === ShopItemTypeEnum.Equipment && (resource.name === "Sapphire Orb" || resource.name === "Amethyst Orb" ||
    resource.name === "Topaz Orb" || resource.name === "Amber Orb" || resource.name === "Emerald Orb" || resource.name === "Ruby Orb"))
      return true;

    return false;
  }

  openOrbModal(content: any, name: string) {
    //this.setupDisplayItems();
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', size: 'xl' });
  }
}
