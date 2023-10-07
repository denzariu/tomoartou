import { MD2Theme, configureFonts } from "react-native-paper";
import { Fonts } from "react-native-paper/lib/typescript/types";
import color from 'color';


const palette = {
  black: '#000',
  white: '#fff',

  purple: '#614F89',
  pink: '#FEA4B9',

  almostWhite: "#f0edf6",
  darkPurple: "#3e2465",
}

export const Theme = {
  colors: {
    background: palette.almostWhite,
    foreground: palette.black,

    primary: palette.purple,
    secondary: palette.pink,

    tabActive: palette.almostWhite,
    tabAccent: palette.darkPurple,
    tabBackgound: palette.purple
  },

  spacing: {
    s: 8,
    m: 16,
    page: 20,
    l: 24,
    xl: 40,
  },

  fontSize: {
    xs: 11,
    s: 12,
    m: 14,
    l: 16,
    xl: 20,
  },

  textVariants: {
    header: {
      fontFamily: 'Raleway',
      fontSize: 36,
      fontWeight: 'bold',
    },
    body: {
      fontFamily: 'Merriweather',
      fontSize: 16,
    },
  }
};

export const DarkTheme = {
  ...Theme,
  colors: {
    ...Theme.colors,

    background: palette.black,
    foreground: palette.almostWhite,

    primary: palette.purple,
    secondary: palette.pink,
    
    tabActive: palette.almostWhite,
    tabAccent: palette.darkPurple,
    tabBackgound: palette.purple
  },
  
};

// export const TabsThemeLight: MD2Theme = {
//   dark: false,
//   roundness: 4,
//   version: 2,
//   isV3: false,
//   colors: {
//     primary: '#6200ee',
//     accent: '#03dac4',
//     background: '#f6f6f6',
//     surface: palette.white,
//     error: '#B00020',
//     text: palette.black,
//     onSurface: '#000000',
//     disabled: color(palette.black).alpha(0.26).rgb().string(),
//     placeholder: color(palette.black).alpha(0.54).rgb().string(),
//     backdrop: color(palette.black).alpha(0.5).rgb().string(),
//     notification: palette.pink,
//     tooltip: 'rgba(28, 27, 31, 1)',
//   },
//   fonts: configureFonts({ isV3: false }) as Fonts,
//   animation: {
//     scale: 1.0,
//   },
// };