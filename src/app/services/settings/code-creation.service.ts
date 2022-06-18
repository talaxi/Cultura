import { Injectable } from '@angular/core';
import { ResourceValue } from 'src/app/models/resources/resource-value.model';
import { ShopItemTypeEnum } from 'src/app/models/shop-item-type-enum.model';
import { environment } from 'src/environments/environment';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class CodeCreationService {
  rewards: ResourceValue[] = [];

  constructor() { }
  
  setupRewards() {
    this.rewards.push(new ResourceValue("Coins", 37, ShopItemTypeEnum.Resources));
    this.rewards.push(new ResourceValue("Renown", .5, ShopItemTypeEnum.Resources));
  }

  createCode() {
    this.setupRewards();
    var key = environment.CODEREDEMPTIONSECRET;
    var rewardString = JSON.stringify(this.rewards);
    var encrypted = CryptoJS.AES.encrypt(rewardString, key);
    return encrypted.toString();
  }

}
