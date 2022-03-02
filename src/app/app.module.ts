import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MainComponent } from './components/main/main.component';

import { FooterComponent } from './components/layout/footer/footer.component';
import { HeaderComponent } from './components/layout/header/header.component';
import { NavigationComponent } from './components/layout/navigation/navigation.component';
import { BarnComponent } from './components/main-components/barn/barn.component';
import { BarnViewComponent } from './components/main-views/barn-view/barn-view/barn-view.component';
import { RaceSelectionViewComponent } from './components/main-views/race-selection-view/race-selection-view/race-selection-view.component';

import { GlobalService } from './services/global-service.service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SelectedBarnComponent } from './components/main-views/barn-view/barn-view/modals/selected-barn/selected-barn.component';
import { ProgressBarComponent } from './components/utility/progress-bar/progress-bar.component';
import { CircuitViewComponent } from './components/main-views/race-selection-view/subviews/circuit-view/circuit-view/circuit-view.component';
import { LocalViewComponent } from './components/main-views/race-selection-view/subviews/local-view/local-view/local-view.component';
import { RaceComponent } from './components/main-views/race-selection-view/subviews/race/race.component';
import { AnimalsViewComponent } from './components/main-views/animals-view/animals-view.component';
import { ShopViewComponent } from './components/main-views/shop-view/shop-view.component';
import { ResourcesViewComponent } from './components/main-views/resources-view/resources-view.component';
import { SettingsViewComponent } from './components/main-views/settings-view/settings-view.component';
import { AnimalComponent } from './components/main-components/animal/animal.component';
import { AnimalListComponent } from './components/main-components/animal-list/animal-list.component';
import { SelectedAnimalComponent } from './components/main-views/animals-view/subviews/selected-animal/selected-animal.component';

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    HeaderComponent,
    FooterComponent,
    NavigationComponent,
    BarnComponent,
    BarnViewComponent,
    RaceSelectionViewComponent,    
    SelectedBarnComponent, ProgressBarComponent, CircuitViewComponent, LocalViewComponent, RaceComponent, AnimalsViewComponent, ShopViewComponent, ResourcesViewComponent, SettingsViewComponent, AnimalComponent, AnimalListComponent, SelectedAnimalComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule
  ],
  providers: [GlobalService],
  bootstrap: [AppComponent]
})
export class AppModule { }
