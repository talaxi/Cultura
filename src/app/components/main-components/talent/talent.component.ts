import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Animal } from 'src/app/models/animals/animal.model';
import { TalentTreeTypeEnum } from 'src/app/models/talent-tree-type-enum.model';
import { GameLoopService } from 'src/app/services/game-loop/game-loop.service';
import { GlobalService } from 'src/app/services/global-service.service';
import { LookupService } from 'src/app/services/lookup.service';

@Component({
  selector: 'app-talent',
  templateUrl: './talent.component.html',
  styleUrls: ['./talent.component.css']
})
export class TalentComponent implements OnInit {
  @Input() selectedAnimal: Animal;
  @Input() row: number;
  @Input() column: number;
  @Input() isPreview: boolean = false;
  @Input() previewType: string = "";
  @Output() spentTalent = new EventEmitter<boolean>();

  talentTreeType: TalentTreeTypeEnum;
  talentDescription: string;
  pointsInTalent: number;
  upgradedTalentDescription: string;
  totalPossiblePoints: number;
  hasTalentPoint: boolean;
  hasEnoughPointsInColumn: boolean;
  pointsNeededInColumn: number;
  availableTalentPoints: number;
  subscription: any;

  constructor(public lookupService: LookupService, private gameLoopService: GameLoopService, private globalService: GlobalService) { }

  ngOnInit(): void {
    this.talentTreeType = this.selectedAnimal.talentTree.talentTreeType;    
    this.pointsInTalent = this.selectedAnimal.talentTree.getTalentPointsByRowColumn(this.row, this.column);
    this.talentDescription = this.lookupService.getTalentDescription(this.row, this.column, this.talentTreeType, this.pointsInTalent);
    this.upgradedTalentDescription = this.lookupService.getTalentDescription(this.row, this.column, this.talentTreeType, this.pointsInTalent + 1);
    this.totalPossiblePoints = this.lookupService.getTotalPossiblePointsByRowColumn(this.row, this.column, this.talentTreeType);
    this.availableTalentPoints = this.lookupService.getTalentPointsAvailableToAnimal(this.selectedAnimal);
    this.hasTalentPoint = this.availableTalentPoints > 0;
    var pointsNeededInColumn = 0;
    if (this.row === 1)
      pointsNeededInColumn = this.selectedAnimal.talentTree.row2RequiredPoints;
    if (this.row === 2)
      pointsNeededInColumn = this.selectedAnimal.talentTree.row3RequiredPoints;
    if (this.row === 3)
      pointsNeededInColumn = this.selectedAnimal.talentTree.row4RequiredPoints;
          
    this.pointsNeededInColumn = pointsNeededInColumn - this.selectedAnimal.talentTree.getTalentPointsByColumn(this.column);
    this.hasEnoughPointsInColumn = this.pointsNeededInColumn <= 0;

    if (this.isPreview && this.previewType !== "")
    {      
      this.talentTreeType = this.lookupService.getTalentTreeByStringName(this.previewType);      
    }

    this.subscription = this.gameLoopService.gameUpdateEvent.subscribe((deltaTime: number) => {      
      this.pointsInTalent = this.selectedAnimal.talentTree.getTalentPointsByRowColumn(this.row, this.column);
      this.talentDescription = this.lookupService.getTalentDescription(this.row, this.column, this.talentTreeType, this.pointsInTalent);
      this.upgradedTalentDescription = this.lookupService.getTalentDescription(this.row, this.column, this.talentTreeType, this.pointsInTalent + 1);
      this.availableTalentPoints = this.lookupService.getTalentPointsAvailableToAnimal(this.selectedAnimal);
      this.hasTalentPoint = this.availableTalentPoints > 0;      
      this.pointsNeededInColumn = pointsNeededInColumn - this.selectedAnimal.talentTree.getTalentPointsByColumn(this.column);
      this.hasEnoughPointsInColumn = this.pointsNeededInColumn <= 0;
    });
  }

  isTalentMaxed() {
    var isMaxed = false;

    if (this.selectedAnimal.talentTree.getTalentPointsByRowColumn(this.row, this.column) >= this.lookupService.getTotalPossiblePointsByRowColumn(this.row, this.column, this.selectedAnimal.talentTree.talentTreeType))
    {
      isMaxed = true;
    }

    return isMaxed;
  }

  spendTalentPoint() {
    if (this.isTalentMaxed())
    {
      return;
    }

    this.selectedAnimal.talentTree.spendTalentPoint(this.row, this.column);
    this.spentTalent.emit(true);

    this.pointsInTalent = this.selectedAnimal.talentTree.getTalentPointsByRowColumn(this.row, this.column);
    this.availableTalentPoints = this.lookupService.getTalentPointsAvailableToAnimal(this.selectedAnimal);
    this.hasTalentPoint = this.availableTalentPoints > 0;

    this.globalService.calculateAnimalRacingStats(this.selectedAnimal);
  }

  ngOnChanges(changes: any) {    
    if (changes.previewType !== undefined && this.isPreview)
    {
      this.previewType = changes.previewType.currentValue;
      this.talentTreeType = this.lookupService.getTalentTreeByStringName(this.previewType);
    }
  }

  ngOnDestroy() {
    if (this.subscription !== null && this.subscription !== undefined)
      this.subscription.unsubscribe();
  }
}
