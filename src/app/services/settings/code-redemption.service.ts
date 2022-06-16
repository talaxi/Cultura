import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CodeRedemptionService {

  constructor() { }

  testCode() {    
    console.log(environment.production);
    console.log(environment.CODEREDEMPTIONSECRET);
  }
}
