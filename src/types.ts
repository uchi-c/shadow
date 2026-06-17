export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  icon: string;
  features: string[];
}

export interface CaseStudyItem {
  id: string;
  title: string;
  client: string;
  location: string;
  challenge: string;
  solution: string;
  results: string;
}

export interface LeadInquiry {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  status: "pending" | "contacted" | "qualified" | "closed" | "archived";
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: number;
}

export interface kbEntry {
  id: string;
  title: string;
  category: "service" | "company" | "case_study" | "faq" | "methodology";
  content: string;
  keywords: string[];
}
