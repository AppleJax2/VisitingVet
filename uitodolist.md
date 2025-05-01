# UI/UX Task List - Visiting Vet Frontend Redesign

This document outlines the tasks required to refactor the Visiting Vet frontend, replacing custom styling with the CoreUI Free React Admin Template (based on Bootstrap 5 and React-Bootstrap) for a consistent, responsive, and maintainable user interface.

## Frontend

**Theme & Structure Implementation:**

*   **done - (P0) Install CoreUI Dependencies:** Add necessary CoreUI packages (`@coreui/react`, `@coreui/coreui`, `@coreui/icons`, `@coreui/icons-react`, potentially others as per template docs) and ensure `react-bootstrap` and `bootstrap` are up-to-date. Modify `package.json`. Dependency for all subsequent tasks.
*   **done - (P0) Integrate CoreUI Base Styles & Layout:** Remove imports for `App.css` and `main.scss` from `App.jsx`. Import the CoreUI base SCSS file (e.g., `src/scss/style.scss` from the template) into `main.jsx` or `App.jsx`. Refactor `App.jsx` to use the CoreUI layout structure (e.g., `DefaultLayout` for authenticated routes, potentially a simpler layout for public routes) including `AppHeader`, `AppSidebar`, `AppFooter`, and the main content container. Requires understanding CoreUI's layout components. Affects `App.jsx`, `main.jsx`. Dependency for component refactoring.
*   **done - (P1) Configure Sidebar Navigation:** Populate the CoreUI sidebar (`_nav.jsx` or similar configuration in the template) with the correct navigation links for each user role (PetOwner, Provider, Clinic, Admin), mirroring the existing dashboard navigation structure identified in `App.jsx`. Requires mapping existing routes to the CoreUI nav configuration format. Affects `_nav.jsx` (or equivalent), potentially needs access to `AuthContext` or user role.
*   **done - (P1) Configure Header:** Customize the CoreUI `AppHeader` component to include relevant user information (e.g., user name, role) and actions (e.g., Profile link, Logout button) using data from `AuthContext`. Affects the CoreUI header component implementation file.

**Component Refactoring (Replace Custom Styles with React-Bootstrap/CoreUI):**

*   **(P0) MANUAL - Refactor Core Pages:** Update `LandingPage`, `AboutUsPage`, `ServicesPage`, `LoginPage`, `RegisterPage`, etc., to use React-Bootstrap layout components (`Container`, `Row`, `Col`) and UI components (`Button`, `Card`, `Form`, `FormControl`, `FormLabel`, etc.) instead of custom elements and classes defined in old CSS (`App.css`, `main.scss`). Remove reliance on custom classes like `.hero-section`, `.btn-primary`, `.card`, etc., where Bootstrap/React-Bootstrap equivalents exist. Affects all files in `src/pages/`. High priority for core usability.
    *   **NOTE:** This task requires significant manual effort due to complex existing custom styles and structures (e.g., `LandingPage.css`, timeline component) that cannot be automatically replaced with Bootstrap utilities without potentially breaking layouts or losing intended design elements. Recommend addressing page by page or component by component.
*   **(P1) Refactor Common Components:** Update shared components like `Header.jsx` (potentially remove if replaced by `AppHeader`), `Footer.jsx` (style with Bootstrap utilities or replace with `AppFooter`), and any custom `Button`, `Modal`, `Card` components to use their `react-bootstrap` counterparts. Ensure consistent styling derived from the CoreUI/Bootstrap theme. Affects files in `src/components/`.
*   **(P1) Refactor Dashboard Components:** Update dashboard-specific components (`PetOwnerDashboard`, `ProviderDashboard`, `ClinicDashboard`, `AdminLayout`, and their sub-components like `MyPetsPage`, `ProviderAppointmentsPage`, `AdminUserListPage`, etc.) to use React-Bootstrap components (`Table`, `Tabs`, `Accordion`, `Pagination`, `Badge`, `Alert`, `Modal`, `Form`) and CoreUI components where appropriate (e.g., `CCard`, `CWidgetStatsF`). Replace custom table styles, form layouts, and UI elements. Affects files in `src/components/Dashboard/`, `src/pages/Admin/`, specific role pages in `src/pages/`.
*   **(P2) Refactor Forms:** Systematically go through all forms (Login, Register, Contact, Add Pet, Profile Edit, etc.) and ensure they are built using `react-bootstrap/Form`, `Form.Group`, `Form.Label`, `Form.Control`, `Form.Text`, `Form.Check`, etc., for consistent appearance, behavior, and accessibility. Affects numerous page and component files.

**Cleanup & Verification:**

*   **(P1) Remove Old Stylesheets:** Delete `App.css`, `index.css` (if redundant), and potentially `styles/main.scss` after confirming all custom styles have been replaced or migrated to the new SCSS structure if necessary for minor theme overrides. Affects `App.jsx`, `main.jsx`, and the filesystem.
*   **(P0) Verify Responsiveness:** Test all pages and components across various screen sizes (desktop, tablet, mobile) to ensure the Bootstrap grid and responsive utilities are functioning correctly and the CoreUI layout adapts as expected. Address any layout issues or overflows. Requires browser testing.
*   **(P0) Verify Functionality:** Perform end-to-end testing for all user roles, ensuring all features (navigation, forms, data display, actions) work correctly after the refactoring. Pay close attention to areas where component logic might have been tied to specific CSS classes. Requires manual testing across the application.
*   **(P1) Accessibility Check:** Perform a basic accessibility check using browser tools or automated checkers to catch any regressions introduced during the refactor (e.g., missing labels, poor contrast defined by the theme, improper ARIA attributes). Address critical issues.

---

**Verification Pledge:**

I will personally verify every completed item by reviewing the code changes and testing the live application from both a developer's perspective (code structure, component usage, style consistency) and an end-user's perspective (visual appearance, responsiveness, usability, functionality across roles) after deployment in the next phase. Success requires both clean code and a seamless user experience. 