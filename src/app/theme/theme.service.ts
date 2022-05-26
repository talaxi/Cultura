import { Injectable } from "@angular/core";
import { GlobalService } from "../services/global-service.service";
import { Theme, light, white, twilight, night } from "./theme";

@Injectable({
  providedIn: "root"
})
export class ThemeService {
  private active: Theme = night;
  private availableThemes: Theme[] = [white, light, twilight, night];

  getAvailableThemes(): Theme[] {
    return this.availableThemes;
  }

  getActiveTheme(): Theme {
    return this.active;
  }

  setNightTheme() {
    return this.setActiveTheme(night);
  }

  setLightTheme() {
    return this.setActiveTheme(light);
  }

  setTwilightTheme() {
    return this.setActiveTheme(twilight);
  }

  setWhiteTheme() {
    return this.setActiveTheme(white);
  }

  setActiveTheme(theme: Theme) {
    this.active = theme;

    Object.keys(this.active.properties).forEach(property => {
      document.documentElement.style.setProperty(
        property,
        this.active.properties[property]
      );
    });

    return theme;
  }
}