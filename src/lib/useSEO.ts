import { useEffect } from "react";

interface SEOMetadata {
  title: string;
  description: string;
}

const SECTION_SEO_MAP: Record<string, SEOMetadata> = {
  home: {
    title: "Shadow Root Security Technologies | Building Digital Trust for Institutions",
    description: "Shadow Root is a Zambia-based digital trust and secure infrastructure company building practical AI, secure systems, and institutional resilience tools for government, NGOs, schools, and universities across Africa.",
  },
  services: {
    title: "Phishing Simulation, AI Workflow Automation & Secure Systems | Shadow Root",
    description: "Structured services for institutions: phishing simulation and user-risk testing, AI workflow automation, secure systems development, and strategic digital trust advisory — in Lusaka, Zambia and across Africa.",
  },
  products: {
    title: "URUU & the Shadow Root Ecosystem | Shadow Root Security Technologies",
    description: "URUU is Shadow Root's flagship secure workflow and intelligence platform, incubated for institutional reporting, visibility, and trust-sensitive processes — alongside Kuma AI and other tools in active development.",
  },
  academy: {
    title: "Shadow Root Academy | Cyber Skills Training for Africa",
    description: "Structured, hands-on cybersecurity learning tracks for schools, universities, and institutions across Southern Africa — from fundamentals to job-ready defensive skills.",
  },
  tools: {
    title: "Free Security Tools | Shadow Root Security Technologies",
    description: "Free, in-browser security tools from Shadow Root: password strength analysis, phishing email detection, a security maturity assessment, and a live CVE explorer.",
  },
  about: {
    title: "Founder & Lead Strategist Uchi Chinyama | Shadow Root Zambia",
    description: "Shadow Root is a founder-led digital trust and secure infrastructure company based in Lusaka, Zambia, led by Founder & Lead Strategist Uchi Chinyama, with structured functional roles across product, AI, governance, and research.",
  },
  case: {
    title: "Case Studies: Digital Trust & Secure Systems Work | Shadow Root Zambia",
    description: "Review completed engagements where Shadow Root strengthened digital trust, workflows, and secure systems for institutions, NGOs, and schools in Zambia.",
  },
  quote: {
    title: "Request a Consultation | Shadow Root Security Technologies",
    description: "Get a tailored proposal from Shadow Root: phishing simulation, AI workflow automation, secure systems development, or strategic digital trust advisory for your institution.",
  },
};

export default function useSEO(activeSection: string) {
  useEffect(() => {
    const seo = SECTION_SEO_MAP[activeSection] || SECTION_SEO_MAP.home;

    // Set document title
    document.title = seo.title;

    // Find or create description meta tag
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement("meta");
      metaDescription.setAttribute("name", "description");
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute("content", seo.description);
  }, [activeSection]);
}
