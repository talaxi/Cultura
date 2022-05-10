import { Injectable } from "@angular/core";
import { Theme, light, white, twilight, night } from "./theme";

@Injectable({
  providedIn: "root"
})
export class ThemeService {
  private active: Theme = light;
  private availableThemes: Theme[] = [white, light, twilight, night];

  getAvailableThemes(): Theme[] {
    return this.availableThemes;
  }

  getActiveTheme(): Theme {
    return this.active;
  }
  setNightTheme(): void {
    this.setActiveTheme(night);
  }

  setLightTheme(): void {
    this.setActiveTheme(light);
  }

  setTwilightTheme(): void {
    this.setActiveTheme(twilight);
  }

  setWhiteTheme(): void {
    this.setActiveTheme(white);
  }

  setActiveTheme(theme: Theme): void {
    this.active = theme;

    Object.keys(this.active.properties).forEach(property => {
      document.documentElement.style.setProperty(
        property,
        this.active.properties[property]
      );
    });
  }
}