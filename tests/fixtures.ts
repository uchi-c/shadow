export interface SectionFixture {
  /** Nav label as shown in the navbar/mobile menu. */
  label: string;
  /** Internal section id used by App.tsx's activeSection state. */
  target: string;
  /** A heading/text fragment expected to appear once the section has mounted. */
  expectText: string;
}

// Mirrors the navItems list in src/components/Navbar.tsx. Kept in one place so
// navigation, accessibility, and responsive-overflow tests all exercise the
// exact same set of pages instead of drifting out of sync with each other.
export const SECTIONS: SectionFixture[] = [
  { label: "Home", target: "home", expectText: "We start in the" },
  { label: "Services", target: "services", expectText: "Comprehensive services for security" },
  { label: "Products", target: "products", expectText: "Products in the making" },
  { label: "Academy", target: "academy", expectText: "Training Africa" },
  { label: "Tools", target: "tools", expectText: "Test your defenses" },
  { label: "Case Studies", target: "case", expectText: "Real-world defense outcomes" },
  { label: "About", target: "about", expectText: "Youth-led cybersecurity force" },
  { label: "Quote", target: "quote", expectText: "Book a secure consultation" }
];
