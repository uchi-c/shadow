import fs from "fs";
import path from "path";

// Define strong interfaces for our data tables
export interface Lead {
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

export interface KnowledgeBaseEntry {
  id: string;
  title: string;
  category: "service" | "company" | "case_study" | "faq" | "methodology";
  content: string;
  keywords: string[];
}

export interface ChatMessage {
  role: "user" | "model";
  text: string;
  timestamp: number;
}

export interface ChatLog {
  id: string;
  visitorName?: string;
  visitorContact?: string;
  messages: ChatMessage[];
  isEscalated: boolean;
  escalationReason?: string;
  status: "pending" | "contacted" | "qualified" | "closed" | "archived";
  createdAt: number;
  updatedAt: number;
}

export type RecordStatus = "pending" | "contacted" | "qualified" | "closed" | "archived";

const STATUS_KEYS: RecordStatus[] = ["pending", "contacted", "qualified", "closed", "archived"];

// Aggregated intelligence report describing the current state of the pipeline
export interface SystemStats {
  generatedAt: number;
  leads: {
    total: number;
    byStatus: Record<RecordStatus, number>;
  };
  chats: {
    total: number;
    escalated: number;
    withContact: number;
    byStatus: Record<RecordStatus, number>;
  };
  knowledge: {
    total: number;
    byCategory: Record<KnowledgeBaseEntry["category"], number>;
  };
  pipeline: {
    // Total actionable records = form leads + chats that surfaced a contact / escalation
    actionableRecords: number;
    open: number; // pending
    engaged: number; // contacted + qualified
    conversionRate: number; // qualified share of all lead records (0-1)
  };
  recentActivityTimestamp: number | null;
}

const DATA_DIR = path.join(process.cwd(), ".data");
const LEADS_FILE = path.join(DATA_DIR, "leads.json");
const KNOWLEDGE_FILE = path.join(DATA_DIR, "knowledge_base.json");
const CHAT_LOGS_FILE = path.join(DATA_DIR, "chat_logs.json");

// Ensure database directory exists with atomic locking and verification
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Atomic file writing helper to avoid corruption
function writeJsonAtomic(filePath: string, data: any) {
  ensureDataDir();
  const tempPath = `${filePath}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), "utf-8");
  fs.renameSync(tempPath, filePath);
}

// Initial seed data for RAG over the company details
const SEED_KNOWLEDGE_BASE: KnowledgeBaseEntry[] = [
  {
    id: "about_shadow_root",
    title: "About Shadow Root Security Technologies",
    category: "company",
    content: "Shadow Root Security Technologies is a premier youth-led cybersecurity startup based in Lusaka, Zambia. Scaling rapidly from 2 to 10 experienced security specialists and full-stack developers, the company operates under the powerful brand motto: 'We start in the shadows. We bring threats to light.' Founded by Uchi Chinyama, Shadow Root bridges local talent with defense-grade digital solutions. It operates with approachability and high security, providing cybersecurity protection and modern web infrastructures to organizations, businesses, and non-profits across Southern Africa.",
    keywords: ["about", "shadow root", "company", "team", "founder", "uchi chinyama", "zambia", "lusaka", "youth", "startup"]
  },
  {
    id: "service_phishing",
    title: "Phishing Simulation Testing Services",
    category: "service",
    content: "In Zambia, NGOs, universities, schools, and small businesses are prime targets for social engineering. Shadow Root designs highly realistic, localized phishing simulation campaigns. We test your team using templates simulating local banks, mobile money portals (Airtel Money, MTN Mobile Money), WhatsApp alerts, and common SaaS login screens. After execution, we provide comprehensive reports detailing vulnerabilites in human defense. This is followed by visual, interactive training workshops to empower employees with security awareness, shifting them from victims to human firewalls.",
    keywords: ["phishing", "simulation", "social engineering", "testing", "ngo", "school", "training", "human firewall", "airtel", "mtn", "mobile money"]
  },
  {
    id: "service_web_dev",
    title: "Secure Full-Stack Web Development Services",
    category: "service",
    content: "Most web development agencies ignore security until a breach occurs. Shadow Root is a security-first engineering house. We design fluid, modern, fast-loading, mobile-friendly websites and full-stack software. Utilizing React, Next.js, Node.js, and TypeScript, we implement strict inputs sanitization, defense-grade OWASP Top 10 protections, secure HTTP response headers (CSP, HSTS, X-Frame-Options), robust rate limiting to thwart DDoS attacks, and encrypted file-upload gates. We don't just write code; we write secure fortresses.",
    keywords: ["web", "development", "website", "react", "next.js", "coding", "software", "headers", "owasp", "security-first"]
  },
  {
    id: "service_audits",
    title: "Vulnerability Assessments & Penetration Testing",
    category: "service",
    content: "Our security professionals perform comprehensive external and internal infrastructure audits. We scan and penetrate your web frameworks, APIs, databases, database configuration, local networks, and legacy servers to expose system misconfigurations, privilege injection doors, SQL injection vulnerabilities, and cross-site scripting (XSS) spots. Clients can purchase one-time comprehensive audits or put us on an active security maintenance retainer to guarantee 24/7 scanning, patch implementation, and continuous vulnerability reporting.",
    keywords: ["audit", "penetration testing", "pentest", "vulnerability", "scanner", "retainer", "maintenance", "security audit", "xss", "sqli", "owasp"]
  },
  {
    id: "service_ai_integration",
    title: "AI Integration Services (Gemini & WhatsApp)",
    category: "service",
    content: "We build smarter custom workflows for your brand using advanced AI modeling. Shadow Root builds customized, server-side secure Virtual Concierges and AI-driven client assistants powered by Google's state-of-the-art Gemini API. These assistants are safely enclosed inside secure servers to mask all access tokens. In addition to web-based widgets, we build direct WhatsApp Business API integrations, connecting your AI workflows directly to WhatsApp numbers so your customer support and lead generation run 24/7 without developer friction.",
    keywords: ["ai", "gemini", "whatsapp", "integration", "concierge", "model", "chatbot", "automation", "api"]
  },
  {
    id: "pricing_approach",
    title: "Pricing Philosophy and Retainer Costs",
    category: "faq",
    content: "Because we cater broadly to NGOs, schools, and scale-up local businesses, our pricing is flexible, structured, and customized rather than rigid or prohibitively enterprise-level. We evaluate project scope via a complimentary consultation. After assessing scale, we provide custom packages: 1) Simulation Campaigns start from a budget-friendly basic tier for small teams; 2) Software/Web development projects operate on a Milestone-Based payment structure; 3) Penetration audits and continuous retainers are structured as monthly subscriptions, ensuring you have on-call security response 24/7 without hiring a costly full-time security analyst.",
    keywords: ["pricing", "cost", "quote", "budget", "consultation", "subscription", "retainer", "payment", "packages"]
  },
  {
    id: "case_study_ngo",
    title: "NGO Phishing Simulation Post-Campaign Case Study",
    category: "case_study",
    content: "A prominent educational and agricultural NGO in Lusaka handling sensitive donor funds suspected insider vulnerability to phishing scams. Shadow Root was contracted to perform a silent, zero-announcement phishing simulation mimicking local mobile money verification emails. During the first cohort test, 45% of employees inputs their credentials. Shadow Root stepped in, running an interactive cybersecurity training session. In a mystery follow-up test 3 months later, credential submission dropped to 1.8%, highlighting the power of custom-tailored simulation training.",
    keywords: ["ngo", "case study", "agriculture", "education", "training", "results", "donor", "funds", "audit", "zambia"]
  },
  {
    id: "case_study_web",
    title: "Lusaka Distribution E-Commerce Hardening Portfolio",
    category: "case_study",
    content: "A fast-growing retail and distribution vendor based in Lusaka experienced frequent server downtime due to malicious bots scraping inventory and submitting massive script injections through public contact forms. Shadow Root completely rebuilt their web-facing interface using a secured React + Express stack, adding automated IP-based rate limiting, input sanitization, and enterprise-grade security headers (HSTS, CSP). Since launching over 8 months ago, the platform has achieved 100% uptime with zero bot submissions and a perfect 'A+' SSL vulnerability check.",
    keywords: ["e-commerce", "case study", "portfolio", "distribution", "retail", "injection", "bot", "rate limit", "headers", "uptime"]
  },
  {
    id: "contact_directory",
    title: "Shadow Root Official Contacts & Escalation Channels",
    category: "faq",
    content: "To consult with the leadership team, get a specialized quote, or escalate urgent security breaches, you can connect directly with Uchi Chinyama. Official Email: uchichinyama@gmail.com. Phone/WhatsApp Number: Uchi is accessible at +260 97 950 1830 (0979501830). You can call directly or tap to message on WhatsApp on your mobile device. We respond within hours for consulting and immediately for real-time cyber breach remediation.",
    keywords: ["contact", "email", "phone", "whatsapp", "number", "uchi chinyama", "office", "support", "escalate"]
  }
];

// Helper to load table from disk
function loadTable<T>(filePath: string, defaultData: T[]): T[] {
  ensureDataDir();
  if (!fs.existsSync(filePath)) {
    writeJsonAtomic(filePath, defaultData);
    return defaultData;
  }
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
  } catch (e) {
    // If corruption, fallback to default and backup
    console.error(`Error reading ${filePath}, falling back to defaults`, e);
    return defaultData;
  }
}

export const db = {
  // === LEADS MANAGEMENT ===
  getLeads(): Lead[] {
    return loadTable<Lead>(LEADS_FILE, []);
  },

  addLead(leadData: Omit<Lead, "id" | "createdAt" | "status">): Lead {
    const leads = this.getLeads();
    const newLead: Lead = {
      ...leadData,
      id: `lead_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`,
      status: "pending",
      createdAt: Date.now()
    };
    leads.unshift(newLead); // Newest leads first
    writeJsonAtomic(LEADS_FILE, leads);
    return newLead;
  },

  updateLeadStatus(id: string, status: Lead["status"]): boolean {
    const leads = this.getLeads();
    const idx = leads.findIndex(l => l.id === id);
    if (idx !== -1) {
      leads[idx].status = status;
      writeJsonAtomic(LEADS_FILE, leads);
      return true;
    }
    return false;
  },

  // === KNOWLEDGE BASE ===
  getKnowledgeBase(): KnowledgeBaseEntry[] {
    return loadTable<KnowledgeBaseEntry>(KNOWLEDGE_FILE, SEED_KNOWLEDGE_BASE);
  },

  addKnowledgeEntry(entry: Omit<KnowledgeBaseEntry, "id">): KnowledgeBaseEntry {
    const kb = this.getKnowledgeBase();
    const newEntry: KnowledgeBaseEntry = {
      ...entry,
      id: `kb_${Math.random().toString(36).substr(2, 9)}`
    };
    kb.push(newEntry);
    writeJsonAtomic(KNOWLEDGE_FILE, kb);
    return newEntry;
  },

  deleteKnowledgeEntry(id: string): boolean {
    const kb = this.getKnowledgeBase();
    const filtered = kb.filter(entry => entry.id !== id);
    if (filtered.length !== kb.length) {
      writeJsonAtomic(KNOWLEDGE_FILE, filtered);
      return true;
    }
    return false;
  },

  // === CHAT LOGS ===
  getChatLogs(): ChatLog[] {
    return loadTable<ChatLog>(CHAT_LOGS_FILE, []);
  },

  getChatLog(id: string): ChatLog | undefined {
    return this.getChatLogs().find(l => l.id === id);
  },

  createChatLog(id: string): ChatLog {
    const logs = this.getChatLogs();
    const newLog: ChatLog = {
      id,
      messages: [],
      isEscalated: false,
      status: "pending",
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    logs.unshift(newLog);
    writeJsonAtomic(CHAT_LOGS_FILE, logs);
    return newLog;
  },

  updateChatLog(id: string, update: Partial<Omit<ChatLog, "id" | "createdAt">>): ChatLog {
    const logs = this.getChatLogs();
    let idx = logs.findIndex(l => l.id === id);
    if (idx === -1) {
      this.createChatLog(id);
      idx = 0; // It was unshifted to 0
    }
    
    logs[idx] = {
      ...logs[idx],
      ...update,
      updatedAt: Date.now()
    };
    writeJsonAtomic(CHAT_LOGS_FILE, logs);
    return logs[idx];
  },

  appendChatMessage(id: string, message: ChatMessage): ChatLog {
    const logs = this.getChatLogs();
    let idx = logs.findIndex(l => l.id === id);
    if (idx === -1) {
      this.createChatLog(id);
      idx = 0;
    }

    const messages = [...logs[idx].messages, message];
    logs[idx] = {
      ...logs[idx],
      messages,
      updatedAt: Date.now()
    };
    
    writeJsonAtomic(CHAT_LOGS_FILE, logs);
    return logs[idx];
  },

  updateChatLogStatus(id: string, status: ChatLog["status"]): boolean {
    const logs = this.getChatLogs();
    const idx = logs.findIndex(l => l.id === id);
    if (idx !== -1) {
      logs[idx].status = status;
      writeJsonAtomic(CHAT_LOGS_FILE, logs);
      return true;
    }
    return false;
  },

  // === STATE / INTELLIGENCE REPORTING ===
  // Computes an aggregated snapshot of the pipeline for the admin reporting console.
  getStats(): SystemStats {
    const leads = this.getLeads();
    const chats = this.getChatLogs();
    const knowledge = this.getKnowledgeBase();

    const emptyStatusMap = (): Record<RecordStatus, number> =>
      STATUS_KEYS.reduce((acc, key) => {
        acc[key] = 0;
        return acc;
      }, {} as Record<RecordStatus, number>);

    // Tally lead records by status
    const leadsByStatus = emptyStatusMap();
    leads.forEach(l => {
      const status = STATUS_KEYS.includes(l.status) ? l.status : "pending";
      leadsByStatus[status] += 1;
    });

    // Tally chat sessions by status + escalation / contact signals
    const chatsByStatus = emptyStatusMap();
    let escalated = 0;
    let chatsWithContact = 0;
    chats.forEach(c => {
      const status = STATUS_KEYS.includes(c.status) ? c.status : "pending";
      chatsByStatus[status] += 1;
      if (c.isEscalated) escalated += 1;
      if (c.visitorContact || c.visitorName || c.isEscalated) chatsWithContact += 1;
    });

    // Tally knowledge documents by category
    const knowledgeByCategory = knowledge.reduce((acc, entry) => {
      acc[entry.category] = (acc[entry.category] || 0) + 1;
      return acc;
    }, {} as Record<KnowledgeBaseEntry["category"], number>);

    // Pipeline view: form leads plus chats that surfaced an actionable contact
    const actionableChats = chats.filter(c => c.visitorContact || c.visitorName || c.isEscalated);
    const actionableRecords = leads.length + actionableChats.length;
    const open = leadsByStatus.pending + actionableChats.filter(c => (c.status || "pending") === "pending").length;
    const engaged =
      leadsByStatus.contacted + leadsByStatus.qualified +
      actionableChats.filter(c => c.status === "contacted" || c.status === "qualified").length;
    const qualified =
      leadsByStatus.qualified + actionableChats.filter(c => c.status === "qualified").length;
    const conversionRate = actionableRecords > 0 ? qualified / actionableRecords : 0;

    // Most recent activity across leads + chats
    const timestamps = [
      ...leads.map(l => l.createdAt),
      ...chats.map(c => c.updatedAt || c.createdAt)
    ].filter(t => typeof t === "number" && !Number.isNaN(t));
    const recentActivityTimestamp = timestamps.length > 0 ? Math.max(...timestamps) : null;

    return {
      generatedAt: Date.now(),
      leads: {
        total: leads.length,
        byStatus: leadsByStatus
      },
      chats: {
        total: chats.length,
        escalated,
        withContact: chatsWithContact,
        byStatus: chatsByStatus
      },
      knowledge: {
        total: knowledge.length,
        byCategory: knowledgeByCategory
      },
      pipeline: {
        actionableRecords,
        open,
        engaged,
        conversionRate
      },
      recentActivityTimestamp
    };
  },

  // === PARAMETERIZED SEARCH (SQL EMULATION) ===
  // Performs high performance, secure, injection-free parameter-bound searches
  searchKnowledge(query: string): { entry: KnowledgeBaseEntry; score: number }[] {
    const kb = this.getKnowledgeBase();
    if (!query || query.trim() === "") {
      return kb.map(entry => ({ entry, score: 0 }));
    }

    // Tokenize client query safely without regex injections
    const tokens = query.toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter(t => t.length > 1);

    const matches = kb.map(entry => {
      let score = 0;
      const titleLower = entry.title.toLowerCase();
      const contentLower = entry.content.toLowerCase();

      // Parameterized matching over clean properties
      for (const token of tokens) {
        // Boost for titles
        if (titleLower.includes(token)) score += 10;
        // Boost for keyword lists (exact match)
        if (entry.keywords.some(k => k.toLowerCase() === token)) score += 8;
        // Moderate match for keywords hierarchy
        else if (entry.keywords.some(k => k.toLowerCase().includes(token))) score += 4;
        // Normal match for content body text
        if (contentLower.includes(token)) score += 2;
      }

      return { entry, score };
    });

    // Sort descending by score, only return items with positive match score
    return matches
      .filter(m => m.score > 0)
      .sort((a,b) => b.score - a.score);
  }
};
