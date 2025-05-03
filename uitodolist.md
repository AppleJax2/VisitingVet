# UI Todo List - VisitingVet Landing Page Redesign

This document outlines the frontend tasks required to redesign the VisitingVet landing page, transitioning it from its current basic implementation to a production-quality experience aligned with the CoreUI v5 / Bootstrap 5 framework used elsewhere in the application.

## Frontend

done **Framework & Component Migration:** The most critical task is migrating the landing page from `react-bootstrap` components and its standalone CSS (`LandingPage.css`) to utilize the project's established `CoreUI v5` component library and global SCSS (`style.scss`). This involves replacing components like `Container`, `Row`, `Col`, `Button`, `Card`, `Badge`, `Carousel`, etc., with their CoreUI counterparts (e.g., `CContainer`, `CRow`, `CCol`, `CButton`, `CCard`, `CBadge`, `CCarousel`). This ensures visual consistency and leverages the existing theme.
*   Problem: Landing page uses `react-bootstrap` and separate CSS, contradicting `INPUT_FOCUS` and causing inconsistency.
*   Files: `client/src/pages/LandingPage.jsx`, `client/src/styles/LandingPage.css`, `client/src/scss/style.scss`.
*   Dependency: Understanding of CoreUI components and SCSS theme structure.
*   Priority: P0 (Must-do).

done **Styling Integration:** Eliminate `client/src/styles/LandingPage.css`. All landing page-specific styling should be achieved using CoreUI components, Bootstrap utility classes integrated via CoreUI, or extensions/overrides within the main `client/src/scss/style.scss` file, leveraging existing CoreUI SCSS variables (`--cui-*`). Remove duplicated utility class definitions from the old CSS file.
*   Problem: Separate, duplicated, and inconsistent styling approach.
*   Files: `client/src/styles/LandingPage.css`, `client/src/scss/style.scss`.
*   Dependency: Completion of component migration.
*   Priority: P0 (Must-do).

done **Content & Visual Enhancement:** Replace all placeholder images (`placehold.co`) with high-quality, relevant, royalty-free images (WebP format preferred, with JPG/PNG fallbacks). Source images for the hero section, service explanations, and potentially provider sections or testimonials. Ensure all images have appropriate `alt` text. Integrate a consistent icon set (e.g., CoreUI Icons via `<CIcon>`) instead of `react-bootstrap-icons` or Unicode characters for buttons, feature lists, etc.
*   Problem: Placeholder images and inconsistent icons make the page look unfinished. Missing alt text impacts accessibility.
*   Files: `client/src/pages/LandingPage.jsx`, potentially `client/src/assets/images/`.
*   Dependency: Access to royalty-free image sources; decision on icon library.
*   Priority: P0 (Must-do).

done **Layout & Structure Refinement:** Enhance the page structure beyond the current basic sections. Implement sections like "How It Works," "Services Offered," and potentially "Testimonials" or a stronger "For Providers" callout, using CoreUI layout components (`CContainer`, `CRow`, `CCol`, `CCard`). Ensure logical content flow and visual appeal. Add a `CFooter` component consistent with the main application layout.
*   Problem: Page structure is too basic and lacks visual engagement. No footer.
*   Files: `client/src/pages/LandingPage.jsx`, potentially `client/src/layout/DefaultLayout.jsx` (for footer consistency).
*   Dependency: Component migration.
*   Priority: P1 (Should-do).

done **Typography & Color Consistency:** Ensure all text elements utilize the typography scale and fonts defined in `style.scss` (likely inherited via CoreUI variables). Apply the application's color theme consistently using CoreUI variables (`--cui-primary`, `--cui-text-color`, etc.) for text, backgrounds, and interactive elements like buttons and links. Improve text contrast, especially in the hero section.
*   Problem: Basic typography and minimal color usage; potential contrast issues.
*   Files: `client/src/pages/LandingPage.jsx`, `client/src/scss/style.scss`.
*   Dependency: Styling integration.
*   Priority: P1 (Should-do).

done **Accessibility Improvements:** Verify and ensure WCAG 2.1 AA compliance. Check color contrast ratios, ensure proper heading structure (H1-H6), confirm keyboard navigation works flawlessly with visible focus indicators (leveraging CoreUI defaults), and add `alt` text for all images. Ensure any interactive components (like carousels or accordions if added) are fully accessible.
*   Problem: Current accessibility is likely basic; requires explicit verification and enhancement, especially after adding new content/images.
*   Files: `client/src/pages/LandingPage.jsx`.
*   Dependency: Content & Visual Enhancement, Layout Refinement. Requires accessibility testing tools/knowledge.
*   Priority: P0 (Must-do).

done **Polish & Performance:** Consider adding subtle animations or transitions (using CoreUI utilities or a lightweight library) to enhance user experience without impacting performance. Ensure newly added images are optimized for the web. Verify overall page load speed remains fast after changes. Ensure responsiveness across various screen sizes is robust.
*   Problem: Current page is static; new assets must be optimized.
*   Files: `client/src/pages/LandingPage.jsx`, `client/src/scss/style.scss`, image assets.
*   Dependency: Completion of other visual tasks. Requires performance testing tools.
*   Priority: P2 (Nice-to-have).

---

**Verification Pledge:** I will personally verify every completed item in Prompt 2. Success will be judged by confirming:
1.  The landing page exclusively uses CoreUI components and integrates with the global `style.scss`.
2.  All placeholder content is replaced with appropriate media and icons.
3.  The design looks professional, modern, and visually engaging.
4.  The page is fully responsive and accessible (WCAG AA).
5.  The implementation aligns with the Future-State Vision.
6.  Verification will involve code inspection, browser testing (various viewports), accessibility checks, and comparison against the `INPUT_FOCUS` requirements. 