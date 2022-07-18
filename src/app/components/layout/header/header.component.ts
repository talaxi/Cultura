import { Component, OnInit, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NavigationEnum } from 'src/app/models/navigation-enum.model';
import { ComponentCommunicationService } from 'src/app/services/component-communication.service';
import { GameLoopService } from 'src/app/services/game-loop/game-loop.service';
import { GlobalService } from 'src/app/services/global-service.service';
import { LookupService } from 'src/app/services/lookup.service';
import { VersionControlService } from 'src/app/services/version-control.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  coinCount: number;
  medalCount: number;
  version: string;
  latestVersionChanges: string;
  changeLog: string[];
  allVersions: number[];

  constructor(private lookupService: LookupService, private gameLoopService: GameLoopService, private globalService: GlobalService,
    private componentCommunicationService: ComponentCommunicationService, public versionControlService: VersionControlService,
    private modalService: NgbModal, public sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    this.version = this.globalService.globalVar.currentVersion.toFixed(2);
    this.latestVersionChanges = this.versionControlService.getLatestChanges();
    this.changeLog = this.versionControlService.getAllChanges();
    this.allVersions = this.versionControlService.gameVersions;

    this.gameLoopService.gameUpdateEvent.subscribe((deltaTime: number) => {
      if (!this.globalService.globalVar.userIsRacing) {
        this.coinCount = this.lookupService.getCoins();
        this.medalCount = this.lookupService.getMedals();
      }
    });
  }

  getSanitizedHtml(text: string) {
    return this.sanitizer.sanitize(SecurityContext.HTML, this.sanitizer.bypassSecurityTrustHtml(text));
  }

  changeView(newView: NavigationEnum) {    
    this.componentCommunicationService.setNewView(newView);
  }

  openChangeLog(content: any) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', size: 'xl' });
  }
}
