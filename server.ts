import express, { Request, Response, NextFunction } from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { db } from "./src/db/secure_db";
import { createClient } from "@supabase/supabase-js";

// Load environment variables securely
dotenv.config();

const app = express();
const PORT = 3000;

// Enable JSON parser with limited size limits to prevent Denial of Service (DoS) payloads
app.use(express.json({ limit: "50kb" }));

// Security Sandbox Configuration: Inject defensive HTTP response headers
app.use((req: Request, res: Response, next: NextFunction) => {
  // Allow system frames (like Google AI Studio iframe previewers) but block malicious clickjacking
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval' wss:; " +
    "frame-ancestors 'self' https://ai.studio https://*.google.com https://*.run.app https://*.run.app:*"
  );
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  next();
});

// Clean custom loggers - prevent leaking PII in the console
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// === SECURITY CONTROLS: IN-MEMORY RATE LIMITERS ===
interface RateLimitBucket {
  count: number;
  resetTime: number;
}
const quoteLimitStore = new Map<string, RateLimitBucket>();
const chatLimitStore = new Map<string, RateLimitBucket>();

function checkRateLimit(ip: string, store: Map<string, RateLimitBucket>, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const record = store.get(ip);

  if (!record) {
    store.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + windowMs;
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count += 1;
  return true;
}

// === INPUT SANITIZATION UTILITIES ===
function sanitize(input: any, maxLength = 2000): string {
  if (typeof input !== "string") return "";
  const cleaned = input.trim();
  // Escape potential dangerous characters, return bounded length
  return cleaned
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
    .slice(0, maxLength);
}

function isValidEmail(email: string): boolean {
  if (typeof email !== "string") return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return email.length < 256 && emailRegex.test(email);
}

function isValidPhone(phone: string): boolean {
  if (typeof phone !== "string") return false;
  // Validates Zambian phone patterns (e.g. 097..., 095..., 096..., or +260 formats)
  const phoneRegex = /^\+?[0-9\s\-()]{9,18}$/;
  return phoneRegex.test(phone);
}

// === ADMIN AUTHENTICATION SECURITY MIDDLEWARE & SUPABASE INITIALIZATION ===
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "shadowrootadmin123";

// Simple stateful sessions store for local decryption password fallback
const activeAdminSessions = new Set<string>();

// Dynamic Supabase Auth client loading for production team verification
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";

let supabase: any = null;
if (supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log("[Supabase Server] Authorization client linked successfully.");
  } catch (error) {
    console.error("[Supabase Server] Failed to initialize Supabase:", error);
  }
}

async function authenticateAdmin(req: Request, res: Response, next: NextFunction) {
  const token = req.headers["authorization"]?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ error: "Access denied. Authorization token required." });
  }

  // If Supabase Auth is active, prioritize validation using JWT token verification
  if (supabase) {
    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (error || !user) {
        // Fallback to local decryption session checks to allow seamless system reviews
        if (activeAdminSessions.has(token)) {
          return next();
        }
        return res.status(401).json({ error: "Access denied. Invalid or expired Supabase authentication session." });
      }

      // PRINCIPLE OF LEAST PRIVILEGE: Strict authorization verification
      // Restrict access ONLY to recognized team members by whitelist / domain credentials
      const email = user.email || "";
      const isAuthorizedTeammate = 
        email.endsWith("@shadowroot.sec") || 
        email.endsWith("@shadowroot.co") || 
        ["uchichinyama@gmail.com", "shadowrootsec@gmail.com"].includes(email);

      if (!isAuthorizedTeammate) {
        return res.status(403).json({ error: "Privilege Restriction: This Supabase user account is not registered on the Shadow Root Team whitelist." });
      }

      (req as any).user = user;
      return next();
    } catch (err) {
      return res.status(401).json({ error: "Access denied. Secure session validation failed." });
    }
  }

  // Local fallback session lookup
  if (activeAdminSessions.has(token)) {
    return next();
  }

  return res.status(401).json({ error: "Access denied. Invalid credentials." });
}

// === LAZY GRADUAL INITIALIZATION: GEMINI SDK ===
let genAiInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!genAiInstance) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      // Graceful error reporting instead of server crash
      throw new Error("GEMINI_API_KEY environment variable is not defined in system Secrets.");
    }
    genAiInstance = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });
  }
  return genAiInstance;
}

// === API ROUTES ===

// --- ADMIN SYSTEM ENDPOINTS ---
app.post("/api/admin/auth", (req: Request, res: Response) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    const sessionToken = `session_${Math.random().toString(36).substring(2)}${Date.now()}`;
    activeAdminSessions.add(sessionToken);
    return res.json({ token: sessionToken, success: true });
  }
  return res.status(401).json({ error: "Authentication failed. Incorrect security decryption password." });
});

app.post("/api/admin/logout", (req: Request, res: Response) => {
  const token = req.headers["authorization"]?.replace("Bearer ", "");
  if (token) {
    activeAdminSessions.delete(token);
  }
  return res.json({ success: true });
});

// Leads dashboard query (authenticated)
app.get("/api/admin/leads", authenticateAdmin, (req: Request, res: Response) => {
  try {
    const leads = db.getLeads();
    return res.json({ leads });
  } catch (error) {
    return res.status(500).json({ error: "Internal Database Security Error." });
  }
});

// Update lead status (authenticated)
app.post("/api/admin/leads/:id/status", authenticateAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const validStatuses = ["pending", "contacted", "qualified", "closed", "archived"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: "Malformed payload logic. Invalid status parameter." });
  }
  
  try {
    const updated = db.updateLeadStatus(id, status as any);
    if (!updated) return res.status(404).json({ error: "Inquiry item not found." });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Internal Database Security Error." });
  }
});

// Chats activity dashboard query (authenticated)
app.get("/api/admin/chats", authenticateAdmin, (req: Request, res: Response) => {
  try {
    const chats = db.getChatLogs();
    return res.json({ chats });
  } catch (error) {
    return res.status(500).json({ error: "Internal Database Security Error." });
  }
});

// Update chat log status (authenticated)
app.post("/api/admin/chats/:id/status", authenticateAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const validStatuses = ["pending", "contacted", "qualified", "closed", "archived"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: "Malformed payload logic. Invalid status parameter." });
  }
  
  try {
    const updated = db.updateChatLogStatus(id, status as any);
    if (!updated) return res.status(404).json({ error: "Chat session log not found." });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Internal Database Security Error." });
  }
});

// Knowledge Base entries retrieval (authenticated)
app.get("/api/admin/knowledge", authenticateAdmin, (req: Request, res: Response) => {
  try {
    const entries = db.getKnowledgeBase();
    return res.json({ entries });
  } catch (err) {
    return res.status(500).json({ error: "Internal Database Security Error." });
  }
});

// Add custom RAG Knowledge Base Article (authenticated)
app.post("/api/admin/knowledge", authenticateAdmin, (req: Request, res: Response) => {
  const { title, category, content, keywords } = req.body;
  
  if (!title || !category || !content) {
    return res.status(400).json({ error: "Request properties validation failed. Missing parameters." });
  }
  
  try {
    const keywordsArray = Array.isArray(keywords) 
      ? keywords.map(k => sanitize(k, 50)) 
      : sanitize(keywords, 100).split(",").map(k => k.trim());

    const newEntry = db.addKnowledgeEntry({
      title: sanitize(title, 200),
      category: category as any,
      content: sanitize(content, 5000),
      keywords: keywordsArray.filter(k => k.length > 0)
    });
    
    return res.json({ success: true, entry: newEntry });
  } catch (err) {
    return res.status(500).json({ error: "Internal Database Security Error." });
  }
});

// Delete Knowledge Base Entry (authenticated)
app.delete("/api/admin/knowledge/:id", authenticateAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const success = db.deleteKnowledgeEntry(id);
    if (!success) return res.status(404).json({ error: "Knowledge item not found." });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Internal Database Security Error." });
  }
});


// --- PUBLIC SECURITY CONSULTATION/LEAD SUBMISSION GATE ---
app.post("/api/leads", (req: Request, res: Response) => {
  const clientIp = req.ip || req.headers["x-forwarded-for"]?.toString() || "anonymous";
  
  // Rate Limit check: Max 5 inquiries per 30 minutes per IP
  const allowed = checkRateLimit(clientIp, quoteLimitStore, 5, 30 * 60 * 1000);
  if (!allowed) {
    return res.status(429).json({ 
      error: "Rate Limit Violation. Maximum quote request frequency attained. Please try again in 30 minutes." 
    });
  }

  const { name, company, email, phone, service, message } = req.body;

  // Strict Validation logic
  const cleanName = sanitize(name, 100);
  const cleanCompany = sanitize(company, 100);
  const cleanEmail = sanitize(email, 150);
  const cleanPhone = sanitize(phone, 30);
  const cleanService = sanitize(service, 100);
  const cleanMessage = sanitize(message, 3000);

  if (!cleanName) {
    return res.status(400).json({ error: "Invalid Parameter: Full Name is required." });
  }
  if (!isValidEmail(cleanEmail)) {
    return res.status(400).json({ error: "Invalid Parameter: A valid professional email address is required." });
  }
  if (!isValidPhone(cleanPhone)) {
    return res.status(400).json({ error: "Invalid Parameter: Phone/WhatsApp contact format is unrecognized." });
  }
  if (!cleanService) {
    return res.status(400).json({ error: "Invalid Parameter: A clear service of interest must be selected." });
  }
  if (!cleanMessage || cleanMessage.length < 10) {
    return res.status(400).json({ error: "Invalid Parameter: Message details must exceed 10 characters." });
  }

  try {
    const saved = db.addLead({
      name: cleanName,
      company: cleanCompany || "Individual Consultant / Personal Project",
      email: cleanEmail,
      phone: cleanPhone,
      service: cleanService,
      message: cleanMessage
    });

    console.log(`[Trust Log] Lead ${saved.id} recorded safely for ${saved.company}`);
    return res.json({ 
      success: true, 
      message: "Lead securely cataloged. Shadow Root Security Analysts have been alerted." 
    });
  } catch (err) {
    // Fail safe - do not leak physical stack trace details
    return res.status(500).json({ error: "Lead processing failed due to database isolation. Please contact Uchi directly." });
  }
});


// --- PUBLIC CHAT ASSISTANT WIDGET ENDPOINT (RAG ENGINES) ---
app.post("/api/chat", async (req: Request, res: Response) => {
  const clientIp = req.ip || req.headers["x-forwarded-for"]?.toString() || "anonymous";

  // Rate Limiting on Chat Widget: Max 40 messages per 10 minutes per IP
  const allowed = checkRateLimit(clientIp, chatLimitStore, 40, 10 * 60 * 1000);
  if (!allowed) {
    return res.status(429).json({ 
      error: "Rate Limit Violation. Chat message limits attained. Please hold for a moments or call the WhatsApp line directly." 
    });
  }

  const { sessionId, message, visitorName, visitorContact } = req.body;
  
  if (!sessionId) {
    return res.status(400).json({ error: "Invalid session identity parameter." });
  }

  const cleanMessage = sanitize(message, 1500);
  if (!cleanMessage || cleanMessage.trim() === "") {
    return res.status(400).json({ error: "Empty prompt logic." });
  }

  try {
    // 1. Retrieve session historical conversation
    const chatLog = db.getChatLog(sessionId) || db.createChatLog(sessionId);
    
    // Save visitor details if they are newly provided during conversation
    const updatedDetails: any = {};
    if (visitorName) updatedDetails.visitorName = sanitize(visitorName, 100);
    if (visitorContact) updatedDetails.visitorContact = sanitize(visitorContact, 150);
    
    if (Object.keys(updatedDetails).length > 0) {
      db.updateChatLog(sessionId, updatedDetails);
    }

    // Append the visitor's incoming message
    db.appendChatMessage(sessionId, {
      role: "user",
      text: cleanMessage,
      timestamp: Date.now()
    });

    // 2. Perform CUSTOM RAG SEMANTIC RETRIEVAL
    const matchedDocs = db.searchKnowledge(cleanMessage);
    
    // Filter out only the highest relevance records for precision context
    const contextualDocs = matchedDocs.slice(0, 3).map(m => m.entry);

    let contextString = "NO LOCAL RECORDS FOUND. Rely on standard brand alignment.";
    if (contextualDocs.length > 0) {
      contextString = contextualDocs.map(d => `[DOCUMENT TITLE: ${d.title}] [CATEGORY: ${d.category}]\n${d.content}`).join("\n\n");
    }

    // 3. SECURELY CHECK FOR HUMAN ESCALATION TRIGGERS IN REAL-TIME
    const messageUpper = cleanMessage.toUpperCase();
    const isPricingQuote = messageUpper.includes("PRICE") || messageUpper.includes("QUOTE") || messageUpper.includes("QUOTATION") || messageUpper.includes("HOW MUCH") || messageUpper.includes("COST") || messageUpper.includes("KWACHA") || messageUpper.includes("ZMW");
    const isContactRequest = messageUpper.includes("HIRE") || messageUpper.includes("CONTRACT") || messageUpper.includes("MEET") || messageUpper.includes("CALL ME") || messageUpper.includes("DISCUSS") || messageUpper.includes("TALK TO") || messageUpper.includes("SCHEDUL");
    const isUrgentIncident = messageUpper.includes("BREACH") || messageUpper.includes("HACKED") || messageUpper.includes("COMPROMISED") || messageUpper.includes("ATTACKED") || messageUpper.includes("EMERGENCY") || messageUpper.includes("CRITICAL") || messageUpper.includes("LEAK");

    let isEscalationTriggered = false;
    let escalationReason = "";

    if (isPricingQuote) {
      isEscalationTriggered = true;
      escalationReason = "Pricing consultation / quote request inquiry detected.";
    } else if (isContactRequest) {
      isEscalationTriggered = true;
      escalationReason = "High-intent service acquisition inquiry detected.";
    } else if (isUrgentIncident) {
      isEscalationTriggered = true;
      escalationReason = "URGENT INCIDENT: Imminent security breach remediation requested.";
    }

    // Compile dynamic operational instructions context for Gemini
    const systemInstruction = `You are "Shadow", the elite Virtual Security Concierge for "Shadow Root Security Technologies", a premier security-first startup based in Lusaka, Zambia founded by Uchi Chinyama.
    Your mission is to represent the brand's security authority and approachability perfectly.

    OPERATIONAL POLICIES:
    1. Base all company factual answers STRICTLY on the retrieved context documents provided below.
    2. Tone: Highly confident, technically fluent, yet approachable to non-technical business/NGO workers. Don't be intimidating. Speak clearly.
    3. Zambian Context: Speak natively of Zambia, Airtel/MTN mobile money integrations, local NGOs, and Lusaka schools where appropriate.
    4. Escalation Trigger Rules:
       - If the user asks about deep pricing negotiations, requests a customized quote, asks for a human meeting, or reports their system is actively hacked/breached, you MUST state that you are logging this context and escalating immediately to Uchi for a rapid human takeover.
       - Politely request their Name, Email, and Phone/WhatsApp number if not already logged, explaining that Uchi will call or message them on WhatsApp immediately.
    5. NEVER hallucinate or mention features, tools, or staff members that are not supported by the provided documentation.
    6. Refuse to discuss anything outside of Shadow Root Security Technologies, cybersecurity, social engineering, web engineering, system audits, or security inquiries.

    RETRIEVED SECURE CONTEXT DATABASE ENTRIES:
    ${contextString}

    CURRENT ACTIVE CHAT CONTEXT:
    User is identified as '${chatLog.visitorName || "An anonymous security visitor"}' with contact information '${chatLog.visitorContact || "Not yet provided"}'.
    Has Escalation status been triggered for this message? ${isEscalationTriggered ? "YES (" + escalationReason + ")" : "NO"}`;

    // Get lazy initialized model client
    const ai = getGeminiClient();

    // Map conversation logs history to model compatible contents list
    const conversationHistory = chatLog.messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    // Select model dynamically to balance reasoning and low-latency:
    // Basic greetings or very short FAQs leverage 'gemini-3.1-flash-lite' for low-latency speed,
    // while complex requests or active incident investigations leverage 'gemini-3.5-flash'
    const isLowLatencyEligible = cleanMessage.length < 40 && !isPricingQuote && !isUrgentIncident && !isContactRequest;
    const modelToUse = isLowLatencyEligible ? "gemini-3.1-flash-lite" : "gemini-3.5-flash";

    // Call Gemini Model safely
    const response = await ai.models.generateContent({
      model: modelToUse,
      contents: conversationHistory,
      config: {
        systemInstruction,
        temperature: 0.35, // Medium-low temperature to keep answers highly factual
      }
    });

    const botReplyText = response.text || "I apologize, our cloud security filters intercepted this reply. Please connect with Uchi directly via our official WhatsApp lines listed below.";

    // Append AI concierge response back into log
    db.appendChatMessage(sessionId, {
      role: "model",
      text: botReplyText,
      timestamp: Date.now()
    });

    // If active escalation was identified, log this alert flag in the database record permanently
    if (isEscalationTriggered) {
      db.updateChatLog(sessionId, {
        isEscalated: true,
        escalationReason: escalationReason,
        visitorName: chatLog.visitorName || visitorName || undefined,
        visitorContact: chatLog.visitorContact || visitorContact || undefined
      });
    }

    return res.json({
      text: botReplyText,
      isEscalated: isEscalationTriggered,
      escalationReason: isEscalationTriggered ? escalationReason : undefined
    });

  } catch (error: any) {
    console.error("Gemini API server exception:", error.message || error);
    return res.status(500).json({ 
      error: "Our automated virtual concierge encountered an isolated security timeout. Please reach us directly at shadowrootsec@gmail.com." 
    });
  }
});


// === BOOTSTRAP EXTRAS: VITE DEV PLATFORM SYSTEM ===
async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    // Development Environment: Intercept assets through the Vite HMR middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    
    app.use(vite.middlewares);
    console.log("[Dev Environment] Vite development sandbox mounted in Express middleware mode.");
  } else {
    // Production Environment: Serve pre-compiled files out of standard dist/
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("[Production Environment] Express serving compiled assets natively from dist/.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Main Server] Shadow Root active. Navigating proxy requests to http://0.0.0.0:${PORT}`);
  });
}

bootstrap().catch(err => {
  console.error("Critical Main Server bootstrap error:", err);
  process.exit(1);
});
