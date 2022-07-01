export class Tutorials {
    tutorialCompleted: boolean;
    currentTutorialId: number;
    showTutorial: boolean;
    showTrainingTrackTutorial: boolean;
    showCoachingTutorial: boolean;

    constructor() {
        this.tutorialCompleted = false;
        this.currentTutorialId = 1;
        this.showTutorial = false;

        this.showTrainingTrackTutorial = true;
        this.showCoachingTutorial = true;
    }
}
