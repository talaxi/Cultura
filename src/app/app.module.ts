import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule,ReactiveFormsModule } from '@angular/forms'; 


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
import { DrawRaceComponent } from './components/main-views/race-selection-view/subviews/draw-race/draw-race.component';
import { TrainingListComponent } from './components/main-components/training-list/training-list.component';
import { TrainingOptionComponent } from './components/main-components/training-option/training-option.component';
import { CommonModule } from '@angular/common';
import { ShoppingListComponent } from './components/main-components/shopping-list/shopping-list.component';
import { ShoppingItemComponent } from './components/main-components/shopping-item/shopping-item.component';
import { AnimalDeckComponent } from './components/main-components/animal-deck/animal-deck.component';
import { DecksViewComponent } from './components/main-views/decks-view/decks-view.component';
import { RaceDescriptionComponent } from './components/main-views/race-selection-view/subviews/race-description/race-description.component';
import { ToggleComponent } from './components/main-components/ui-elements/toggle/toggle.component';
import { IncubatorViewComponent } from './components/main-views/incubator-view/incubator-view.component';
import { ThemeService } from './theme/theme.service';
import { IncubatorTraitsComponent } from './components/main-views/incubator-view/subviews/incubator-traits/incubator-traits.component';
import { TraitListComponent } from './components/main-components/trait-list/trait-list.component';
import { TraitOptionComponent } from './components/main-components/trait-option/trait-option.component';
import { FaqViewComponent } from './components/main-views/faq-view/faq-view.component';
import { StatsViewComponent } from './components/main-views/stats-view/stats-view.component';
import { TrainingTrackViewComponent } from './components/main-views/training-track-view/training-track-view/training-track-view.component';
import { TrainingTrackRaceViewComponent } from './components/main-views/training-track-view/training-track-view/subviews/training-track-race-view/training-track-race-view.component';
import { CoachingComponent } from './components/main-views/barn-view/barn-view/modals/coaching/coaching.component';
import { EventViewComponent } from './components/main-views/race-selection-view/subviews/event-view/event-view.component';
import { TalentComponent } from './components/main-components/talent/talent.component';
import { EventAnimalDeckComponent } from './components/main-components/event-animal-deck/event-animal-deck.component';
import { TokenShopViewComponent } from './components/main-views/shop-view/subviews/token-shop-view/token-shop-view.component';
import { OrbsViewComponent } from './components/main-views/resources-view/subviews/orbs-view/orbs-view.component';
import { ScrimmageComponent } from './components/main-views/barn-view/barn-view/modals/coaching/subviews/scrimmage/scrimmage.component';
import { RunCoachingComponent } from './components/main-views/barn-view/barn-view/modals/coaching/subviews/run-coaching/run-coaching.component';

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
    SelectedBarnComponent, ProgressBarComponent, CircuitViewComponent, LocalViewComponent, RaceComponent, AnimalsViewComponent, ShopViewComponent, ResourcesViewComponent, SettingsViewComponent, AnimalComponent, AnimalListComponent, SelectedAnimalComponent, DrawRaceComponent, TrainingListComponent, TrainingOptionComponent, ShoppingListComponent, ShoppingItemComponent, AnimalDeckComponent, DecksViewComponent, RaceDescriptionComponent, ToggleComponent, IncubatorViewComponent, IncubatorTraitsComponent, TraitListComponent, TraitOptionComponent, FaqViewComponent, StatsViewComponent, TrainingTrackViewComponent, TrainingTrackRaceViewComponent, CoachingComponent, EventViewComponent, TalentComponent, EventAnimalDeckComponent, TokenShopViewComponent, OrbsViewComponent, ScrimmageComponent, RunCoachingComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [GlobalService, ThemeService],
  bootstrap: [AppComponent]
})
export class AppModule { }
