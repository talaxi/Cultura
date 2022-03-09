import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { ShopItem } from 'src/app/models/shop/shop-item.model';
import { ShopSection } from 'src/app/models/shop/shop-section.model';
import { GlobalService } from 'src/app/services/global-service.service';

@Component({
  selector: 'app-shopping-list',
  templateUrl: './shopping-list.component.html',
  styleUrls: ['./shopping-list.component.css']
})
export class ShoppingListComponent implements OnInit {
  @Input() section: ShopSection;
  itemsRows: ShopItem[][];
  itemsCells: ShopItem[];
  screenHeight: number;
  screenWidth: number;

  constructor(private globalService: GlobalService) { }

  ngOnInit(): void {    
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
      if (item.canHaveMultiples || item.amountPurchased === 0)
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
  }
}
