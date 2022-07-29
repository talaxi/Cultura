export interface Theme {
    name: string;
    properties: any;
  }
  
  export const white: Theme = {
    name: "white",
    properties: {
      "--foreground-default": "#000000",
      "--foreground-secondary": "#1B1B1B",
      "--foreground-tertiary": "#a6a49d",
      "--foreground-quaternary": "#2F2F2F",
      "--foreground-light": "#000000",
  
      "--background-default": "#FCFCFC",
      "--background-secondary": "#FFFFFF",
      "--background-tertiary": "#C4C4C4",
      "--background-quarternary": "#ACAFB4",
      "--background-light": "#FFFFFF",
  
      "--primary-default": "#5DFDCB",
      "--primary-dark": "#24B286",
      "--primary-light": "#B2FFE7",
  
      "--error-default": "#EF3E36",
      "--error-dark": "#800600",
      "--error-light": "#FFCECC",
        
      "--flatlandColor": "#c66900",
      "--mountainColor": "#279113",
      "--waterColor": "#0000ff",
      "--waterSubcolor": "#16148f",
      "--tundraColor": "#1ca1c9",
      "--volcanicColor": "#d92525",
      
      "--resourceKeywordColor": "#822B03",
      "--progressionKeywordColor": "#8105fc",
      "--specialityKeywordColor": "#050efc",
      "--equipmentKeywordColor": "#1B7F02",
  
      "--background-tertiary-shadow": "0 1px 3px 0 rgba(92, 125, 153, 0.5)"
    }
  };

  export const light: Theme = {
    name: "light",
    properties: {
      "--foreground-default": "#08090A",
      "--foreground-secondary": "#41474D",
      "--foreground-tertiary": "#797C80",
      "--foreground-quaternary": "#F4FAFF",
      "--foreground-light": "#41474D",
  
      "--background-default": "#F4FAFF",
      "--background-secondary": "#A3B9CC",
      "--background-tertiary": "#5C7D99",
      "--background-quarternary": "#65799E",
      "--background-light": "#FFFFFF",
  
      "--primary-default": "#5DFDCB",
      "--primary-dark": "#24B286",
      "--primary-light": "#B2FFE7",
  
      "--error-default": "#EF3E36",
      "--error-dark": "#800600",
      "--error-light": "#FFCECC",

      "--flatlandColor": "#BF6200",
      "--mountainColor": "#228D0F",
      "--waterColor": "#0000ff",
      "--waterSubcolor": "#16148f",
      "--tundraColor": "#266A80",
      "--volcanicColor": "#C70604",
      
      "--resourceKeywordColor": "#822B03",
      "--progressionKeywordColor": "#501da8",
      "--specialityKeywordColor": "#064064",
      "--equipmentKeywordColor": "#2C6854",
  
      "--background-tertiary-shadow": "0 1px 3px 0 rgba(92, 125, 153, 0.5)"
    }
  };

  export const twilight: Theme = {
    name: "twilight",
    properties: {
      "--foreground-default": "#ED8B42",
      "--foreground-secondary": "#C05100",
      "--foreground-tertiary": "#6A2D00",
      "--foreground-quaternary": "#FFAA20",
      "--foreground-light": "#FF8F3D",
  
      "--background-default": "#5D0274",
      "--background-secondary": "#210129",
      "--background-tertiary": "#14001A",
      "--background-quarternary": "#4F223C",
      "--background-light": "#72028D",
  
      "--primary-default": "#5DFDCB",
      "--primary-dark": "#24B286",
      "--primary-light": "#B2FFE7",
  
      "--error-default": "#EF3E36",
      "--error-dark": "#800600",
      "--error-light": "#FFCECC",
  
      "--flatlandColor": "#c66900",
      "--mountainColor": "#279113",
      "--waterColor": "#0000ff",
      "--waterSubcolor": "#16148f",      
      "--tundraColor": "#1ca1c9",
      "--volcanicColor": "#d92525",
      
      "--resourceKeywordColor": "#822B03",
      "--progressionKeywordColor": "#501da8",
      "--specialityKeywordColor": "#000000",
      "--equipmentKeywordColor": "#2C6854",

      "--background-tertiary-shadow": "0 1px 3px 0 rgba(92, 125, 153, 0.5)"
    }
  };
  
  export const night: Theme = {
    name: "night",
    properties: {
      "--foreground-default": "#A3B9CC",
      "--foreground-secondary": "#5C7D99",
      "--foreground-tertiary": "#49647A",
      "--foreground-quaternary": "#E5E5E5",
      "--foreground-light": "#FFFFFF",
  
      "--background-default": "#797C80",
      "--background-secondary": "#41474D",
      "--background-tertiary": "#08090A",
      "--background-quarternary": "##2A2C31",
      "--background-light": "#41474D",
  
      "--primary-default": "#5DFDCB",
      "--primary-dark": "#24B286",
      "--primary-light": "#B2FFE7",
  
      "--error-default": "#EF3E36",
      "--error-dark": "#800600",
      "--error-light": "#FFCECC",

      "--flatlandColor": "#E18B07",
      "--mountainColor": "#30b001",
      "--waterColor": "#9289CF",
      "--waterSubcolor": "#5044ab",
      "--tundraColor": "#019DDE",
      "--volcanicColor": "#E56C6E",
      
      "--resourceKeywordColor": "#EAAD91",
      "--progressionKeywordColor": "#ABB5DC",
      "--specialityKeywordColor": "#5DBDF6",
      "--equipmentKeywordColor": "#83C2A6",
  
      "--background-tertiary-shadow": "0 1px 3px 0 rgba(8, 9, 10, 0.5)"
    }
  };