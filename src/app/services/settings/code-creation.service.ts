import { Injectable } from '@angular/core';
import { ResourceValue } from 'src/app/models/resources/resource-value.model';
import { ShopItemTypeEnum } from 'src/app/models/shop-item-type-enum.model';
import { environment } from 'src/environments/environment';
import * as CryptoJS from 'crypto-js';
import { RedeemableCode } from 'src/app/models/redeemable-code.model';

@Injectable({
  providedIn: 'root'
})
export class CodeCreationService {
  redeemableCode: RedeemableCode;

  constructor() { }
  
  setupRewards() {
    this.redeemableCode = new RedeemableCode();
    this.redeemableCode.expirationDate = new Date('2022-08-25');    
    this.redeemableCode.rewards.push(new ResourceValue("Mangoes", 2, ShopItemTypeEnum.Food)); //TODO: this needs to pull from a look up so you don't have to always make sure type is accurate
  }

  createCode() {
    this.setupRewards();
    var key = environment.CODEREDEMPTIONSECRET;
    var rewardString = JSON.stringify(this.redeemableCode);
    var encrypted = CryptoJS.AES.encrypt(rewardString, key);
    return encrypted.toString();
  }

}
