
export enum EasyPinnacleConditionsEnum {
  threeHundredSecondRace, //TESTED
  twoRacersOnly, //IMPLEMENTED
  threeRacersOnly, //TESTED
  noRelayEffects, //IMPLEMENTED
  steamy, //+100% stamina cost //IMPLEMENTED
}

export enum MediumPinnacleConditionsEnum {
  thirtySecondRace, //TESTED
  fourRacersOnly, //IMPLEMENTED
  brokenFloorboards, //all paths have adaptability check //IMPLEMENTED
  sticky, //acceleration drops proportional to how far into the race you are //IMPLEMENTED
  longCooldowns, //TESTED
}

export enum HardPinnacleConditionsEnum {
  noBurst, //TESTED
  lowStaminaRelay, //forced to relay when stamina reaches certain %
  exhaustionPenaltyIncreased, //stamina starts at 50%, increased costs from exhaustion //IMPLEMENTED
  unfocusedRelay, //forced to relay when losing focus
  reduceSpeedOnRelay //every relay reduces max speed of next racer //IMPLEMENTED
}