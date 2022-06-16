import { Injectable } from '@angular/core';
import { ResourceValue } from 'src/app/models/resources/resource-value.model';
import { ShopItemTypeEnum } from 'src/app/models/shop-item-type-enum.model';
import { environment } from '../../../environments/environment';
import * as CryptoJS from 'crypto-js';
import { plainToInstance } from 'class-transformer';
import { GlobalService } from '../global-service.service';

@Injectable({
  providedIn: 'root'
})
export class CodeRedemptionService {

  constructor(private globalService: GlobalService) { }

  redeemCode(encryptedVal: string) {
    var key = environment.CODEREDEMPTIONSECRET;
    var decrypted = CryptoJS.AES.decrypt(encryptedVal, key);
    if (decrypted.toString(CryptoJS.enc.Utf8).length === 0) {
      //TODO: error handle
    }
    try {
      var parsedRewards = <ResourceValue[]>JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));

      if (parsedRewards !== null && parsedRewards !== undefined && parsedRewards.length > 0) {
        parsedRewards.forEach(reward => {
          var existingResource = this.globalService.globalVar.resources.find(item => item.name === reward.name);
          if (existingResource !== null && existingResource !== undefined)
            existingResource.amount += reward.amount;
          else
            this.globalService.globalVar.resources.push(reward);
        });
      }
    }
    catch (error) {
      //TODO: error handle
    }
  }
}
