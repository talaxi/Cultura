import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Animal } from '../models/animals/animal.model';
import { NavigationEnum } from '../models/navigation-enum.model';
import { RaceTypeEnum } from '../models/race-type-enum.model';
import { ShopsEnum } from '../models/shops-enum.model';

@Injectable({
  providedIn: 'root'
})
export class ComponentCommunicationService {
  switchView: BehaviorSubject<NavigationEnum>;
  selectAnimalView: BehaviorSubject<Animal>;
  selectBarnView: BehaviorSubject<number>;
  selectShopView: BehaviorSubject<ShopsEnum>;
  selectRaceView: BehaviorSubject<RaceTypeEnum>;

  constructor() {
    this.switchView = new BehaviorSubject<NavigationEnum>(NavigationEnum.barn);
    this.selectAnimalView = new BehaviorSubject<Animal>(new Animal());
    this.selectBarnView = new BehaviorSubject<number>(0);
    this.selectShopView = new BehaviorSubject<ShopsEnum>(ShopsEnum.regular);
    this.selectRaceView = new BehaviorSubject<RaceTypeEnum>(RaceTypeEnum.circuit);
  }

  setNewView(newValue: NavigationEnum): void {
    if (newValue !== this.switchView.value)
      this.switchView.next(newValue);
  }

  getNewView(): Observable<NavigationEnum> {
    return this.switchView.asObservable();
  }

  setAnimalView(newView: NavigationEnum, newAnimalView: Animal) {
    if (newAnimalView !== this.selectAnimalView.value)
      this.selectAnimalView.next(newAnimalView);
    if (newView !== this.switchView.value)
      this.switchView.next(newView);
  }

  getAnimalView(): Observable<Animal> {
    return this.selectAnimalView.asObservable();
  }

  setBarnView(newView: NavigationEnum, newBarnNumber: number) {    
    if (newBarnNumber !== this.selectBarnView.value)
      this.selectBarnView.next(newBarnNumber);
    if (newView !== this.switchView.value)
      this.switchView.next(newView);
  }

  getBarnView(): Observable<number> {
    return this.selectBarnView.asObservable();
  }

  setShopView(newView: NavigationEnum, newShop: ShopsEnum) {
    if (newShop !== this.selectShopView.value)
      this.selectShopView.next(newShop);
    if (newView !== this.switchView.value)
      this.switchView.next(newView);
  }

  getShopView(): Observable<ShopsEnum> {
    return this.selectShopView.asObservable();
  }

  setRaceView(newView: NavigationEnum, newRace: RaceTypeEnum) {
    if (newRace !== this.selectRaceView.value)
      this.selectRaceView.next(newRace);
    if (newView !== this.switchView.value)
      this.switchView.next(newView);
  }

  getRaceView(): Observable<RaceTypeEnum> {
    return this.selectRaceView.asObservable();
  }
}
