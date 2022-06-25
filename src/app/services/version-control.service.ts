import { Injectable } from '@angular/core';
import { GlobalService } from './global-service.service';

@Injectable({
  providedIn: 'root'
})
export class VersionControlService {

  constructor(private globalService: GlobalService) { }

  //add to this in descending order
  gameVersions = [1.00];

  getLatestChanges() {
    return this.getVersionChanges(this.gameVersions[0]);
  }

  getAllChanges() {
    var allChanges: string[] = [];
    this.gameVersions.forEach(version => {
      allChanges.push(this.getVersionChanges(version));
    });
    return allChanges;
  }

  getVersionChanges(version: number) {
    var changes = "";

    if (version === 1.00)
      changes = "Initial Launch!";
    
    return changes;
  }

  updatePlayerVersion() {
    this.globalService.globalVar.unlockables.set("trainingTrack", true); 
    this.gameVersions.forEach(version => {
      if (this.globalService.globalVar.currentVersion < version)
      {
        /*if (version === 1.01)
        {
          this.globalService.globalVar.unlockables.set("trainingTrack", true);          
        } */       

        this.globalService.globalVar.currentVersion = version;
      }
    });
  }
}
