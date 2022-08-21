import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { ShopItem } from 'src/app/models/shop/shop-item.model';
import { ShopSection } from 'src/app/models/shop/shop-section.model';
import { ShopsEnum } from 'src/app/models/shops-enum.model';
import { GlobalService } from 'src/app/services/global-service.service';

@Component({
  selector: 'app-shopping-list',
  templateUrl: './shopping-list.component.html',
  styleUrls: ['./shopping-list.component.css']
})
export class ShoppingListComponent implements OnInit {
  @Input() section: ShopSection;
  @Input() shopType: ShopsEnum;
  itemsRows: ShopItem[][];
  itemsCells: ShopItem[];
  screenHeight: number;
  screenWidth: number;
  public shopsEnum = ShopsEnum;
  @Output() itemPurchasedEmitter = new EventEmitter<boolean>();
  resetShopSubscription: any;
  @Input() resetShop: Observable<void>;

  constructor(private globalService: GlobalService) { }

  ngOnInit(): void {    
    if (this.shopType === undefined || this.shopType === null)
      this.shopType = ShopsEnum.regular;

    if (this.shopType === ShopsEnum.regular)
    {
      this.resetShopSubscription = this.resetShop.subscribe(() => this.setupDisplayItems());
    }

    this.setupDisplayItems();
  }

  setupDisplayItems(): void {
    this.itemsCells = [];
    this.itemsRows = [];

    var maxColumns = 4;
    if (this.screenHeight <= 650)
      maxColumns = 2;

    var refinedItemList: ShopItem[] = [];    
    this.section.itemList.forEach(item => {
      if (item.isAvailable && ((item.canHaveMultiples && (item.infiniteAmount || item.amountPurchased < item.totalShopQuantity)) 
      || item.amountPurchased === 0))
      {
        refinedItemList.push(item);
      }
    });

    for (var i = 1; i <= refinedItemList.length; i++) {
      this.itemsCells.push(refinedItemList[i - 1]);
      if ((i % maxColumns) == 0) {
        this.itemsRows.push(this.itemsCells);
        this.itemsCells = [];
      }
    }

    if (this.itemsCells.length !== 0)
      this.itemsRows.push(this.itemsCells);
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.screenHeight = window.innerHeight;
    this.screenWidth = window.innerWidth;    
  }

  itemPurchased($event: ShopItem) {     
    this.setupDisplayItems();
    this.itemPurchasedEmitter.emit(true);
  }

  ngOnDestroy() {
    if (this.resetShopSubscription !== undefined)
      this.resetShopSubscription.unsubscribe();
  }
}
