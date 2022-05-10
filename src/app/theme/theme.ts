export interface Theme {
    name: string;
    properties: any;
  }
  
  export const white: Theme = {
    name: "white",
    properties: {
      "--foreground-default": "#000000",
      "--foreground-secondary": "#1B1B1B",
      "--foreground-tertiary": "#262626",
      "--foreground-quaternary": "#2F2F2F",
      "--foreground-light": "#000000",
  
      "--background-default": "#FCFCFC",
      "--background-secondary": "#FFFFFF",
      "--background-tertiary": "#C4C4C4",
      "--background-light": "#FFFFFF",
  
      "--primary-default": "#5DFDCB",
      "--primary-dark": "#24B286",
      "--primary-light": "#B2FFE7",
  
      "--error-default": "#EF3E36",
      "--error-dark": "#800600",
      "--error-light": "#FFCECC",
  
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
      "--background-light": "#FFFFFF",
  
      "--primary-default": "#5DFDCB",
      "--primary-dark": "#24B286",
      "--primary-light": "#B2FFE7",
  
      "--error-default": "#EF3E36",
      "--error-dark": "#800600",
      "--error-light": "#FFCECC",
  
      "--background-tertiary-shadow": "0 1px 3px 0 rgba(92, 125, 153, 0.5)"
    }
  };

  export const twilight: Theme = {
    name: "twilight",
    properties: {
      "--foreground-default": "#ED8B42",
      "--foreground-secondary": "#D65A00",
      "--foreground-tertiary": "#FF8023",
      "--foreground-quaternary": "#FFAA20",
      "--foreground-light": "#FF8F3D",
  
      "--background-default": "#5D0274",
      "--background-secondary": "#210129",
      "--background-tertiary": "#14001A",
      "--background-light": "#72028D",
  
      "--primary-default": "#5DFDCB",
      "--primary-dark": "#24B286",
      "--primary-light": "#B2FFE7",
  
      "--error-default": "#EF3E36",
      "--error-dark": "#800600",
      "--error-light": "#FFCECC",
  
      "--background-tertiary-shadow": "0 1px 3px 0 rgba(92, 125, 153, 0.5)"
    }
  };
  
  export const night: Theme = {
    name: "night",
    properties: {
      "--foreground-default": "#A3B9CC",
      "--foreground-secondary": "#5C7D99",
      "--foreground-tertiary": "#F4FAFF",
      "--foreground-quaternary": "#E5E5E5",
      "--foreground-light": "#FFFFFF",
  
      "--background-default": "#797C80",
      "--background-secondary": "#41474D",
      "--background-tertiary": "#08090A",
      "--background-light": "#41474D",
  
      "--primary-default": "#5DFDCB",
      "--primary-dark": "#24B286",
      "--primary-light": "#B2FFE7",
  
      "--error-default": "#EF3E36",
      "--error-dark": "#800600",
      "--error-light": "#FFCECC",
  
      "--background-tertiary-shadow": "0 1px 3px 0 rgba(8, 9, 10, 0.5)"
    }
  };