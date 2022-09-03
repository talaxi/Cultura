
export enum EasyPinnacleConditionsEnum {
  threeHundredSecondRace, //TESTED
  twoRacersOnly, //TESTED
  threeRacersOnly, //TESTED
  noRelayEffects, //TESTED
  steamy,  //TESTED //+100% stamina cost
  burstIncreaseStaminaLoss, //TESTED //*3 stamina loss when bursting 
  slick, //TESTED //flatland, mountain, volcanic adaptability reduction
  strongWinds, //TESTED //ocean and tundra acceleration reduction
  hot, //TESTED //lava falls slower, tundra drift higher
  cold //TESTED //lava falls faster, tundra drift lower
}

export enum MediumPinnacleConditionsEnum {
  thirtySecondRace, //TESTED
  fourRacersOnly, //TESTED
  brokenFloorboards,  //TESTED //all paths have adaptability check
  sticky, //TESTED //acceleration drops proportional to how far into the race you are 
  longCooldowns, //TESTED
  unfocused, //TESTED //reduce Focus Distance when losing focus
  harshTerrain, //TESTED
  highSpeedLowAcceleration, //TESTED
}

export enum HardPinnacleConditionsEnum {
  noBurst, //TESTED
  lowStaminaRelay, //TESTED //forced to relay when stamina reaches certain %
  exhaustionPenaltyIncreased, //TESTED   //stamina starts at 50%, increased costs from exhaustion
  reduceSpeedOnRelay, //TESTED //every relay reduces max speed of next racer
  reduceAbilityEfficiency //TESTED
}