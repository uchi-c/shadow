import { useEffect } from "react";

interface SEOMetadata {
  title: string;
  description: string;
}

const SECTION_SEO_MAP: Record<string, SEOMetadata> = {
  home: {
    title: "Shadow Root Security Technologies | Lusaka, Zambia Cybersecurity Force",
    description: "Shadow Root Security Technologies is Zambia's leading youth-led cybersecurity & secure React developer in Lusaka. We provide cyber defense audits, mobile wallet simulations, NGO hardening, and high-security web architectures.",
  },
  services: {
    title: "Cybersecurity Capabilities & Phishing Audits | Shadow Root Zambia",
    description: "Explore our defense-grade capabilities in Lusaka, Zambia: credential phishing drills, mobile money replicas, database security audits (OWASP), and zero-trust React web engineering.",
  },
  about: {
    title: "Founder Uchi Chinyama & Cyber Mission | Shadow Root Zambia",
    description: "Discover our youth-led security force scaling from Lusaka. Founded by Uchi Chinyama, Shadow Root provides ethical security audits for donor groups, NGOs, and Zambian startups.",
  },
  case: {
    title: "Completed Cybersecurity Missions & Audits | Shadow Root Zambia",
    description: "Review case studies of our completed cyber missions: secure seed distribution databases, mobile payment simulations, and educational digital trust infrastructures.",
  },
  quote: {
    title: "Request a Cyber Defense Audit & Consultancy | Shadow Root",
    description: "Get a tactical security review quote in Zambia. Partner with CEO Uchi Chinyama's team to scan inputs, perform phishing simulation testing, and harden your servers.",
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
