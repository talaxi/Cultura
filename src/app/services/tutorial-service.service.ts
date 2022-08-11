import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NavigationEnum } from '../models/navigation-enum.model';
import { TutorialState } from '../models/tutorial-state.model';
import { GlobalService } from './global-service.service';

@Injectable({
  providedIn: 'root'
})
export class TutorialService {

  constructor(private globalService: GlobalService) { }

  skipTutorial()
  {
    this.globalService.globalVar.tutorials.tutorialCompleted = true;
    this.globalService.globalVar.tutorials.currentTutorialId = 9; //need to keep this updated or come up with better idea
  }

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
      tutorialState.tutorialText = "You'll have to train your animals if you want them to win. There are only a few training options to choose from now, but as you grow you will find better and faster ways to improve. Each training will develop your animals in specific ways, improving the following base stats:\n\n" +
      "<b>Speed</b>: Increase the max speed your animal can run in a race.\n" +
      "<b>Acceleration</b>: Increase how quickly your animal gains speed.\n" +
      "<b>Endurance</b>: Increase the distance your animal can run before tiring out and slowing down.\n" +
      "<b>Power</b>: Increase the efficiency of your unique ability.\n" +
      "<b>Focus</b>: Increase the distance your animal can run before losing focus and stopping abruptly.\n" +
      "<b>Adaptability</b>: Increase the likelihood your animal won't stumble when racing through unique paths.\n\n" +      
      "<b>Select a training option out of the ones outlined in red.</b>";
      tutorialState.associatedTab = NavigationEnum.barn;
    }
    if (id === 3)
    {
      tutorialState.tutorialText = "Here you can get a breakdown on the status of your animals. Here's your horse along with all of the stat information we just went over. If you need a refresher, hover over any of the stats to see what they do. There are a few other stats here to be mindful of:\n\n" +       
      "<b>Diminishing Returns</b>: After a base stat reaches the Diminishing Returns value, any additional training of that stat gets progressively weaker. Typically, you want to try and keep all of your base stats around your Diminishing Returns value for best results. You'll find multiple ways to increase your Diminishing Returns value as you progress.\n" +
      "<b>Burst Chance</b>: As you race, your racer may enter Burst mode. This increases their overall velocity and allows them to exceed their Max Speed. This stat is based on a combination of Focus and Adaptability and is not affected by Diminishing Returns.\n" +
      "<b>Burst Distance</b>: This controls how long you stay in Burst mode. This stat is based on your Power and is not affected by Diminishing Returns.\n\n" +
      "Check back here often as you proceed to assign new abilities and items to your animals, as well as breeding them to gain even faster offspring.\n\n" +
      "Now that your horse has had time to take a few practice laps, let's see if they have what it takes to win a race!\n\n" +
      "<b>Select the 'Race' option on the right (or in the menu if on mobile) bordered in red.</b>";
      tutorialState.associatedTab = NavigationEnum.animals;
    }
    if (id === 4)
    {
      tutorialState.tutorialText = "You've got a few options here. Circuit races are all about deciding where you stand against the competition. If you win all of the circuit races for your rank, you'll move up into the next rank which may net you some nifty rewards and open up new opportunities for your facility. Improving your Circuit Rank should be your number one goal in becoming a top tier racing facility!\n\n" + 
      "You can also run some free races against local competition. Only a few races are available at a time, but it can be a great way to get some practice in and make some quick money. It may be helpful at times to make sure you make quick work of free races before proceeding to the next circuit rank.\n\n" +
      "For now, let's see if you can make it up to the next circuit rank. It's a nice sunny day today and that might impact how your racer runs. If you hover over a race, you'll see how the terrain or weather might impact the conditions of the race. When in doubt, hovering over text usually gives you the information you need. Whenever you're ready, start the race. Your goal is to get to the finish line before your competition (represented as the little black dot). Good luck!\n\n" +
      "<b>Click (or tap if you are on mobile) the race option outlined in red.</b>";
      tutorialState.associatedTab = NavigationEnum.raceselection;
    }
    if (id === 5)
    {
      tutorialState.tutorialText = "Way to go! Exciting stuff there. Looks like you've got the gist of it for now. Keep racing, make some money, and build up your facility to be as great as it can be. Don't forget to train both your Horse and Monkey, and try to keep their stats well rounded. I'll check in with you again a little later. I look forward to seeing how far you can go!\n\n" + 
      "<b>Continue training your animals and completing Circuit Races to raise your Circuit Rank. If you are stuck or are confused about anything as you progress, check the 'FAQs' link down below on the right side of the footer.</b>";      
      tutorialState.associatedTab = NavigationEnum.raceselection;
    }
    if (id === 6)
    {
      tutorialState.tutorialText = "Nice, you've unlocked another racer! If you jump straight into a race with your untrained monkey, things probably aren't going to go well. As you race, you'll start making enough money to build more barns and train your animals simultaneously. For now, let's go back to the barn you have.\n\n" +
      "<b>Select 'Barn 1' outlined in red.</b>";      
      tutorialState.associatedTab = NavigationEnum.raceselection;
    }
    if (id === 7)
    {
      tutorialState.tutorialText = "Let's see if we can start training your new racing Monkey. From here you can unassign an animal from a barn and bring a new animal in. As you start to branch out and race in different course types, you'll want to try and keep your team well balanced. It's not going to help you if you have a prized thoroughbred torching the competition if your follow up racer can barely make it out the gate.\n\n" +
      "Let's start training your Monkey now.\n\n" +
      "<b>Select 'Unassign' at the top of the screen and choose 'Monkey' to train.</b>";      
      tutorialState.associatedTab = NavigationEnum.barn;
    }
    if (id === 8)
    {
      tutorialState.tutorialText = "Nicely done. One last thing to talk about before I let you do whatever you want. First, select a training option from the options below so that your Monkey can start getting acclimated to racing. Then, click your animal's name to take a shortcut to the animal page and let's talk about breeding. If you haven't named your animal, its type is its name (so for example, Monkey's name is Monkey).\n\n" +
      "<b>Select a training option below and then click (or tap if you are on mobile) your animal's type or name to jump to its page.</b>";      
      tutorialState.associatedTab = NavigationEnum.barn;
    }
    if (id === 9)
    {
      tutorialState.tutorialText = "Here you can see how close your animal is to being able to breed. Training and racing both contribute to this. Once you're ready, you can breed your animal and start racing the offspring. There's a strategic element to this. <b>After breeding, your animal will have its stats set back to their starting points, but the amount that the base stats contribute to the racing stats will increase.</b> You won't need to worry about breeding for awhile, but to eventually keep up with the competition you'll need to keep breeding and getting faster. Don't breed right before a big race though or you might have to spend some extra time training!\n\n" +
      "There's an ebb and flow to it. Race as far as your animals can go, breed them many times in quick succession to get a large percentage upgrade to stats, and then get back in the race. <b>This game is intended to be a slow burn and skews towards idle play. If you play very actively, you may find yourself needing to wait at certain points especially early on. Breeding once, training to max, breeding one time again, and so on is not recommended. Cycle between breeding in batches and then racing with your much higher stat modifiers.\n\n" +
      "That's all I have for you. Good luck and have fun!";
      tutorialState.associatedTab = NavigationEnum.animals;
      this.globalService.globalVar.tutorials.tutorialCompleted = true;
    }
    

    return tutorialState;
  }

  openTutorialModal() {

  }
}
