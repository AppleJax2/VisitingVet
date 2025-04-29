// VisitingVet Theme
// A nature-inspired warm color palette

// Helper function to convert hex to RGB
const hexToRgb = (hex) => {
  // Remove the hash if it exists
  hex = hex.replace('#', '');
  
  // Parse the hex values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Return RGB values as object
  return { r, g, b };
};

const theme = {
  colors: {
    // Primary colors
    primary: {
      main: '#577E46', // Sage Green
      light: '#6B9256',
      dark: '#3D5D2F',
    },
    secondary: {
      main: '#AC510A', // Warm Terracotta
      light: '#C76420',
      dark: '#7F3C06',
    },
    // Background colors
    background: {
      light: '#F6E6BB', // Cream
      white: '#FFFFFF',
      tan: '#F0DCA0',
      dark: '#124438', // Deep Forest Green
    },
    // Accent colors
    accent: {
      gold: '#EDB75A',
      darkGreen: '#124438',
      lightGreen: '#A8B99F',
    },
    // Text colors
    text: {
      primary: '#333333',
      secondary: '#555555',
      light: '#777777',
      white: '#FFFFFF',
    },
    // Functional colors
    error: '#D32F2F',
    warning: '#F9A825',
    success: '#388E3C',
    info: '#0288D1',
    // Neutral colors (added for consistency)
    neutral: {
      100: '#f8f9fa',
      200: '#e9ecef',
      300: '#dee2e6',
      400: '#ced4da',
      500: '#adb5bd',
      600: '#6c757d',
      700: '#495057',
      800: '#343a40',
      900: '#212529',
    },
  },
  // Font families
  fonts: {
    heading: "'Ranade', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    body: "'Ranade', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
  // Typography
  typography: {
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      md: '1.125rem',   // 18px
      lg: '1.25rem',    // 20px
      xl: '1.5rem',     // 24px
      '2xl': '1.875rem',  // 30px
      '3xl': '2.25rem',   // 36px
      '4xl': '3rem',      // 48px
      '5xl': '3.75rem',   // 60px
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.25,
      base: 1.5,
      loose: 1.75,
    },
  },
  // Spacing - using 0.5rem (8px) increments as base
  spacing: {
    0: '0',
    1: '0.25rem',  // 4px
    2: '0.5rem',   // 8px
    3: '0.75rem',  // 12px
    4: '1rem',     // 16px
    5: '1.5rem',   // 24px
    6: '2rem',     // 32px
    7: '2.5rem',   // 40px
    8: '3rem',     // 48px
    9: '4rem',     // 64px
    10: '5rem',    // 80px
    14: '5rem',    // 80px - for modal calculation consistency
  },
  // Breakpoints for responsive design
  breakpoints: {
    xs: '0px',
    sm: '576px',
    md: '768px',
    lg: '992px',
    xl: '1200px',
    xxl: '1400px',
  },
  // Shadows
  shadows: {
    sm: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
    md: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
    lg: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)',
    xl: '0 20px 25px rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.04)',
  },
  // Border radius
  borderRadius: {
    sm: '3px',
    md: '6px',
    lg: '12px',
    xl: '24px',
    round: '50%',
    pill: '9999px',
  },
  // Transitions
  transitions: {
    base: 'all 0.2s ease-in-out',
    fast: 'all 0.15s ease-in-out',
    slow: 'all 0.3s ease-in-out',
  },
  // Z-index
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },
  // Opacity values
  opacity: {
    0: 0,
    25: 0.25,
    50: 0.5,
    75: 0.75,
    100: 1,
  },
};

// Add RGB values for all colors
// Primary colors
const primaryMainRgb = hexToRgb(theme.colors.primary.main);
const primaryLightRgb = hexToRgb(theme.colors.primary.light);
const primaryDarkRgb = hexToRgb(theme.colors.primary.dark);

// Secondary colors
const secondaryMainRgb = hexToRgb(theme.colors.secondary.main);
const secondaryLightRgb = hexToRgb(theme.colors.secondary.light);
const secondaryDarkRgb = hexToRgb(theme.colors.secondary.dark);

// Accent colors
const accentGoldRgb = hexToRgb(theme.colors.accent.gold);
const accentDarkGreenRgb = hexToRgb(theme.colors.accent.darkGreen);
const accentLightGreenRgb = hexToRgb(theme.colors.accent.lightGreen);

// Functional colors
const errorRgb = hexToRgb(theme.colors.error);
const warningRgb = hexToRgb(theme.colors.warning);
const successRgb = hexToRgb(theme.colors.success);
const infoRgb = hexToRgb(theme.colors.info);

// Background colors
const backgroundLightRgb = hexToRgb(theme.colors.background.light);
const backgroundTanRgb = hexToRgb(theme.colors.background.tan);
const backgroundDarkRgb = hexToRgb(theme.colors.background.dark);

// Function to generate CSS variables for the theme
const generateCSSVariables = () => {
  // Create CSS variables string
  let cssVars = ':root {\n';
  
  // Colors
  cssVars += '  /* Primary colors */\n';
  cssVars += `  --primary-main: ${theme.colors.primary.main};\n`;
  cssVars += `  --primary-main-rgb: ${primaryMainRgb.r}, ${primaryMainRgb.g}, ${primaryMainRgb.b};\n`;
  cssVars += `  --primary-light: ${theme.colors.primary.light};\n`;
  cssVars += `  --primary-light-rgb: ${primaryLightRgb.r}, ${primaryLightRgb.g}, ${primaryLightRgb.b};\n`;
  cssVars += `  --primary-dark: ${theme.colors.primary.dark};\n`;
  cssVars += `  --primary-dark-rgb: ${primaryDarkRgb.r}, ${primaryDarkRgb.g}, ${primaryDarkRgb.b};\n\n`;
  
  cssVars += '  /* Secondary colors */\n';
  cssVars += `  --secondary-main: ${theme.colors.secondary.main};\n`;
  cssVars += `  --secondary-main-rgb: ${secondaryMainRgb.r}, ${secondaryMainRgb.g}, ${secondaryMainRgb.b};\n`;
  cssVars += `  --secondary-light: ${theme.colors.secondary.light};\n`;
  cssVars += `  --secondary-light-rgb: ${secondaryLightRgb.r}, ${secondaryLightRgb.g}, ${secondaryLightRgb.b};\n`;
  cssVars += `  --secondary-dark: ${theme.colors.secondary.dark};\n`;
  cssVars += `  --secondary-dark-rgb: ${secondaryDarkRgb.r}, ${secondaryDarkRgb.g}, ${secondaryDarkRgb.b};\n\n`;
  
  cssVars += '  /* Background colors */\n';
  cssVars += `  --background-light: ${theme.colors.background.light};\n`;
  cssVars += `  --background-light-rgb: ${backgroundLightRgb.r}, ${backgroundLightRgb.g}, ${backgroundLightRgb.b};\n`;
  cssVars += `  --background-white: ${theme.colors.background.white};\n`;
  cssVars += `  --background-tan: ${theme.colors.background.tan};\n`;
  cssVars += `  --background-tan-rgb: ${backgroundTanRgb.r}, ${backgroundTanRgb.g}, ${backgroundTanRgb.b};\n`;
  cssVars += `  --background-dark: ${theme.colors.background.dark};\n`;
  cssVars += `  --background-dark-rgb: ${backgroundDarkRgb.r}, ${backgroundDarkRgb.g}, ${backgroundDarkRgb.b};\n\n`;
  
  cssVars += '  /* Accent colors */\n';
  cssVars += `  --accent-gold: ${theme.colors.accent.gold};\n`;
  cssVars += `  --accent-gold-rgb: ${accentGoldRgb.r}, ${accentGoldRgb.g}, ${accentGoldRgb.b};\n`;
  cssVars += `  --accent-dark-green: ${theme.colors.accent.darkGreen};\n`;
  cssVars += `  --accent-dark-green-rgb: ${accentDarkGreenRgb.r}, ${accentDarkGreenRgb.g}, ${accentDarkGreenRgb.b};\n`;
  cssVars += `  --accent-light-green: ${theme.colors.accent.lightGreen};\n`;
  cssVars += `  --accent-light-green-rgb: ${accentLightGreenRgb.r}, ${accentLightGreenRgb.g}, ${accentLightGreenRgb.b};\n\n`;
  
  cssVars += '  /* Text colors */\n';
  cssVars += `  --text-primary: ${theme.colors.text.primary};\n`;
  cssVars += `  --text-secondary: ${theme.colors.text.secondary};\n`;
  cssVars += `  --text-light: ${theme.colors.text.light};\n`;
  cssVars += `  --text-white: ${theme.colors.text.white};\n\n`;
  
  cssVars += '  /* Functional colors */\n';
  cssVars += `  --color-error: ${theme.colors.error};\n`;
  cssVars += `  --color-error-rgb: ${errorRgb.r}, ${errorRgb.g}, ${errorRgb.b};\n`;
  cssVars += `  --color-warning: ${theme.colors.warning};\n`;
  cssVars += `  --color-warning-rgb: ${warningRgb.r}, ${warningRgb.g}, ${warningRgb.b};\n`;
  cssVars += `  --color-success: ${theme.colors.success};\n`;
  cssVars += `  --color-success-rgb: ${successRgb.r}, ${successRgb.g}, ${successRgb.b};\n`;
  cssVars += `  --color-info: ${theme.colors.info};\n`;
  cssVars += `  --color-info-rgb: ${infoRgb.r}, ${infoRgb.g}, ${infoRgb.b};\n\n`;
  
  cssVars += '  /* Neutral colors */\n';
  Object.entries(theme.colors.neutral).forEach(([key, value]) => {
    cssVars += `  --neutral-${key}: ${value};\n`;
  });
  cssVars += '\n';
  
  // Typography
  cssVars += '  /* Font families */\n';
  cssVars += `  --heading-font: ${theme.fonts.heading};\n`;
  cssVars += `  --body-font: ${theme.fonts.body};\n`;
  cssVars += `  --mono-font: ${theme.fonts.mono};\n\n`;
  
  cssVars += '  /* Font sizes */\n';
  Object.entries(theme.typography.fontSize).forEach(([key, value]) => {
    cssVars += `  --font-size-${key}: ${value};\n`;
  });
  cssVars += '\n';
  
  cssVars += '  /* Font weights */\n';
  Object.entries(theme.typography.fontWeight).forEach(([key, value]) => {
    cssVars += `  --font-weight-${key}: ${value};\n`;
  });
  cssVars += '\n';
  
  cssVars += '  /* Line heights */\n';
  Object.entries(theme.typography.lineHeight).forEach(([key, value]) => {
    cssVars += `  --line-height-${key}: ${value};\n`;
  });
  cssVars += '\n';
  
  // Spacing
  cssVars += '  /* Spacing */\n';
  Object.entries(theme.spacing).forEach(([key, value]) => {
    cssVars += `  --spacing-${key}: ${value};\n`;
  });
  cssVars += '\n';
  
  // Border radius
  cssVars += '  /* Border radius */\n';
  Object.entries(theme.borderRadius).forEach(([key, value]) => {
    cssVars += `  --border-radius-${key}: ${value};\n`;
  });
  cssVars += '\n';
  
  // Shadows
  cssVars += '  /* Shadows */\n';
  Object.entries(theme.shadows).forEach(([key, value]) => {
    cssVars += `  --shadow-${key}: ${value};\n`;
  });
  cssVars += '\n';
  
  // Transitions
  cssVars += '  /* Transitions */\n';
  Object.entries(theme.transitions).forEach(([key, value]) => {
    cssVars += `  --transition-${key}: ${value};\n`;
  });
  cssVars += '\n';
  
  // Z-index
  cssVars += '  /* Z-index */\n';
  Object.entries(theme.zIndex).forEach(([key, value]) => {
    cssVars += `  --z-index-${key}: ${value};\n`;
  });
  cssVars += '\n';
  
  // Opacity
  cssVars += '  /* Opacity */\n';
  Object.entries(theme.opacity).forEach(([key, value]) => {
    cssVars += `  --opacity-${key}: ${value};\n`;
  });
  
  cssVars += '}';
  
  return cssVars;
};

// Export the CSS variables string for use in other files
theme.cssVariables = generateCSSVariables();

export default theme; 