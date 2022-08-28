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
    this.allOrbs = this.globalService.globalVar.orbStats.allOrbs;    
  }

  getProgressBarPercent(type: OrbTypeEnum) {
    var orb = this.globalService.getOrbDetailsFromType(type);
    if (orb !== undefined)
    {      
      return (orb.xp / orb.xpNeededForLevel) * 100;
    }
    return 0;
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
