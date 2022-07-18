import { Component, OnInit } from '@angular/core';
import { ShopSection } from 'src/app/models/shop/shop-section.model';
import { ShopsEnum } from 'src/app/models/shops-enum.model';
import { GlobalService } from 'src/app/services/global-service.service';
import { LookupService } from 'src/app/services/lookup.service';

@Component({
  selector: 'app-token-shop-view',
  templateUrl: './token-shop-view.component.html',
  styleUrls: ['./token-shop-view.component.css']
})
export class TokenShopViewComponent implements OnInit {
  sections: ShopSection[];
  highestTierUnlocked = 0;
  maxTiers = 3;
  shopType = ShopsEnum.token;

  constructor(private globalService: GlobalService, public lookupService: LookupService) { }

  ngOnInit(): void {
    this.highestTierUnlocked = this.lookupService.getHighestEventShopTierUnlocked();
    this.getShopOptions();
  }

  getShopOptions() {
    this.sections = [];

    var tier1ShopSection = this.globalService.globalVar.tokenShop.find(item => item.name === "Tier 1");
    if (tier1ShopSection !== undefined && this.highestTierUnlocked >= 1)
      this.sections.push(tier1ShopSection);

    var tier2ShopSection = this.globalService.globalVar.tokenShop.find(item => item.name === "Tier 2");
    if (tier2ShopSection !== undefined && this.highestTierUnlocked >= 2)
      this.sections.push(tier2ShopSection);

    var tier3ShopSection = this.globalService.globalVar.tokenShop.find(item => item.name === "Tier 3");
    if (tier3ShopSection !== undefined && this.highestTierUnlocked >= 3)
      this.sections.push(tier3ShopSection);
  }
}
