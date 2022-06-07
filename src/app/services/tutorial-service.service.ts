import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
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

    tutorialState.id = id;

    if (id === 1)
    {      
      tutorialState.tutorialText = "<b>Welcome to Cultura!</b> \n\n Cultura is the name of your soon to be state of the art animal racing facility. Train and nurture your animal companions and rise through the ranks by winning circuit competitions. Mix and match different racing teams and abilities to rise as far as you can!\n\n" +
      "Let's take a tour. From this page, you can select a barn where you can assign and train animals. Currently, you have a fine racing horse already set up in your first barn. Select it and let's get to work. \n\n <b>Select 'Barn 1' outlined in red.</b>";
      
      tutorialState.associatedTab = NavigationEnum.barn;
    }
    if (id === 2)
    {
      tutorialState.tutorialText = "You gotta train your animals if you want them to win. There are only a few training options to choose from now, but as you grow you will find better and faster ways to improve. Each training will develop your animals in specific ways, improving the following stats:\n\n" +
      "Speed: Increase the max speed your animal can run in a race.\n" +
      "Acceleration: Increase how quickly your animal gains speed.\n" +
      "Endurance: Increase the distance your animal can run before tiring out and slowing down.\n" +
      "Power: Increase the efficiency of your unique ability.\n" +
      "Focus: Increase the distance your animal can run before losing focus and stopping abruptly.\n" +
      "Adaptability: Increase the likelihood your animal won't stumble when racing through unique paths.\n\n" +      
      "<b>Select a training option out of the ones outlined in red.</b>";
      tutorialState.associatedTab = NavigationEnum.barn;
    }
    if (id === 3)
    {
      tutorialState.tutorialText = "Here you can get a breakdown on the status of your animals. Here's your horse along with all of the stat information we just went over. If you need a refresher, hover over any of the stats to see what they do. Check back here often as you proceed to assign new abilities and items to your animals, as well as breeding them to gain even faster offspring.\n\n" +
      "Now that your horse has had time to take a few practice laps, let's see if they have what it takes to win a race!\n\n" +
      "<b>Select the 'Race' option on the right bordered in red.</b>";
      tutorialState.associatedTab = NavigationEnum.animals;
    }
    if (id === 4)
    {
      tutorialState.tutorialText = "You've got a few options here. Circuit races are all about deciding where you stand against the competition. If you win all of the circuit races for your rank, you'll move up into the next rank which may net you some nifty rewards and open up new opportunities for your facility. You can also check out the local scene and see what other options you have. That might be a good way to get your name out there and improve your renown or maybe find some stuff you couldn't find anywhere else.\n\n" +
      "For now, let's see if you can make it up to the next circuit rank. It's a nice sunny day today and that might impact how your racer runs. If you hover over a race, you'll see how the terrain or weather might impact the conditions of the race. When in doubt, hovering over an item usually gives you the information you need. Whenever you're ready, start the race. Good luck!\n\n" +
      "<b>Select the race option outlined in red.</b>";
      tutorialState.associatedTab = NavigationEnum.raceselection;
    }
    if (id === 5)
    {
      tutorialState.tutorialText = "Way to go! Exciting stuff there. Looks like you've got the gist of it for now. Keep racing, make some money, and build up your facility to be as great as it can be. I look forward to seeing how far you can go!";      
      tutorialState.associatedTab = NavigationEnum.raceselection;
    }

    return tutorialState;
  }

  openTutorialModal() {

  }
}
