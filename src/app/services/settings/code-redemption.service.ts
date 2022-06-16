import { Injectable } from '@angular/core';
import { ResourceValue } from 'src/app/models/resources/resource-value.model';
import { ShopItemTypeEnum } from 'src/app/models/shop-item-type-enum.model';
import { environment } from '../../../environments/environment';
//import { CryptoJS } from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class CodeRedemptionService {
  rewards: ResourceValue[] = [];

  constructor() { }

  setupRewards() {
    this.rewards.push(new ResourceValue("Coins", 37, ShopItemTypeEnum.Resources));
  }

  createCode() {
    var key = environment.CODEREDEMPTIONSECRET;
    var rewardString = JSON.stringify(this.rewards);
    var encrypted = CryptoJS.AES.encrypt(rewardString, key);    
    return encrypted;
  }

  redeemCode(encryptedVal: string) {
    var key = environment.CODEREDEMPTIONSECRET;
    var decrypted = CryptoJS.AES.decrypt(encryptedVal, key);
    
    var loadDataJson = <ResourceValue[]>JSON.parse(decrypted.toString());
      //this.globalService.globalVar = plainToInstance(GlobalVariables, loadDataJson);
    console.log(loadDataJson);
  }
}
