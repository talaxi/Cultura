import { Component, OnInit } from '@angular/core';
import { Orb } from 'src/app/models/animals/orb.model';
import { OrbTypeEnum } from 'src/app/models/orb-type-enum.model';
import { GlobalService } from 'src/app/services/global-service.service';

@Component({
  selector: 'app-orbs-view',
  templateUrl: './orbs-view.component.html',
  styleUrls: ['./orbs-view.component.css']
})
export class OrbsViewComponent implements OnInit {

  allOrbs: Orb[];

  constructor(public globalService: GlobalService) { }

  ngOnInit(): void {    
    this.allOrbs = this.globalService.globalVar.orbStats.allOrbs.filter(item => this.globalService.globalVar.resources.some(resource => this.globalService.getOrbTypeFromResource(resource) === item.type));        
  }

  getProgressBarPercent(type: OrbTypeEnum) {
    var orb = this.globalService.getOrbDetailsFromType(type);
    if (orb !== undefined)
    {      
      return (orb.xp / orb.xpNeededForLevel) * 100;
    }
    return 0;
  }

  toggleOrb(type: OrbTypeEnum) {
    if (type === OrbTypeEnum.amber)
    {
      var currentStatus = this.globalService.globalVar.settings.get('amberOrbToggled');
      this.globalService.globalVar.settings.set('amberOrbToggled', !currentStatus);      
    }
    if (type === OrbTypeEnum.amethyst)
    {
      var currentStatus = this.globalService.globalVar.settings.get('amethystOrbToggled');
      this.globalService.globalVar.settings.set('amethystOrbToggled', !currentStatus);      
    }
    if (type === OrbTypeEnum.emerald)
    {
      var currentStatus = this.globalService.globalVar.settings.get('emeraldOrbToggled');
      this.globalService.globalVar.settings.set('emeraldOrbToggled', !currentStatus);      
    }
    if (type === OrbTypeEnum.ruby)
    {
      var currentStatus = this.globalService.globalVar.settings.get('rubyOrbToggled');
      this.globalService.globalVar.settings.set('rubyOrbToggled', !currentStatus);      
    }
    if (type === OrbTypeEnum.sapphire)
    {
      var currentStatus = this.globalService.globalVar.settings.get('sapphireOrbToggled');
      this.globalService.globalVar.settings.set('sapphireOrbToggled', !currentStatus);      
    }
    if (type === OrbTypeEnum.topaz)
    {
      var currentStatus = this.globalService.globalVar.settings.get('topazOrbToggled');
      this.globalService.globalVar.settings.set('topazOrbToggled', !currentStatus);      
    }
  }

  isOrbMinimized(type: OrbTypeEnum) {
    var isMinimized = false;

    if (type === OrbTypeEnum.amber)
    {
      isMinimized = this.globalService.globalVar.settings.get('amberOrbToggled');         
    }
    if (type === OrbTypeEnum.amethyst)
    {
      isMinimized = this.globalService.globalVar.settings.get('amethystOrbToggled');      
    }
    if (type === OrbTypeEnum.emerald)
    {
      isMinimized = this.globalService.globalVar.settings.get('emeraldOrbToggled');      
    }
    if (type === OrbTypeEnum.ruby)
    {
      isMinimized = this.globalService.globalVar.settings.get('rubyOrbToggled');           
    }
    if (type === OrbTypeEnum.sapphire)
    {
      isMinimized = this.globalService.globalVar.settings.get('sapphireOrbToggled');      
    }
    if (type === OrbTypeEnum.topaz)
    {
      isMinimized = this.globalService.globalVar.settings.get('topazOrbToggled');      
    }

    return isMinimized;
  }

  colorConditional(type: OrbTypeEnum)
  {
    return {
      'amberColor': type === OrbTypeEnum.amber,
      'amethystColor': type === OrbTypeEnum.amethyst,
      'rubyColor': type === OrbTypeEnum.ruby,
      'sapphireColor': type === OrbTypeEnum.sapphire,
      'topazColor': type === OrbTypeEnum.topaz,
      'emeraldColor': type === OrbTypeEnum.emerald,
    };
  }
}
