import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Animal } from '../models/animals/animal.model';
import { NavigationEnum } from '../models/navigation-enum.model';

@Injectable({
  providedIn: 'root'
})
export class ComponentCommunicationService {
  switchView: BehaviorSubject<NavigationEnum>;
  selectAnimalView: BehaviorSubject<Animal>;
  selectBarnView: BehaviorSubject<number>;

  constructor() {
    this.switchView = new BehaviorSubject<NavigationEnum>(NavigationEnum.barn);
    this.selectAnimalView = new BehaviorSubject<Animal>(new Animal());
    this.selectBarnView = new BehaviorSubject<number>(0);
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
    //console.log("Old #: " + this.selectBarnView.value + " New #: " + newBarnNumber);
    if (newBarnNumber !== this.selectBarnView.value)
      this.selectBarnView.next(newBarnNumber);
    if (newView !== this.switchView.value)
      this.switchView.next(newView);
  }

  getBarnView(): Observable<number> {
    return this.selectBarnView.asObservable();
  }
}
