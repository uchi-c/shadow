import fs from "fs";
import path from "path";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

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

// Initial seed data for RAG over the company details. These baseline documents
// always ship with the app so the concierge has context on a fresh database;
// custom documents added via the admin panel are layered on top.
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

const genId = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 11)}_${Date.now()}`;

/**
 * Storage backend contract. Two interchangeable implementations exist: a local
 * JSON-file store (development / persistent-server hosting) and a Supabase store
 * (serverless hosting such as Vercel, where the filesystem is read-only). Every
 * method is async so the two backends are drop-in compatible.
 *
 * Knowledge-base methods here deal only with *custom* documents added at runtime;
 * the baseline SEED_KNOWLEDGE_BASE is merged in by the `db` facade below.
 */
interface Store {
  getLeads(): Promise<Lead[]>;
  addLead(lead: Omit<Lead, "id" | "createdAt" | "status">): Promise<Lead>;
  updateLeadStatus(id: string, status: RecordStatus): Promise<boolean>;

  getCustomKnowledge(): Promise<KnowledgeBaseEntry[]>;
  addKnowledgeEntry(entry: Omit<KnowledgeBaseEntry, "id">): Promise<KnowledgeBaseEntry>;
  deleteKnowledgeEntry(id: string): Promise<boolean>;

  getChatLogs(): Promise<ChatLog[]>;
  getChatLog(id: string): Promise<ChatLog | undefined>;
  createChatLog(id: string): Promise<ChatLog>;
  updateChatLog(id: string, update: Partial<Omit<ChatLog, "id" | "createdAt">>): Promise<ChatLog>;
  appendChatMessage(id: string, message: ChatMessage): Promise<ChatLog>;
  updateChatLogStatus(id: string, status: RecordStatus): Promise<boolean>;
}

// ===================================================================
// FILE STORE — local development / persistent Node hosts
// ===================================================================
class FileStore implements Store {
  private dataDir: string;
  private leadsFile: string;
  private knowledgeFile: string;
  private chatLogsFile: string;

  constructor() {
    // On serverless (Vercel) only /tmp is writable; elsewhere use the project dir.
    const base = process.env.VERCEL ? path.join("/tmp", ".data") : path.join(process.cwd(), ".data");
    this.dataDir = base;
    this.leadsFile = path.join(base, "leads.json");
    this.knowledgeFile = path.join(base, "knowledge_base.json");
    this.chatLogsFile = path.join(base, "chat_logs.json");
  }

  private ensureDataDir() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  private writeJsonAtomic(filePath: string, data: any) {
    this.ensureDataDir();
    const tempPath = `${filePath}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), "utf-8");
    fs.renameSync(tempPath, filePath);
  }

  private loadTable<T>(filePath: string, defaultData: T[]): T[] {
    this.ensureDataDir();
    if (!fs.existsSync(filePath)) {
      this.writeJsonAtomic(filePath, defaultData);
      return defaultData;
    }
    try {
      return JSON.parse(fs.readFileSync(filePath, "utf-8"));
    } catch (e) {
      console.error(`Error reading ${filePath}, falling back to defaults`, e);
      return defaultData;
    }
  }

  async getLeads(): Promise<Lead[]> {
    return this.loadTable<Lead>(this.leadsFile, []);
  }

  async addLead(leadData: Omit<Lead, "id" | "createdAt" | "status">): Promise<Lead> {
    const leads = await this.getLeads();
    const newLead: Lead = { ...leadData, id: genId("lead"), status: "pending", createdAt: Date.now() };
    leads.unshift(newLead);
    this.writeJsonAtomic(this.leadsFile, leads);
    return newLead;
  }

  async updateLeadStatus(id: string, status: RecordStatus): Promise<boolean> {
    const leads = await this.getLeads();
    const idx = leads.findIndex(l => l.id === id);
    if (idx === -1) return false;
    leads[idx].status = status;
    this.writeJsonAtomic(this.leadsFile, leads);
    return true;
  }

  async getCustomKnowledge(): Promise<KnowledgeBaseEntry[]> {
    return this.loadTable<KnowledgeBaseEntry>(this.knowledgeFile, []);
  }

  async addKnowledgeEntry(entry: Omit<KnowledgeBaseEntry, "id">): Promise<KnowledgeBaseEntry> {
    const kb = await this.getCustomKnowledge();
    const newEntry: KnowledgeBaseEntry = { ...entry, id: genId("kb") };
    kb.push(newEntry);
    this.writeJsonAtomic(this.knowledgeFile, kb);
    return newEntry;
  }

  async deleteKnowledgeEntry(id: string): Promise<boolean> {
    const kb = await this.getCustomKnowledge();
    const filtered = kb.filter(e => e.id !== id);
    if (filtered.length === kb.length) return false;
    this.writeJsonAtomic(this.knowledgeFile, filtered);
    return true;
  }

  async getChatLogs(): Promise<ChatLog[]> {
    return this.loadTable<ChatLog>(this.chatLogsFile, []);
  }

  async getChatLog(id: string): Promise<ChatLog | undefined> {
    return (await this.getChatLogs()).find(l => l.id === id);
  }

  async createChatLog(id: string): Promise<ChatLog> {
    const logs = await this.getChatLogs();
    const newLog: ChatLog = {
      id, messages: [], isEscalated: false, status: "pending",
      createdAt: Date.now(), updatedAt: Date.now()
    };
    logs.unshift(newLog);
    this.writeJsonAtomic(this.chatLogsFile, logs);
    return newLog;
  }

  async updateChatLog(id: string, update: Partial<Omit<ChatLog, "id" | "createdAt">>): Promise<ChatLog> {
    const logs = await this.getChatLogs();
    let idx = logs.findIndex(l => l.id === id);
    if (idx === -1) {
      await this.createChatLog(id);
      return this.updateChatLog(id, update);
    }
    logs[idx] = { ...logs[idx], ...update, updatedAt: Date.now() };
    this.writeJsonAtomic(this.chatLogsFile, logs);
    return logs[idx];
  }

  async appendChatMessage(id: string, message: ChatMessage): Promise<ChatLog> {
    const logs = await this.getChatLogs();
    let idx = logs.findIndex(l => l.id === id);
    if (idx === -1) {
      await this.createChatLog(id);
      return this.appendChatMessage(id, message);
    }
    logs[idx] = { ...logs[idx], messages: [...logs[idx].messages, message], updatedAt: Date.now() };
    this.writeJsonAtomic(this.chatLogsFile, logs);
    return logs[idx];
  }

  async updateChatLogStatus(id: string, status: RecordStatus): Promise<boolean> {
    const logs = await this.getChatLogs();
    const idx = logs.findIndex(l => l.id === id);
    if (idx === -1) return false;
    logs[idx].status = status;
    this.writeJsonAtomic(this.chatLogsFile, logs);
    return true;
  }
}

// ===================================================================
// SUPABASE STORE — serverless hosting (Vercel), durable persistence
// ===================================================================
class SupabaseStore implements Store {
  constructor(private client: SupabaseClient) {}

  private mapLead = (r: any): Lead => ({
    id: r.id, name: r.name, company: r.company, email: r.email, phone: r.phone,
    service: r.service, message: r.message, status: r.status, createdAt: Number(r.created_at)
  });

  private mapChat = (r: any): ChatLog => ({
    id: r.id,
    visitorName: r.visitor_name ?? undefined,
    visitorContact: r.visitor_contact ?? undefined,
    messages: Array.isArray(r.messages) ? r.messages : [],
    isEscalated: !!r.is_escalated,
    escalationReason: r.escalation_reason ?? undefined,
    status: r.status,
    createdAt: Number(r.created_at),
    updatedAt: Number(r.updated_at)
  });

  private mapKb = (r: any): KnowledgeBaseEntry => ({
    id: r.id, title: r.title, category: r.category, content: r.content,
    keywords: Array.isArray(r.keywords) ? r.keywords : []
  });

  async getLeads(): Promise<Lead[]> {
    const { data, error } = await this.client.from("leads").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []).map(this.mapLead);
  }

  async addLead(leadData: Omit<Lead, "id" | "createdAt" | "status">): Promise<Lead> {
    const row = {
      id: genId("lead"), name: leadData.name, company: leadData.company, email: leadData.email,
      phone: leadData.phone, service: leadData.service, message: leadData.message,
      status: "pending", created_at: Date.now()
    };
    const { data, error } = await this.client.from("leads").insert(row).select().single();
    if (error) throw error;
    return this.mapLead(data);
  }

  async updateLeadStatus(id: string, status: RecordStatus): Promise<boolean> {
    const { data, error } = await this.client.from("leads").update({ status }).eq("id", id).select("id");
    if (error) throw error;
    return (data?.length || 0) > 0;
  }

  async getCustomKnowledge(): Promise<KnowledgeBaseEntry[]> {
    const { data, error } = await this.client.from("knowledge_base").select("*");
    if (error) throw error;
    return (data || []).map(this.mapKb);
  }

  async addKnowledgeEntry(entry: Omit<KnowledgeBaseEntry, "id">): Promise<KnowledgeBaseEntry> {
    const row = { id: genId("kb"), title: entry.title, category: entry.category, content: entry.content, keywords: entry.keywords };
    const { data, error } = await this.client.from("knowledge_base").insert(row).select().single();
    if (error) throw error;
    return this.mapKb(data);
  }

  async deleteKnowledgeEntry(id: string): Promise<boolean> {
    const { data, error } = await this.client.from("knowledge_base").delete().eq("id", id).select("id");
    if (error) throw error;
    return (data?.length || 0) > 0;
  }

  async getChatLogs(): Promise<ChatLog[]> {
    const { data, error } = await this.client.from("chat_logs").select("*").order("updated_at", { ascending: false });
    if (error) throw error;
    return (data || []).map(this.mapChat);
  }

  async getChatLog(id: string): Promise<ChatLog | undefined> {
    const { data, error } = await this.client.from("chat_logs").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? this.mapChat(data) : undefined;
  }

  async createChatLog(id: string): Promise<ChatLog> {
    const now = Date.now();
    const row = { id, visitor_name: null, visitor_contact: null, messages: [], is_escalated: false, escalation_reason: null, status: "pending", created_at: now, updated_at: now };
    const { data, error } = await this.client.from("chat_logs").upsert(row, { onConflict: "id" }).select().single();
    if (error) throw error;
    return this.mapChat(data);
  }

  async updateChatLog(id: string, update: Partial<Omit<ChatLog, "id" | "createdAt">>): Promise<ChatLog> {
    const existing = (await this.getChatLog(id)) || (await this.createChatLog(id));
    const merged: ChatLog = { ...existing, ...update, updatedAt: Date.now() };
    const row = {
      id: merged.id,
      visitor_name: merged.visitorName ?? null,
      visitor_contact: merged.visitorContact ?? null,
      messages: merged.messages,
      is_escalated: merged.isEscalated,
      escalation_reason: merged.escalationReason ?? null,
      status: merged.status,
      created_at: merged.createdAt,
      updated_at: merged.updatedAt
    };
    const { data, error } = await this.client.from("chat_logs").upsert(row, { onConflict: "id" }).select().single();
    if (error) throw error;
    return this.mapChat(data);
  }

  async appendChatMessage(id: string, message: ChatMessage): Promise<ChatLog> {
    const existing = (await this.getChatLog(id)) || (await this.createChatLog(id));
    return this.updateChatLog(id, { messages: [...existing.messages, message] });
  }

  async updateChatLogStatus(id: string, status: RecordStatus): Promise<boolean> {
    const { data, error } = await this.client.from("chat_logs").update({ status, updated_at: Date.now() }).eq("id", id).select("id");
    if (error) throw error;
    return (data?.length || 0) > 0;
  }
}

// ===================================================================
// BACKEND SELECTION
// ===================================================================
function createStore(): Store {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
  // A service-role key is required to persist server-side data past row-level security.
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  if (supabaseUrl && serviceKey) {
    try {
      const client = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
      console.log("[DB] Using Supabase persistence backend.");
      return new SupabaseStore(client);
    } catch (err) {
      console.error("[DB] Failed to initialise Supabase store, falling back to file store:", err);
    }
  }

  if (process.env.VERCEL) {
    console.warn("[DB] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set on Vercel — using EPHEMERAL /tmp file store. Data will not persist between invocations. Set the Supabase env vars for durable storage.");
  } else {
    console.log("[DB] Using local file persistence backend.");
  }
  return new FileStore();
}

const store = createStore();

// ===================================================================
// SHARED HELPERS
// ===================================================================

// Pure RAG scorer — parameter-bound, injection-free token matching.
function scoreKnowledge(kb: KnowledgeBaseEntry[], query: string): { entry: KnowledgeBaseEntry; score: number }[] {
  if (!query || query.trim() === "") {
    return kb.map(entry => ({ entry, score: 0 }));
  }

  const tokens = query.toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter(t => t.length > 1);

  return kb.map(entry => {
    let score = 0;
    const titleLower = entry.title.toLowerCase();
    const contentLower = entry.content.toLowerCase();
    for (const token of tokens) {
      if (titleLower.includes(token)) score += 10;
      if (entry.keywords.some(k => k.toLowerCase() === token)) score += 8;
      else if (entry.keywords.some(k => k.toLowerCase().includes(token))) score += 4;
      if (contentLower.includes(token)) score += 2;
    }
    return { entry, score };
  })
    .filter(m => m.score > 0)
    .sort((a, b) => b.score - a.score);
}

// ===================================================================
// PUBLIC DB FACADE (async)
// ===================================================================
export const db = {
  // === LEADS ===
  getLeads: () => store.getLeads(),
  addLead: (lead: Omit<Lead, "id" | "createdAt" | "status">) => store.addLead(lead),
  updateLeadStatus: (id: string, status: RecordStatus) => store.updateLeadStatus(id, status),

  // === KNOWLEDGE BASE (seed baseline + custom documents) ===
  async getKnowledgeBase(): Promise<KnowledgeBaseEntry[]> {
    const custom = await store.getCustomKnowledge();
    return [...SEED_KNOWLEDGE_BASE, ...custom];
  },
  addKnowledgeEntry: (entry: Omit<KnowledgeBaseEntry, "id">) => store.addKnowledgeEntry(entry),
  deleteKnowledgeEntry: (id: string) => store.deleteKnowledgeEntry(id),

  // === CHAT LOGS ===
  getChatLogs: () => store.getChatLogs(),
  getChatLog: (id: string) => store.getChatLog(id),
  createChatLog: (id: string) => store.createChatLog(id),
  updateChatLog: (id: string, update: Partial<Omit<ChatLog, "id" | "createdAt">>) => store.updateChatLog(id, update),
  appendChatMessage: (id: string, message: ChatMessage) => store.appendChatMessage(id, message),
  updateChatLogStatus: (id: string, status: RecordStatus) => store.updateChatLogStatus(id, status),

  // === RAG SEARCH ===
  async searchKnowledge(query: string): Promise<{ entry: KnowledgeBaseEntry; score: number }[]> {
    const kb = await this.getKnowledgeBase();
    return scoreKnowledge(kb, query);
  },

  // === STATE / INTELLIGENCE REPORTING ===
  async getStats(): Promise<SystemStats> {
    const [leads, chats, knowledge] = await Promise.all([
      this.getLeads(),
      this.getChatLogs(),
      this.getKnowledgeBase()
    ]);

    const emptyStatusMap = (): Record<RecordStatus, number> =>
      STATUS_KEYS.reduce((acc, key) => { acc[key] = 0; return acc; }, {} as Record<RecordStatus, number>);

    const leadsByStatus = emptyStatusMap();
    leads.forEach(l => {
      const status = STATUS_KEYS.includes(l.status) ? l.status : "pending";
      leadsByStatus[status] += 1;
    });

    const chatsByStatus = emptyStatusMap();
    let escalated = 0;
    let chatsWithContact = 0;
    chats.forEach(c => {
      const status = STATUS_KEYS.includes(c.status) ? c.status : "pending";
      chatsByStatus[status] += 1;
      if (c.isEscalated) escalated += 1;
      if (c.visitorContact || c.visitorName || c.isEscalated) chatsWithContact += 1;
    });

    const knowledgeByCategory = knowledge.reduce((acc, entry) => {
      acc[entry.category] = (acc[entry.category] || 0) + 1;
      return acc;
    }, {} as Record<KnowledgeBaseEntry["category"], number>);

    const actionableChats = chats.filter(c => c.visitorContact || c.visitorName || c.isEscalated);
    const actionableRecords = leads.length + actionableChats.length;
    const open = leadsByStatus.pending + actionableChats.filter(c => (c.status || "pending") === "pending").length;
    const engaged =
      leadsByStatus.contacted + leadsByStatus.qualified +
      actionableChats.filter(c => c.status === "contacted" || c.status === "qualified").length;
    const qualified =
      leadsByStatus.qualified + actionableChats.filter(c => c.status === "qualified").length;
    const conversionRate = actionableRecords > 0 ? qualified / actionableRecords : 0;

    const timestamps = [
      ...leads.map(l => l.createdAt),
      ...chats.map(c => c.updatedAt || c.createdAt)
    ].filter(t => typeof t === "number" && !Number.isNaN(t));
    const recentActivityTimestamp = timestamps.length > 0 ? Math.max(...timestamps) : null;

    return {
      generatedAt: Date.now(),
      leads: { total: leads.length, byStatus: leadsByStatus },
      chats: { total: chats.length, escalated, withContact: chatsWithContact, byStatus: chatsByStatus },
      knowledge: { total: knowledge.length, byCategory: knowledgeByCategory },
      pipeline: { actionableRecords, open, engaged, conversionRate },
      recentActivityTimestamp
    };
  }
};
