import { Injectable } from '@angular/core';
import { ResourceValue } from 'src/app/models/resources/resource-value.model';
import { ShopItemTypeEnum } from 'src/app/models/shop-item-type-enum.model';
import { environment } from 'src/environments/environment';
import * as CryptoJS from 'crypto-js';
import { RedeemableCode } from 'src/app/models/redeemable-code.model';
import { LookupService } from '../lookup.service';

@Injectable({
  providedIn: 'root'
})
export class CodeCreationService {
  redeemableCode: RedeemableCode;

  constructor(private lookupService: LookupService) { }
  
  setupRewards() {
    this.redeemableCode = new RedeemableCode();
    this.redeemableCode.expirationDate = new Date('2022-10-01');        
    this.redeemableCode.rewards.push(this.lookupService.gainCoins(50000));    
    this.redeemableCode.rewards.push(this.lookupService.gainMangoes(50));    
    this.redeemableCode.rewards.push(this.lookupService.gainTokens(50));    
  }

  createCode() {
    this.setupRewards();
    var key = environment.CODEREDEMPTIONSECRET;
    var rewardString = JSON.stringify(this.redeemableCode);
    var encrypted = CryptoJS.AES.encrypt(rewardString, key);
    return encrypted.toString();
  }

}
