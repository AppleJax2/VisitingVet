### Markdown To-Do List (Landing Page Redesign)

**Phase 1: Foundational Improvements & Verification**

*   **Layout & Spacing:**
    *   `[ ]` **Consistency Check:** Verify exact padding/margin values across all sections (Hero, Services, How It Works, Testimonials, Join, Footer) for adherence to a potential 4px/8px grid system. Target: `client/src/styles/components/*.css`, `client/src/pages/LandingPage/LandingPage.jsx` (and relevant component styles). Priority: Medium.
    *   `[ ]` **Responsiveness Test:** Thoroughly test layout on various screen sizes (Mobile S/M/L, Tablet, Desktop). Fix any element overlaps, text truncation, or horizontal scrolling. Target: Browser DevTools, `client/src/styles/`. Priority: High.
*   **Visual Hierarchy & Typography:**
    *   `[ ]` **Font Verification:** Confirm consistent use of font families, weights, and sizes declared in CSS match the visual appearance. Target: Browser DevTools, `client/src/styles/base.css` or equivalent theme file. Priority: Low (Appears okay).
*   **Color & Branding:**
    *   `[ ]` **Contrast Check:** Use a contrast checker tool to verify all text/background combinations meet WCAG AA (4.5:1), especially grays (e.g., section subheadings `OUR SERVICES`, testimonial roles `Cattle Farmer`). Target: Browser DevTools, relevant CSS files. Priority: High.
*   **Interactive Elements:**
    *   `[ ]` **State Styling:** Implement/Verify clear `:hover`, `:active`, and `:focus` states for ALL interactive elements (buttons, links, slider controls, form inputs). Focus states MUST be visible. Target: Relevant CSS files (`buttons.css`, `links.css`, `forms.css`, component styles). Priority: High.
*   **Accessibility:**
    *   `[ ]` **Alt Text Audit:** Review ALL `<img>` tags. Ensure meaningful alt text or `alt=""` for decorative images. Target: `client/src/**/*.jsx`. Priority: High.
    *   `[ ]` **Keyboard Navigation:** Test tabbing through the entire page. Ensure logical order and all interactive elements are reachable/operable. Fix any issues. Target: Page structure (`.jsx`), potentially needs tabindex adjustments. Priority: High.
    *   `[ ]` **Focus Visibility:** Confirm visible focus outlines appear during keyboard navigation. Remove any `outline: none;` suppressing them. Target: `client/src/styles/base.css` or reset files. Priority: High.
    *   `[ ]` **ARIA Check (Slider):** Inspect testimonial slider implementation. Ensure appropriate ARIA roles/attributes for controls and slides if it's a custom component. Target: `client/src/components/LandingPage/Testimonials.jsx` (or similar). Priority: Medium.
    *   `[ ]` **Reduced Motion:** Check if testimonial slider animation respects `prefers-reduced-motion` media query. Target: Slider CSS/JS. Priority: Medium.
*   **Content & Copy:**
    *   `[ ]` **Testimonial Authenticity:** Replace placeholder testimonials (if "Sarah Johnson" is placeholder) with genuine client feedback. Include location/pet type if possible. Target: Content source / `client/src/pages/LandingPage/LandingPage.jsx`. Priority: Medium.
    *   `[ ]` **Social Links:** Ensure social media links in the footer point to actual VisitingVet profiles (currently generic domains). Target: `client/src/components/Shared/Footer.jsx` (or similar). Priority: Medium.
    *   `[ ]` **Contact Info:** Verify accuracy of address, phone, email in footer. Target: `client/src/components/Shared/Footer.jsx` (or similar). Priority: Low (Assume correct for now).

**Phase 2: Enhancements & Redesign Ideas (Inspired by Best Practices)**

*   `[ ]` **Hero Section Enhancement:**
    *   Consider adding more specific benefit icons/bullet points directly under the main heading.
    *   Explore using a background video (subtle, relevant, respecting reduced motion) instead of/overlaying the static image.
    *   Refine CTAs: Test alternative wording (e.g., "Search for Mobile Vets", "Become a Visiting Vet").
    *   Target: `client/src/pages/LandingPage/LandingPage.jsx`, relevant CSS. Priority: Medium.
*   `[ ]` **"How It Works" Visuals:**
    *   Enhance the step graphics. Make them more illustrative of the action (Search, Book, Care).
    *   Consider a slightly more engaging layout than simple centered text for each step.
    *   Target: `client/src/pages/LandingPage/LandingPage.jsx`, relevant CSS. Priority: Low.
*   `[ ]` **Service Section Improvement:**
    *   Ensure images are high-quality and directly represent the service.
    *   Potentially add icons alongside text titles for quicker scanning.
    *   Target: `client/src/pages/LandingPage/LandingPage.jsx`, relevant CSS. Priority: Low.
*   `[ ]` **Testimonial Display:**
    *   Improve visual presentation. Consider larger photos, different card layouts.
    *   Ensure slider is fully accessible (keyboard, screen reader friendly).
    *   Target: `client/src/components/LandingPage/Testimonials.jsx`, relevant CSS. Priority: Medium.
*   `[ ]` **Provider Network Section (Join):**
    *   Make benefits for providers clearer (bullet points?).
    *   Potentially add a visual element representing the network/growth.
    *   Target: `client/src/pages/LandingPage/LandingPage.jsx`, relevant CSS. Priority: Medium.
*   `[ ]` **Template Integration:**
    *   Evaluate high-converting templates (like those from Unbounce examples) for structural ideas or component styles that could be adapted (e.g., CTA sections, feature highlights). This is a larger task involving potential restructuring.
    *   Target: Entire landing page structure/styling. Priority: High (Core request). 