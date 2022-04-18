import { Injectable } from '@angular/core';
import { NavigationEnum } from '../models/navigation-enum.model';
import { TutorialState } from '../models/tutorial-state.model';

@Injectable({
  providedIn: 'root'
})
export class TutorialService {

  constructor() { }

  getTutorialState(id: number)
  {
    var tutorialState = new TutorialState();

    if (id === 1)
    {
      tutorialState.id = id;
      tutorialState.tutorialText = "Welcome to Cultura!";
      tutorialState.associatedTab = NavigationEnum.barn;
    }
    if (id === 2)
    {
      tutorialState.id = id;
      tutorialState.tutorialText = "Test 3 4";
      tutorialState.associatedTab = NavigationEnum.barn;
    }

    return tutorialState;
  }
}
