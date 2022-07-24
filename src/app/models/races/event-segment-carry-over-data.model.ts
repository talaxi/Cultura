import { Type } from "class-transformer";
import { AnimalTypeEnum } from "../animal-type-enum.model";
import { RaceVariables } from "../animals/race-variables.model";
import { RelayEffect } from "./relay-effect.model";

export class EventSegmentCarryOverData {
    velocity: number;
    stamina: number;    
    permanentMaxSpeedIncreaseMultiplier: number; //Cheetah Ability - On The Hunt, Gecko Ability - Night Vision, Penguin Ability - Quick Toboggan      
    permanentAdaptabilityIncreaseMultiplier: number; //Goat Ability - Sure-footed, created as an object so it can be passed as reference    
    permanentMaxSpeedIncreaseObjMultiplier: number; //Cheetah Ability - On The Hunt, Gecko Ability - Night Vision, Penguin Ability - Quick Toboggan      
    feedingFrenzyIncreaseMultiplier: number; //Shark Ability - Feeding Frenzy     
    greatMigrationAccelerationIncreaseAdditive: number; //Caribou Ability - Great Migration 
    coldBloodedIncreaseMultiplier: number; //Salamander Ability - Cold Blooded, created as an object so it can be passed as reference
    fleetingSpeedIncreaseMultiplier: number; //Fox Ability - Fleeting Speed
    nineTailsBuffs: [string, number][] = []; //stat, remaining distance. Fox Ability - Nine Tails
    relayEffects: RelayEffect[] = [];
    statLossFromExhaustion: number;    
    mountainEndingY: number = 0;
    racingAnimalType: AnimalTypeEnum; 
    deepBreathingStaminaGain: number = 0; //Goat Ability - Deep Breathing   
    longDistanceTalentIncreaseAccelerationWithLowVelocity: boolean = false;     
    maxSpeedFloor: number = 0;
    
    @Type(() => RaceVariables)
    raceVariables: RaceVariables = new RaceVariables();
}
