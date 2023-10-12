import { MD2Theme, configureFonts } from "react-native-paper";
import { Fonts } from "react-native-paper/lib/typescript/types";
import color from 'color';


const palette = {
  black: '#000',
  white: '#fff',

  
  almostWhite: "#f0edf6",
  darkPurple: "#3e2465",
  purple: '#614F89',
  pink: '#FEA4B9',

  new_age: '#D7CED1',
  starry_night_blue: '#334075',
  conch_shell: '#E6BCAAC',
  raspberry_blush: '#D85F56',
  north_sea_green: '#246D74'

}

export const Theme = {
  colors: {
    background: palette.almostWhite,
    foreground: palette.white,

    primary: palette.purple,
    secondary: palette.pink,

    tabActive: palette.almostWhite,
    tabAccent: palette.darkPurple,
    tabBackgound: palette.purple,
    tabNotification: palette.pink,
    
    loadingIndicator: palette.almostWhite
  },

  spacing: {
    s: 8,
    m: 16,
    page: 20,
    l: 24,
    xl: 32,
    xxl: 40,
  },

  fontSize: {
    xs: 11,
    s: 12,
    m: 14,
    l: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32
  },

  fontFamily: {
    butler: 'butler_regular',
    butler_bold: 'butler_bold',
    butler_stencil: 'butler_bold_stencil',
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
  },
};

export const DarkTheme = {
  ...Theme,
  colors: {
    ...Theme.colors,

    background: palette.black,
    foreground: palette.new_age,

    primary: palette.starry_night_blue,
    secondary: palette.purple,
    
    tabActive: palette.new_age,
    tabAccent: palette.starry_night_blue,
    tabBackgound: palette.black,
    tabNotification: palette.new_age,
    
    loadingIndicator: palette.new_age //"New Age" replaced the "Almost White"
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