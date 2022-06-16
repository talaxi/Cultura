import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DeploymentService {
  devModeActive = false;
  startNewGame = false;

  constructor() { }

  setProductionMode()
  {
    this.devModeActive = false;
    this.startNewGame = false;
  }

  setDevMode() {
    this.devModeActive = true;
    this.startNewGame = true;
  }
}
