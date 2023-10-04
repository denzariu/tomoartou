

const palette = {
  black: '#000',
  white: '#fff',

  purple: '#614F89',
  pink: '#FEA4B9'
}

export const Theme = {
  colors: {
    black: palette.black,
    white: palette.white,

    primary: palette.purple,
    secondary: palette.pink
  },

  spacing: {
    s: 8,
    m: 16,
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

    black: palette.white,
    white: palette.black,

    primary: palette.purple,
    secondary: palette.pink
  }
};

