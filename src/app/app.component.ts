import { Component } from '@angular/core';
import { GameLoopService } from './services/game-loop/game-loop.service';
import { GlobalService } from './services/global-service.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Cultura';

  constructor(private globalService: GlobalService, private gameLoopService: GameLoopService) {

  }

  ngOnInit() {    
        this.globalService.initializeGlobalVariables();
        this.gameLoopService.Update();
  }
}
