// VisitingVet Theme
// A nature-inspired warm color palette

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
    // Other colors
    error: '#D32F2F',
    warning: '#F9A825',
    success: '#388E3C',
    info: '#0288D1',
  },
  // Font families
  fonts: {
    heading: "'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    body: "'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
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
  },
  // Border radius
  borderRadius: {
    sm: '3px',
    md: '6px',
    lg: '12px',
    xl: '24px',
    round: '50%',
  },
};

export default theme; 