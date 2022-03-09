import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ShopItemTypeEnum } from 'src/app/models/shop-item-type-enum.model';
import { ShopItem } from 'src/app/models/shop/shop-item.model';
import { GlobalService } from 'src/app/services/global-service.service';
import { LookupService } from 'src/app/services/lookup.service';

@Component({
  selector: 'app-shopping-item',
  templateUrl: './shopping-item.component.html',
  styleUrls: ['./shopping-item.component.css']
})
export class ShoppingItemComponent implements OnInit {
  @Input() selectedItem: ShopItem;
  @Output() itemPurchased = new EventEmitter<ShopItem>();

  constructor(private globalService: GlobalService, private lookupService: LookupService) { }

  ngOnInit(): void {
  }

  BuyItem(): void {
    var moneyAmount = this.lookupService.getMoney();

    if (moneyAmount >= this.selectedItem.purchasePrice) {      
      this.lookupService.spendMoney(this.selectedItem.purchasePrice);    

      if (this.selectedItem.type === ShopItemTypeEnum.Animal)
      {
        var animal = this.globalService.globalVar.animals.find(item => item.name === this.selectedItem.name);
        if (animal !== null && animal !== undefined)
        {
          animal.isAvailable = true;
          this.selectedItem.amountPurchased = 1;          
        }
      }

      this.itemPurchased.emit(this.selectedItem);
    }
  }
}
