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

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    HeaderComponent,
    FooterComponent,
    NavigationComponent,
    BarnComponent,
    BarnViewComponent,
    RaceSelectionViewComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
