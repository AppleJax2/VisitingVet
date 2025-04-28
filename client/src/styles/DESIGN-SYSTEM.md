# VisitingVet Design System

This document outlines the design system for VisitingVet's web application. It provides a comprehensive guide to the UI components, styles, and patterns used throughout the application.

## Table of Contents

1. [Colors](#colors)
2. [Typography](#typography)
3. [Spacing](#spacing)
4. [Components](#components)
5. [Utilities](#utilities)
6. [Breakpoints](#breakpoints)
7. [Accessibility](#accessibility)
8. [Best Practices](#best-practices)

## Colors

### Brand Colors

Our primary brand color is a sage green representing nature, health, and growth. Our secondary color is a warm terracotta that provides a complementary accent.

- **Primary**: Sage Green `#577E46` 
  - Light: `#6B9256`
  - Dark: `#3D5D2F`
- **Secondary**: Warm Terracotta `#AC510A`
  - Light: `#C76420`
  - Dark: `#7F3C06`

### Accent Colors

- **Gold**: `#EDB75A`
- **Dark Green**: `#124438`
- **Light Green**: `#A8B99F`

### Functional Colors

- **Success**: `#388E3C`
- **Info**: `#0288D1`
- **Warning**: `#F9A825`
- **Danger**: `#D32F2F`

### Background Colors

- **Light (Cream)**: `#F6E6BB`
- **White**: `#FFFFFF`
- **Tan**: `#F0DCA0`
- **Dark (Deep Forest Green)**: `#124438`

### Text Colors

- **Primary**: `#333333`
- **Secondary**: `#555555`
- **Light**: `#777777`
- **White**: `#FFFFFF`

### Neutral Colors

We use a 9-point neutral color scale from light to dark:

- 100: `#f8f9fa`
- 200: `#e9ecef`
- 300: `#dee2e6`
- 400: `#ced4da`
- 500: `#adb5bd`
- 600: `#6c757d`
- 700: `#495057`
- 800: `#343a40`
- 900: `#212529`

## Typography

### Font Families

- **Headings**: Montserrat with system font fallbacks
- **Body**: Open Sans with system font fallbacks
- **Monospace**: SFMono-Regular, Menlo, Monaco, Consolas with fallbacks

### Font Sizes

- **xs**: 0.75rem (12px)
- **sm**: 0.875rem (14px)
- **base**: 1rem (16px)
- **md**: 1.125rem (18px)
- **lg**: 1.25rem (20px)
- **xl**: 1.5rem (24px)
- **2xl**: 1.875rem (30px)
- **3xl**: 2.25rem (36px)
- **4xl**: 3rem (48px)
- **5xl**: 3.75rem (60px)

### Font Weights

- **Light**: 300
- **Normal**: 400
- **Medium**: 500
- **Semibold**: 600
- **Bold**: 700

### Line Heights

- **Tight**: 1.25
- **Base**: 1.5
- **Loose**: 1.75

## Spacing

We use a consistent spacing scale throughout the application. The base unit is 1rem (16px).

- **0**: 0
- **1**: 0.25rem (4px)
- **2**: 0.5rem (8px)
- **3**: 0.75rem (12px)
- **4**: 1rem (16px)
- **5**: 1.5rem (24px)
- **6**: 2rem (32px)
- **7**: 2.5rem (40px)
- **8**: 3rem (48px)
- **9**: 4rem (64px)
- **10**: 5rem (80px)

## Components

### Buttons

We offer several button variants to serve different purposes:

- **Primary**: For primary actions
- **Secondary**: For secondary actions
- **Outline Primary**: For less emphasized primary actions
- **Outline Secondary**: For less emphasized secondary actions
- **Text**: For the least emphasized actions

Button sizes:
- **Large**: For prominent actions
- **Default**: For most actions
- **Small**: For compact UIs
- **Extra Small**: For very limited space

### Form Elements

Form controls follow a consistent style:
- Clear labels placed above inputs
- Consistent padding and height
- Clear focus and error states
- Support for helper text
- Consistent validation styling

### Cards

Cards are used to group related content:
- Consistent padding and spacing
- Optional header and footer sections
- Support for images
- Various color themes

### Modals

Modals provide focused interfaces for specific tasks:
- Standard header, body, and footer structure
- Multiple size options
- Color variants for different contexts
- Responsive behavior

## Utilities

The design system includes utility classes for common styling needs:

- **Text**: Alignment, size, weight, etc.
- **Colors**: Text and background colors
- **Spacing**: Margin and padding utilities
- **Borders**: Width, radius, color
- **Display**: Visibility and display properties
- **Flex**: Flexbox utilities
- **Position**: Positioning utilities
- **Shadows**: Box shadow utilities

## Breakpoints

Responsive design is built on these standard breakpoints:

- **xs**: 0
- **sm**: 576px
- **md**: 768px
- **lg**: 992px
- **xl**: 1200px
- **xxl**: 1400px

## Accessibility

Our design system prioritizes accessibility:

- All color combinations meet WCAG 2.1 AA contrast requirements
- Interactive elements have clear focus states
- Form elements have proper labels and ARIA attributes
- Semantic HTML is used throughout the application

## Best Practices

When implementing the design system:

1. **Use variables**: Always use design tokens rather than hardcoded values
2. **Follow patterns**: Use established component patterns for consistency
3. **Responsive first**: Consider mobile and responsive behavior from the start
4. **Accessibility**: Ensure all implementations maintain accessibility
5. **Consistency**: Maintain visual consistency by using the established patterns

## Implementation

The design system is implemented in SCSS with the following structure:

- `design-system.scss`: Core design tokens
- `_variables.scss`: Bootstrap variable overrides
- `utility-classes.scss`: Utility classes
- `components/`: Component-specific styles
  - `buttons.scss`
  - `forms.scss`
  - `cards.scss`
  - `modals.scss`

CSS variables are exposed at the `:root` level for use throughout the application. 