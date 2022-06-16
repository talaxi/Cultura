import { Injectable } from '@angular/core';
import { ResourceValue } from 'src/app/models/resources/resource-value.model';
import { ShopItemTypeEnum } from 'src/app/models/shop-item-type-enum.model';
import { environment } from '../../../environments/environment';
import * as CryptoJS from 'crypto-js';
import { plainToInstance } from 'class-transformer';

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
    return encrypted.toString();
  }

  redeemCode(encryptedVal: string) {
    var key = environment.CODEREDEMPTIONSECRET;
    console.log("Value: " + encryptedVal);
    var decrypted = CryptoJS.AES.decrypt(encryptedVal, key);
    console.log("Decrypted: " );
    console.log(decrypted.toString(CryptoJS.enc.Utf8));

    var parsedRewards = <ResourceValue[]>JSON.parse(decrypted.toString());
    //plainToInstance(GlobalVariables, loadDataJson);
      //this.globalService.globalVar = plainToInstance(GlobalVariables, loadDataJson);
    console.log(parsedRewards);    
  }
}
