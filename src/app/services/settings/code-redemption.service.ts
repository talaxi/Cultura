import { Injectable } from '@angular/core';
import { ResourceValue } from 'src/app/models/resources/resource-value.model';
import { ShopItemTypeEnum } from 'src/app/models/shop-item-type-enum.model';
import { environment } from '../../../environments/environment';
import * as CryptoJS from 'crypto-js';
import { plainToInstance } from 'class-transformer';
import { GlobalService } from '../global-service.service';
import { RedeemableCode } from 'src/app/models/redeemable-code.model';

@Injectable({
  providedIn: 'root'
})
export class CodeRedemptionService {

  constructor(private globalService: GlobalService) { }

  redeemCode(encryptedVal: string) {
    var key = environment.CODEREDEMPTIONSECRET;
    var decrypted = CryptoJS.AES.decrypt(encryptedVal, key);
    if (decrypted.toString(CryptoJS.enc.Utf8).length === 0) {
      alert("Invalid code entered.");
    }
    try {
      var parsedRewards = <RedeemableCode>JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));

      if (parsedRewards !== null && parsedRewards !== undefined && parsedRewards.rewards.length > 0) {        
        if (new Date().getTime() > new Date(parsedRewards.expirationDate).getTime())
          alert("This code has expired.");
        else if (this.globalService.globalVar.redeemedCodes.some(item => item.codeValue === decrypted.toString(CryptoJS.enc.Utf8)))
          alert("This code has already been redeemed.");
        else {
          parsedRewards.rewards.forEach(reward => {
            var existingResource = this.globalService.globalVar.resources.find(item => item.name === reward.name);
            if (existingResource !== null && existingResource !== undefined)
              existingResource.amount += reward.amount;
            else
              this.globalService.globalVar.resources.push(reward);
          });

          parsedRewards.codeValue = decrypted.toString(CryptoJS.enc.Utf8);
          this.globalService.globalVar.redeemedCodes.push(parsedRewards);
        }
      }
    }
    catch (error) {      
      alert("You've run into an error! Please try again. If you have the time, please export your data under the Settings tab and send me the data and any relevant info at CulturaIdle@gmail.com. Thank you!");
    }
  }
}
