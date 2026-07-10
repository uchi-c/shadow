import React, { useState, useEffect } from "react";
import {
  Lock, Eye, Check, ShieldAlert, KeyRound, Database, MessageSquare,
  Mail, RefreshCw, Trash2, Calendar, FileText, UserCheck, X,
  Search, Phone, Send, UserPlus, Info, ExternalLink,
  BarChart3, TrendingUp, Activity, Zap, AlertTriangle
} from "lucide-react";
import { LeadInquiry, kbEntry } from "../types";
import { supabase } from "../lib/supabaseClient";

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

// Ordered status metadata used to render the report distribution bars
const STATUS_META: { key: StatusKey; label: string; bar: string; text: string }[] = [
  { key: "pending", label: "Pending", bar: "bg-amber-400", text: "text-amber-400" },
  { key: "contacted", label: "Contacted", bar: "bg-blue-400", text: "text-blue-400" },
  { key: "qualified", label: "Qualified", bar: "bg-emerald-400", text: "text-emerald-400" },
  { key: "closed", label: "Closed", bar: "bg-rose-400", text: "text-rose-400" },
  { key: "archived", label: "Archived", bar: "bg-zinc-400", text: "text-zinc-400" },
];

type StatusKey = "pending" | "contacted" | "qualified" | "closed" | "archived";

interface AdminStats {
  generatedAt: number;
  leads: {
    total: number;
    byStatus: Record<StatusKey, number>;
  };
  chats: {
    total: number;
    escalated: number;
    withContact: number;
    byStatus: Record<StatusKey, number>;
  };
  knowledge: {
    total: number;
    byCategory: Record<string, number>;
  };
  pipeline: {
    actionableRecords: number;
    open: number;
    engaged: number;
    conversionRate: number;
  };
  recentActivityTimestamp: number | null;
}

interface UnifiedLead {
  id: string;
  source: "quote" | "chat";
  name: string;
  company: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  status: "pending" | "contacted" | "qualified" | "closed" | "archived";
  createdAt: number;
  chatSessionId?: string;
}

export default function AdminPanel({ isOpen, onClose }: AdminPanelProps) {
  // Authentication & Security State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState<"supabase_login" | "supabase_register" | "fallback_login">("supabase_login");
  const [supabaseEmail, setSupabaseEmail] = useState("");
  const [supabasePassword, setSupabasePassword] = useState("");
  const [password, setPassword] = useState(""); // Fallback password state
  const [authToken, setAuthToken] = useState("");
  const [isSupabaseActive, setIsSupabaseActive] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Dashboard Data State
  const [activeTab, setActiveTab] = useState<"reports" | "leads" | "knowledge" | "chats">("reports");
  const [leads, setLeads] = useState<LeadInquiry[]>([]);
  const [kbEntries, setKbEntries] = useState<kbEntry[]>([]);
  const [chats, setChats] = useState<any[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);

  // Search & Filtering States
  const [sourceFilter, setSourceFilter] = useState<"all" | "quote" | "chat">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "contacted" | "qualified" | "closed" | "archived">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLead, setSelectedLead] = useState<UnifiedLead | null>(null);

  // Add KB Entry Form
  const [newKb, setNewKb] = useState({
    title: "",
    category: "faq",
    content: "",
    keywords: ""
  });

  // 1. Initial configuration check & hook Supabase auth session
  useEffect(() => {
    if (supabase) {
      setIsSupabaseActive(true);
      setAuthMode("supabase_login");
      
      // Determine existing session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setAuthToken(session.access_token);
          setIsAuthenticated(true);
        } else {
          const savedToken = localStorage.getItem("shadow_admin_token");
          if (savedToken) {
            setAuthToken(savedToken);
            setIsAuthenticated(true);
          }
        }
      });

      // Listen for auth state alterations
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (session) {
          setAuthToken(session.access_token);
          setIsAuthenticated(true);
        } else {
          const savedToken = localStorage.getItem("shadow_admin_token");
          if (!savedToken) {
            setAuthToken("");
            setIsAuthenticated(false);
          }
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    } else {
      setIsSupabaseActive(false);
      setAuthMode("fallback_login");
      
      const savedToken = localStorage.getItem("shadow_admin_token");
      if (savedToken) {
        setAuthToken(savedToken);
        setIsAuthenticated(true);
      }
    }
  }, []);

  // Fetch data automatically once authenticated
  useEffect(() => {
    if (isAuthenticated && authToken) {
      fetchDashboardData();
    }
  }, [isAuthenticated, authToken, activeTab]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      // Force refresh of leads and chats concurrently to populate unified model
      const tokenHeader = `Bearer ${authToken}`;
      
      const endpoints = ["/api/admin/leads", "/api/admin/chats", "/api/admin/knowledge", "/api/admin/stats"];
      const requests = endpoints.map(ep => 
        fetch(ep, { headers: { "Authorization": tokenHeader } })
          .then(async r => {
            const resData = await r.json();
            if (!r.ok) {
              if (r.status === 401) {
                handleLogout();
                throw new Error("Authentication session expired.");
              }
              throw new Error(resData.error || "Failed to retrieve resource.");
            }
            return { endpoint: ep, data: resData };
          })
      );

      const results = await Promise.all(requests);
      
      results.forEach(res => {
        if (res.endpoint === "/api/admin/leads") setLeads(res.data.leads || []);
        if (res.endpoint === "/api/admin/chats") setChats(res.data.chats || []);
        if (res.endpoint === "/api/admin/knowledge") setKbEntries(res.data.entries || []);
        if (res.endpoint === "/api/admin/stats") setStats(res.data.stats || null);
      });

    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred fetching admin records.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Authentication Submit Handlers
  const handleSupabaseLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || loading) return;

    setLoading(true);
    setErrorMsg("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: supabaseEmail,
        password: supabasePassword,
      });

      if (error) throw error;

      if (data.session) {
        // Assert authorization in client-side too
        const email = data.user?.email || "";
        const isTeammate = 
          email.endsWith("@shadowroot.sec") || 
          email.endsWith("@shadowroot.co") || 
          ["uchichinyama@gmail.com", "shadowrootsec@gmail.com"].includes(email);

        if (!isTeammate) {
          await supabase.auth.signOut();
          throw new Error("Privilege Restricted: This Supabase user account is not registered on the Shadow Root Team whitelist.");
        }

        setAuthToken(data.session.access_token);
        setIsAuthenticated(true);
        setSupabasePassword("");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to authenticate with Supabase Auth.");
    } finally {
      setLoading(false);
    }
  };

  const handleSupabaseRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || loading) return;

    setLoading(true);
    setErrorMsg("");

    const email = supabaseEmail.trim();
    // Validate email eligibility prior to registration
    const isTeammate = 
      email.endsWith("@shadowroot.sec") || 
      email.endsWith("@shadowroot.co") || 
      ["uchichinyama@gmail.com", "shadowrootsec@gmail.com"].includes(email);

    if (!isTeammate) {
      setErrorMsg("Domain Restriction: Only email addresses ending with @shadowroot.sec / @shadowroot.co, or whitelisted founder accounts are eligible.");
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: supabaseEmail,
        password: supabasePassword,
      });

      if (error) throw error;

      if (data.user) {
        alert("Teammate account initiated. If email validation is active, check your inbox. You may try logging in now.");
        setAuthMode("supabase_login");
        setSupabasePassword("");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to register credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleFallbackLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim() || loading) return;

    setLoading(true);
    setErrorMsg("");

    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Decryption access code declined.");
      }

      localStorage.setItem("shadow_admin_token", result.token);
      setAuthToken(result.token);
      setIsAuthenticated(true);
      setPassword("");
    } catch (err: any) {
      setErrorMsg(err.message || "Decryption access code is incorrect.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
        headers: { "Authorization": `Bearer ${authToken}` }
      });
    } catch (e) {
      // Silent catch
    }
    localStorage.removeItem("shadow_admin_token");
    setAuthToken("");
    setIsAuthenticated(false);
    setLeads([]);
    setKbEntries([]);
    setChats([]);
    setStats(null);
    setSelectedLead(null);
  };

  // 3. Status update controllers (Universal helper)
  const handleUpdateUnifiedLeadStatus = async (lead: UnifiedLead, nextStatus: UnifiedLead["status"]) => {
    try {
      const endpoint = lead.source === "quote" 
        ? `/api/admin/leads/${lead.id}/status` 
        : `/api/admin/chats/${lead.id}/status`;

      const r = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({ status: nextStatus })
      });

      if (!r.ok) {
        const data = await r.json();
        throw new Error(data.error || "Failed to save status modifications.");
      }
      
      // Update local state tables concurrently
      if (lead.source === "quote") {
        setLeads(prev => prev.map(item => item.id === lead.id ? { ...item, status: nextStatus } : item));
      } else {
        setChats(prev => prev.map(item => item.id === lead.id ? { ...item, status: nextStatus } : item));
      }

      // Sync active detail modal
      if (selectedLead && selectedLead.id === lead.id) {
        setSelectedLead(prev => prev ? { ...prev, status: nextStatus } : null);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update record status state.");
    }
  };

  // Chat conversation delete trigger
  const handleDeleteChatLog = async (id: string) => {
    if (!window.confirm("Archiving of this active session is performed via changing its status. Deletion cannot be undo. Delete log?")) return;
    setErrorMsg("Direct log deletions are disabled for compliance audit trails. Please mark as Closed or Archive instead.");
  };

  // RAG Knowledge operations
  const handleDeleteKbEntry = async (id: string) => {
    if (!window.confirm("Isolate and erase this training record from the active Kuma AI RAG indexes?")) return;
    try {
      const r = await fetch(`/api/admin/knowledge/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${authToken}`
        }
      });

      if (!r.ok) throw new Error();

      setKbEntries(prev => prev.filter(entry => entry.id !== id));
    } catch (e) {
      setErrorMsg("Failed to delete custom knowledge document.");
    }
  };

  const handleAddKbEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKb.title || !newKb.content) return;

    setLoading(true);
    try {
      const r = await fetch("/api/admin/knowledge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify(newKb)
      });

      const responseData = await r.json();
      if (!r.ok) throw new Error(responseData.error);

      setKbEntries(prev => [...prev, responseData.entry]);
      setNewKb({ title: "", category: "faq", content: "", keywords: "" });
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to append training record.");
    } finally {
      setLoading(false);
    }
  };

  // 4. Advanced Leads Aggregator Algorithm (RAG & Unified State)
  const getUnifiedLeads = (): UnifiedLead[] => {
    const list: UnifiedLead[] = [];

    // Aggregate Quote Request Inquiries
    leads.forEach(l => {
      // Auto-Search for matching chat conversation sessions based on email, phone, or name tokens
      const matchingChat = chats.find(c => {
        const contactLower = (c.visitorContact || "").toLowerCase();
        const nameLower = (c.visitorName || "").toLowerCase();
        const leadEmailLower = l.email.toLowerCase();
        const leadPhoneClean = l.phone.replace(/[^0-9]/g, "");
        const chatContactClean = contactLower.replace(/[^0-9]/g, "");

        return (
          contactLower.includes(leadEmailLower) ||
          (leadPhoneClean.length > 5 && chatContactClean.includes(leadPhoneClean)) ||
          (l.name.toLowerCase().length > 3 && nameLower.includes(l.name.toLowerCase()))
        );
      });

      list.push({
        id: l.id,
        source: "quote",
        name: l.name,
        company: l.company || "Individual/Non-Governmental",
        email: l.email,
        phone: l.phone,
        service: l.service,
        message: l.message,
        status: (l.status as any) || "pending",
        createdAt: l.createdAt,
        chatSessionId: matchingChat?.id
      });
    });

    // Aggregate AI Chats that have contact credentials or active escalations
    chats.forEach(c => {
      if (c.visitorContact || c.visitorName || c.isEscalated) {
        // Prevent duplicate entries representing the same client
        const alreadyMapped = list.some(l => l.chatSessionId === c.id);
        if (!alreadyMapped) {
          list.push({
            id: c.id,
            source: "chat",
            name: c.visitorName || "Escalated Class Chat",
            company: "AI Conversational Lead",
            email: c.visitorContact?.includes("@") ? c.visitorContact : "Registered: " + (c.visitorContact || "N/A"),
            phone: !c.visitorContact?.includes("@") ? (c.visitorContact || "") : "",
            service: `Kuma AI Escalated Handoff`,
            message: c.escalationReason || (c.messages && c.messages.length > 0 ? c.messages[c.messages.length - 1].text : "Anonymous Chat engagement"),
            status: c.status || "pending",
            createdAt: c.createdAt,
            chatSessionId: c.id
          });
        }
      }
    });

    // Apply strict filtering parameters
    return list
      .filter(l => {
        if (sourceFilter !== "all" && l.source !== sourceFilter) return false;
        if (statusFilter !== "all" && l.status !== statusFilter) return false;

        if (searchQuery.trim() !== "") {
          const q = searchQuery.toLowerCase();
          return (
            l.name.toLowerCase().includes(q) ||
            l.company.toLowerCase().includes(q) ||
            l.email.toLowerCase().includes(q) ||
            l.phone.toLowerCase().includes(q) ||
            l.service.toLowerCase().includes(q) ||
            l.message.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => b.createdAt - a.createdAt);
  };

  // Helper values
  const filteredUnifiedLeads = getUnifiedLeads();
  const activeChat = selectedLead?.chatSessionId 
    ? chats.find(c => c.id === selectedLead.chatSessionId)?.messages || []
    : [];

  if (!isOpen) return null;

  return (
    <div id="admin-portal" className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#0c0515] rounded-3xl w-full max-w-6xl h-[90vh] border border-[#6C00FF33] flex flex-col overflow-hidden shadow-[0_0_50px_rgba(108,0,255,0.15)] relative font-sans">
        
        {/* HEADER BAR */}
        <div className="bg-[#120826] text-white px-6 py-4 border-b border-[#6C00FF33] flex justify-between items-center shrink-0">
          <div className="flex items-center space-x-3">
            <KeyRound className="w-5 h-5 text-[#A370FF] animate-pulse" />
            <div>
              <h3 className="font-display font-medium text-sm text-slate-100 tracking-tight flex items-center gap-1.5">
                Shadow Root Admin Command Center
                {isSupabaseActive && (
                  <span className="bg-[#6C00FF]/25 border border-[#6C00FF]/50 text-[9px] font-mono tracking-wider text-[#A370FF] px-1.5 py-0.5 rounded uppercase">
                    Supabase Enabled
                  </span>
                )}
              </h3>
              <p className="text-[10px] text-slate-400 font-mono tracking-widest leading-none mt-1 uppercase">
                Permissioned Security & Leads Management
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-all cursor-pointer p-1.5 hover:bg-[#0c0515] rounded-full"
            id="admin-close-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SECURE ENCRYPTED AUTHENTICATION LAYERS */}
        {!isAuthenticated ? (
          <div className="flex-grow flex flex-col justify-center items-center p-6 bg-[#0a0515]/80 overflow-y-auto">
            <div className="w-full max-w-md bg-[#120826]/90 border border-[#6C00FF33] p-7 rounded-2xl shadow-2xl space-y-5">
              
              <div className="text-center space-y-2">
                <div className="bg-[#6C00FF22] text-[#A370FF] p-3.5 rounded-full w-fit mx-auto mb-2 border border-[#6C00FF44] shadow-[0_0_15px_rgba(108,0,255,0.3)]">
                  <Lock className="w-6 h-6" />
                </div>
                <h4 className="font-display font-bold text-white text-base">Security Verification Auth</h4>
                <p className="text-xs text-slate-400 leading-normal">
                  Decrypted authentication is enforced. Teammates must authenticate using Supabase credentials to query records.
                </p>
              </div>

              {/* AUTHENTICATION TAB CONTROLS */}
              {isSupabaseActive && (
                <div className="flex border-b border-[#6C00FF22] text-xs font-mono">
                  <button
                    onClick={() => { setAuthMode("supabase_login"); setErrorMsg(""); }}
                    className={`flex-1 pb-2 border-b-2 text-center transition-all ${authMode === "supabase_login" ? "border-[#6C00FF] text-white" : "border-transparent text-slate-500 hover:text-slate-300"}`}
                  >
                    Supabase Login
                  </button>
                  <button
                    onClick={() => { setAuthMode("supabase_register"); setErrorMsg(""); }}
                    className={`flex-1 pb-2 border-b-2 text-center transition-all ${authMode === "supabase_register" ? "border-[#6C00FF] text-white" : "border-transparent text-slate-500 hover:text-slate-300"}`}
                  >
                    Teammate Register
                  </button>
                  <button
                    onClick={() => { setAuthMode("fallback_login"); setErrorMsg(""); }}
                    className={`flex-1 pb-2 border-b-2 text-center transition-all ${authMode === "fallback_login" ? "border-[#6C00FF] text-white" : "border-transparent text-slate-500 hover:text-slate-300"}`}
                  >
                    Decryption Fallback
                  </button>
                </div>
              )}

              {errorMsg && (
                <div className="bg-red-950/20 border border-red-900/40 text-red-400 text-xs p-3 rounded-lg flex items-start space-x-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                  <span className="leading-tight">{errorMsg}</span>
                </div>
              )}

              {/* FORM: SUPABASE TEAM LOGIN */}
              {authMode === "supabase_login" && (
                <form onSubmit={handleSupabaseLogin} className="space-y-4" id="supabase-login-form">
                  <div className="space-y-1.5">
                    <label htmlFor="admin-supa-email" className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block pb-0.5">Teammate Email</label>
                    <input
                      id="admin-supa-email"
                      type="email"
                      value={supabaseEmail}
                      onChange={(e) => setSupabaseEmail(e.target.value)}
                      placeholder="e.g. name@shadowroot.sec"
                      className="w-full bg-[#0a0515]/90 border border-[#6C00FF33] rounded-lg px-4.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#6C00FF] focus:ring-2 focus:ring-[#6C00FF] focus:ring-offset-2 focus:ring-offset-[#0a0515]"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="admin-supa-password" className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block pb-0.5">System Password</label>
                    <input
                      id="admin-supa-password"
                      type="password"
                      value={supabasePassword}
                      onChange={(e) => setSupabasePassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full bg-[#0a0515]/90 border border-[#6C00FF33] rounded-lg px-4.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#6C00FF] focus:ring-2 focus:ring-[#6C00FF] focus:ring-offset-2 focus:ring-offset-[#0a0515]"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#6C00FF] hover:bg-[#8e3aff] text-white font-bold py-3 rounded-lg text-xs cursor-pointer shadow-[0_0_15px_#6C00FF] transition-all flex items-center justify-center space-x-2 font-mono focus:outline-none focus:ring-2 focus:ring-[#6C00FF]"
                  >
                    {loading ? "Verifying Token..." : "PROCEED WITH SUPABASE AUTH"}
                  </button>
                </form>
              )}

              {/* FORM: SUPABASE TEAM REGISTER */}
              {authMode === "supabase_register" && (
                <form onSubmit={handleSupabaseRegister} className="space-y-4" id="supabase-register-form">
                  <div className="space-y-1.5">
                    <label htmlFor="admin-reg-email" className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block pb-0.5">Teammate Email Address</label>
                    <input
                      id="admin-reg-email"
                      type="email"
                      value={supabaseEmail}
                      onChange={(e) => setSupabaseEmail(e.target.value)}
                      placeholder="must end with @shadowroot.sec or @shadowroot.co"
                      className="w-full bg-[#0a0515]/90 border border-[#6C00FF33] rounded-lg px-4.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#6C00FF] focus:ring-2 focus:ring-[#6C00FF] focus:ring-offset-2 focus:ring-offset-[#0a0515]"
                      required
                    />
                    <p className="text-[9px] text-[#A370FF] leading-snug font-mono">
                      Domain whitelist checks are strictly enforced to follow the principle of least privilege.
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="admin-reg-password" className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block pb-0.5">Create Secure Password</label>
                    <input
                      id="admin-reg-password"
                      type="password"
                      value={supabasePassword}
                      onChange={(e) => setSupabasePassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full bg-[#0a0515]/90 border border-[#6C00FF33] rounded-lg px-4.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#6C00FF] focus:ring-2 focus:ring-[#6C00FF] focus:ring-offset-2 focus:ring-offset-[#0a0515]"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#A370FF] hover:bg-[#b991ff] text-slate-950 font-bold py-3 rounded-lg text-xs cursor-pointer transition-all flex items-center justify-center space-x-2 font-mono focus:outline-none focus:ring-2 focus:ring-[#A370FF]"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>{loading ? "Creating Teammate Identity..." : "REGISTER TEAMMATE PRIVILEGES"}</span>
                  </button>
                </form>
              )}

              {/* FORM: SYSTEM CODE DECRYPTION FALLBACK */}
              {authMode === "fallback_login" && (
                <form onSubmit={handleFallbackLogin} className="space-y-4" id="fallback-login-form">
                  <div className="space-y-1.5">
                    <label htmlFor="admin-fallback-password" className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block pb-0.5">Decryption Token Key</label>
                    <input
                      id="admin-fallback-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password code (e.g. shadowrootadmin123)"
                      className="w-full bg-[#0a0515]/90 border border-[#6C00FF33] rounded-lg px-4.5 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#6C00FF] focus:ring-2 focus:ring-[#6C00FF] focus:ring-offset-2 focus:ring-offset-[#0a0515]"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#6C00FF] hover:bg-[#8e3aff] text-white font-bold py-3 rounded-lg text-xs cursor-pointer shadow-[0_0_15px_#6C00FF] transition-all flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-[#6C00FF]"
                  >
                    {loading ? "Decrypting DB..." : "DECRYPT OFFLINE TABLES"}
                  </button>
                  
                  {!isSupabaseActive && (
                    <div className="bg-[#120826] border border-[#6C00FF1a] rounded-lg p-3 text-[10px] text-slate-400 leading-snug space-y-1.5">
                      <div className="flex items-center space-x-1.5 text-[#A370FF] font-semibold">
                        <Info className="w-3.5 h-3.5" />
                        <span>Supabase Integration Guide:</span>
                      </div>
                      <p>
                        Teammate login requires active Supabase credentials. Configure <strong>VITE_SUPABASE_URL</strong> and <strong>VITE_SUPABASE_ANON_KEY</strong> in the cloud dashboard Secrets to activate JWT auth automatically.
                      </p>
                    </div>
                  )}
                </form>
              )}

            </div>
          </div>
        ) : (
          
          /* AUTHENTICATED COMMAND CONSOLE GRID */
          <div className="flex-grow flex flex-col overflow-hidden">
            
            {/* TAB MENU BAR */}
            <div className="bg-[#120826] border-b border-[#6C00FF1a] px-6 py-3 flex flex-col md:flex-row gap-4 md:items-center justify-between shrink-0">
              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  onClick={() => setActiveTab("reports")}
                  className={`px-4 py-2 rounded-lg font-bold cursor-pointer transition-all flex items-center space-x-1.5 ${
                    activeTab === "reports"
                      ? "bg-[#6C00FF] text-white shadow-[0_4px_12px_rgba(108,0,255,0.3)]"
                      : "text-slate-400 hover:text-white hover:bg-[#0a0515]"
                  }`}
                  id="tab-reports"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>State &amp; Intelligence Report</span>
                </button>
                <button
                  onClick={() => setActiveTab("leads")}
                  className={`px-4 py-2 rounded-lg font-bold cursor-pointer transition-all flex items-center space-x-1.5 ${
                    activeTab === "leads" 
                      ? "bg-[#6C00FF] text-white shadow-[0_4px_12px_rgba(108,0,255,0.3)]" 
                      : "text-slate-400 hover:text-white hover:bg-[#0a0515]"
                  }`}
                  id="tab-leads"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Teammate Lead Inbox ({leads.length + chats.filter(c => c.visitorContact || c.visitorName || c.isEscalated).length})</span>
                </button>
                <button
                  onClick={() => setActiveTab("knowledge")}
                  className={`px-4 py-2 rounded-lg font-bold cursor-pointer transition-all flex items-center space-x-1.5 ${
                    activeTab === "knowledge" 
                      ? "bg-[#6C00FF] text-white shadow-[0_4px_12px_rgba(108,0,255,0.3)]" 
                      : "text-slate-400 hover:text-white hover:bg-[#0a0515]"
                  }`}
                  id="tab-knowledge"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>RAG AI Knowledge Base ({kbEntries.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab("chats")}
                  className={`px-4 py-2 rounded-lg font-bold cursor-pointer transition-all flex items-center space-x-1.5 ${
                    activeTab === "chats" 
                      ? "bg-[#6C00FF] text-white shadow-[0_4px_12px_rgba(108,0,255,0.3)]" 
                      : "text-slate-400 hover:text-white hover:bg-[#0a0515]"
                  }`}
                  id="tab-chats"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Raw Chat Sessions ({chats.length})</span>
                </button>
              </div>

              <div className="flex items-center space-x-3 text-xs">
                <button
                  onClick={fetchDashboardData}
                  disabled={loading}
                  className="p-2 bg-[#0a0515] hover:bg-[#120826] border border-[#6C00FF33] text-slate-300 rounded-lg cursor-pointer transition-all hover:rotate-45"
                  title="Reload data records"
                  id="reload-btn"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-red-950/20 hover:bg-red-950/40 text-red-400 border border-red-900/40 px-3.5 py-1.5 rounded-lg font-mono font-bold cursor-pointer transition-all"
                  id="logout-btn"
                >
                  Log out session
                </button>
              </div>
            </div>

            {/* ERROR NOTIFIER */}
            {errorMsg && (
              <div className="bg-red-950/20 border-b border-red-900/30 text-red-400 text-xs px-6 py-3 shrink-0 flex items-center justify-between">
                <span className="font-mono">{errorMsg}</span>
                <button onClick={() => setErrorMsg("")} className="text-red-400 font-bold hover:underline font-mono">Dismiss</button>
              </div>
            )}

            {/* SCROLLABLE VIEWCONTAINER */}
            <div className="flex-grow overflow-hidden bg-[#0a0515] flex">
              
              {/* TAB 0: STATE & INTELLIGENCE REPORT */}
              {!loading && activeTab === "reports" && (
                <div className="flex-grow flex flex-col p-6 overflow-y-auto space-y-6">
                  {!stats ? (
                    <div className="bg-[#120826]/75 border border-[#6C00FF1a] rounded-xl p-8 text-center text-xs text-slate-500 font-mono">
                      Report data is being compiled. Trigger a reload if this persists.
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                        <div className="space-y-1">
                          <h4 className="font-display font-bold text-white text-base flex items-center gap-2">
                            <Activity className="w-4 h-4 text-[#A370FF]" />
                            Operational State Snapshot
                          </h4>
                          <p className="text-xs text-slate-400 font-mono">
                            Aggregated intelligence across inquiry forms, Kuma AI sessions, and the RAG knowledge base.
                          </p>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono text-right space-y-0.5 shrink-0">
                          <div>Generated {new Date(stats.generatedAt).toLocaleString()}</div>
                          <div>
                            Last activity:{" "}
                            {stats.recentActivityTimestamp
                              ? new Date(stats.recentActivityTimestamp).toLocaleString()
                              : "No records yet"}
                          </div>
                        </div>
                      </div>

                      {/* KPI STAT CARDS */}
                      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                        {[
                          { label: "Actionable Records", value: stats.pipeline.actionableRecords, icon: FileText, accent: "text-[#A370FF]" },
                          { label: "Open / Pending", value: stats.pipeline.open, icon: Mail, accent: "text-amber-400" },
                          { label: "Engaged", value: stats.pipeline.engaged, icon: TrendingUp, accent: "text-blue-400" },
                          { label: "Conversion", value: `${(stats.pipeline.conversionRate * 100).toFixed(1)}%`, icon: BarChart3, accent: "text-emerald-400" },
                          { label: "AI Escalations", value: stats.chats.escalated, icon: Zap, accent: "text-[#A370FF]" },
                          { label: "RAG Documents", value: stats.knowledge.total, icon: Database, accent: "text-slate-300" },
                        ].map((card) => {
                          const Icon = card.icon;
                          return (
                            <div
                              key={card.label}
                              className="bg-[#120826]/75 border border-[#6C00FF22] rounded-xl p-4 space-y-2"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500 leading-tight">
                                  {card.label}
                                </span>
                                <Icon className={`w-3.5 h-3.5 ${card.accent}`} />
                              </div>
                              <div className={`text-2xl font-display font-bold ${card.accent}`}>{card.value}</div>
                            </div>
                          );
                        })}
                      </div>

                      {/* STATUS DISTRIBUTION BREAKDOWNS */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        {[
                          { title: "Inquiry Form Leads", total: stats.leads.total, byStatus: stats.leads.byStatus },
                          { title: "Kuma AI Chat Sessions", total: stats.chats.total, byStatus: stats.chats.byStatus },
                        ].map((group) => (
                          <div
                            key={group.title}
                            className="bg-[#120826]/75 border border-[#6C00FF1a] rounded-xl p-5 space-y-4"
                          >
                            <div className="flex items-center justify-between">
                              <h5 className="font-display font-medium text-xs text-white uppercase tracking-widest font-mono">
                                {group.title}
                              </h5>
                              <span className="text-[10px] font-mono text-slate-400">{group.total} total</span>
                            </div>
                            <div className="space-y-2.5">
                              {STATUS_META.map((meta) => {
                                const count = group.byStatus[meta.key] || 0;
                                const pct = group.total > 0 ? Math.round((count / group.total) * 100) : 0;
                                return (
                                  <div key={meta.key} className="space-y-1">
                                    <div className="flex items-center justify-between text-[10px] font-mono">
                                      <span className={meta.text}>{meta.label}</span>
                                      <span className="text-slate-400">
                                        {count} <span className="text-slate-600">({pct}%)</span>
                                      </span>
                                    </div>
                                    <div className="h-1.5 bg-[#0a0515] rounded-full overflow-hidden border border-white/5">
                                      <div
                                        className={`h-full ${meta.bar} rounded-full transition-all duration-500`}
                                        style={{ width: `${pct}%` }}
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* KNOWLEDGE COVERAGE + ESCALATION NOTICE */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        <div className="bg-[#120826]/75 border border-[#6C00FF1a] rounded-xl p-5 space-y-3">
                          <h5 className="font-display font-medium text-xs text-white uppercase tracking-widest font-mono flex items-center gap-1.5">
                            <Database className="w-3.5 h-3.5 text-[#A370FF]" />
                            RAG Knowledge Coverage
                          </h5>
                          {Object.keys(stats.knowledge.byCategory).length === 0 ? (
                            <p className="text-[11px] text-slate-500 font-mono">No knowledge documents indexed.</p>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(stats.knowledge.byCategory).map(([cat, count]) => (
                                <span
                                  key={cat}
                                  className="bg-[#0a0515] border border-[#6C00FF33] rounded px-2.5 py-1 text-[10px] font-mono text-slate-300"
                                >
                                  {cat}: <span className="text-[#A370FF] font-bold">{count}</span>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="bg-[#120826]/75 border border-[#6C00FF1a] rounded-xl p-5 space-y-2">
                          <h5 className="font-display font-medium text-xs text-white uppercase tracking-widest font-mono flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                            Escalation Signal
                          </h5>
                          <p className="text-[11px] text-slate-400 font-mono leading-relaxed">
                            <span className="text-amber-400 font-bold">{stats.chats.escalated}</span> of{" "}
                            <span className="text-slate-200 font-bold">{stats.chats.total}</span> AI sessions triggered a human takeover.{" "}
                            <span className="text-slate-200 font-bold">{stats.chats.withContact}</span> surfaced actionable contact details.
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* TAB 1: UNIFIED LEADS HUB (WITH DETAILS Modal Side Drawer) */}
              {!loading && activeTab === "leads" && (
                <div className="flex-grow flex overflow-hidden">
                  
                  {/* LEFT: LEADS SCRUBBER & FILTERS GRID */}
                  <div className="w-full lg:w-3/5 flex flex-col p-6 overflow-y-auto border-r border-[#6C00FF1a] space-y-4">
                    
                    {/* FILTER MATRIX CONTROLS */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 shrink-0">
                      <div>
                        <label className="text-[10px] font-mono uppercase text-slate-500 block pb-1">Filter Source</label>
                        <select
                          value={sourceFilter}
                          onChange={(e) => setSourceFilter(e.target.value as any)}
                          className="w-full bg-[#120826]/80 text-[#A370FF] font-semibold border border-[#6C00FF33] rounded px-3 py-2 text-xs focus:outline-none"
                        >
                          <option value="all">All Sources</option>
                          <option value="quote">Inquiry Forms Only</option>
                          <option value="chat">AI Assistant Chats Only</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-mono uppercase text-slate-500 block pb-1">Filter Status</label>
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value as any)}
                          className="w-full bg-[#120826]/80 text-[#A370FF] font-semibold border border-[#6C00FF33] rounded px-3 py-2 text-xs focus:outline-none"
                        >
                          <option value="all">All Statuses</option>
                          <option value="pending">Pending</option>
                          <option value="contacted">Contacted</option>
                          <option value="qualified">Qualified</option>
                          <option value="closed">Closed</option>
                          <option value="archived">Archived</option>
                        </select>
                      </div>
                      <div className="relative">
                        <label className="text-[10px] font-mono uppercase text-slate-500 block pb-1">Quick Search</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search names, emails..."
                            className="w-full bg-[#120826]/80 text-white placeholder-slate-500 border border-[#6C00FF33] rounded pl-8 pr-3 py-2 text-xs focus:outline-none"
                          />
                          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                        </div>
                      </div>
                    </div>

                    {/* LEAD INQUIRIES LIST */}
                    <div className="space-y-4">
                      {filteredUnifiedLeads.length === 0 ? (
                        <div className="bg-[#120826]/40 border border-[#6C00FF1a] rounded-2xl p-12 text-center text-xs text-slate-500 font-mono">
                          No active lead records match the filters specified.
                        </div>
                      ) : (
                        filteredUnifiedLeads.map((lead) => {
                          const isActive = selectedLead?.id === lead.id;
                          return (
                            <div 
                              key={lead.id} 
                              onClick={() => setSelectedLead(lead)}
                              className={`border rounded-2xl p-5 cursor-pointer transition-all duration-300 ${
                                isActive 
                                  ? "bg-[#1d0b3a]/70 border-[#A370FF] shadow-[0_0_15px_rgba(163,112,255,0.2)]" 
                                  : "bg-[#120826]/60 border-[#6C00FF1a] hover:bg-[#120826]/90 hover:border-[#6C00FF55]"
                              }`}
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
                                <div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h4 className="font-display font-medium text-white text-sm tracking-tight">{lead.name}</h4>
                                    <span className="text-[10px] text-slate-500 font-mono">({lead.company})</span>
                                    
                                    {/* Source Badge */}
                                    <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                                      lead.source === "quote" 
                                        ? "bg-blue-950/30 text-blue-400 border-blue-500/20" 
                                        : "bg-purple-950/30 text-purple-400 border-purple-500/20"
                                    }`}>
                                      {lead.source === "quote" ? "Form Submission" : "Kuma AI Conversation"}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-slate-500 mt-1.5 flex items-center space-x-1 font-mono">
                                    <Calendar className="w-3 h-3 text-[#6C00FF]" />
                                    <span>{new Date(lead.createdAt).toLocaleString()}</span>
                                  </p>
                                </div>

                                {/* Status indicators */}
                                <div className="flex items-center space-x-2">
                                  <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase border ${
                                    lead.status === "pending" ? "bg-amber-950/30 text-amber-400 border-amber-500/30" :
                                    lead.status === "contacted" ? "bg-blue-950/30 text-blue-400 border-blue-500/30" :
                                    lead.status === "qualified" ? "bg-emerald-950/30 text-emerald-400 border-emerald-500/30" :
                                    lead.status === "closed" ? "bg-rose-950/25 text-rose-400 border-rose-500/30" :
                                    "bg-zinc-950/30 text-zinc-400 border-zinc-500/20"
                                  }`}>
                                    {lead.status}
                                  </span>
                                </div>
                              </div>

                              <div className="pt-3 text-xs flex flex-col space-y-1 md:flex-row md:items-center justify-between text-slate-400 gap-1.5 font-mono">
                                <div className="truncate pr-4 leading-normal">
                                  <strong>Challenge/Interest:</strong> {lead.service}
                                </div>
                                <div className="text-[10px] text-[#A370FF] flex items-center shrink-0">
                                  {lead.chatSessionId ? "✓ Contains AI Session" : "Bypassed AI Chat"}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* RIGHT: LEADS DETAILS DISPLAY CONSOLE */}
                  <div className="hidden lg:flex lg:w-2/5 flex-col p-6 overflow-y-auto bg-[#120826]/30">
                    {selectedLead ? (
                      <div className="space-y-6">
                        
                        {/* Summary Block */}
                        <div className="space-y-2">
                          <p className="text-[10px] font-mono tracking-widest text-[#A370FF] uppercase mt-1">LEAD DETAILED RECORD</p>
                          <h4 className="text-xl font-display font-bold text-white tracking-tight">{selectedLead.name}</h4>
                          <p className="text-sm text-slate-400 font-mono leading-none">{selectedLead.company}</p>
                        </div>

                        {/* Client details card */}
                        <div className="bg-[#0c0515] rounded-2xl p-4.5 border border-[#6C00FF22] space-y-3.5 text-xs font-mono">
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="text-slate-500 block text-[9px] uppercase">Service Type Of Interest</span>
                              <span className="text-slate-200 font-bold block mt-0.5 text-xs">{selectedLead.service}</span>
                            </div>
                            <span className={`text-[9px] px-2 py-0.5 rounded border font-bold uppercase ${
                              selectedLead.source === "quote" ? "bg-blue-950/30 text-blue-400 border-blue-400/20" : "bg-purple-950/30 text-purple-400 border-purple-400/20"
                            }`}>
                              {selectedLead.source === "quote" ? "Form Quote" : "AI Sourced"}
                            </span>
                          </div>

                          <div className="border-t border-white/5 pt-3 grid grid-cols-2 gap-3">
                            <div>
                              <span className="text-slate-500 block text-[9px] uppercase">Email Link</span>
                              <a 
                                href={`mailto:${selectedLead.email}`} 
                                className="text-[#A370FF] hover:underline font-semibold block truncate mt-0.5 text-[11px]"
                              >
                                {selectedLead.email}
                              </a>
                            </div>
                            <div>
                              <span className="text-slate-500 block text-[9px] uppercase">Phone / WA Hub</span>
                              <a 
                                href={`tel:${selectedLead.phone}`} 
                                className="text-slate-200 hover:underline font-semibold block mt-0.5 text-[11px]"
                              >
                                {selectedLead.phone || "Not specified"}
                              </a>
                            </div>
                          </div>
                        </div>

                        {/* Message description */}
                        <div className="space-y-1.5 bg-[#0c0515] p-4.5 rounded-2xl border border-[#6C00FF1a]">
                          <span className="text-slate-500 font-mono text-[9px] uppercase block">Client Stated Proposal Message Requirements</span>
                          <p className="text-slate-300 text-xs leading-relaxed whitespace-pre-line bg-[#0a0515]/30 p-2.5 rounded border border-white/5">
                            {selectedLead.message}
                          </p>
                        </div>

                        {/* SYNCED AI KUMA DIALOGUE TRANSCRIPT CHIPS if applicable */}
                        <div className="space-y-2.5">
                          <span className="text-slate-500 font-mono text-[9px] uppercase block tracking-wider">
                            Synced Kuma AI Conversation Dialogue
                          </span>
                          
                          {selectedLead.chatSessionId ? (
                            <div className="border border-[#6C00FF22] bg-[#0c0515] rounded-2xl p-4 space-y-3 max-h-[250px] overflow-y-auto">
                              {activeChat.length === 0 ? (
                                <p className="text-center py-6 text-slate-500 text-[11px] font-mono">
                                  Dialogue is blank, or matching logs are loading...
                                </p>
                              ) : (
                                activeChat.map((msg: any, idx: number) => {
                                  const isBot = msg.role === "model";
                                  return (
                                    <div key={idx} className="space-y-1">
                                      <div className="flex items-center justify-between text-[9px] font-mono">
                                        <span className={isBot ? "text-[#A370FF] font-bold" : "text-emerald-400 font-bold"}>
                                          {isBot ? "Kuma AI Assistant:" : "Client Visitor:"}
                                        </span>
                                        {msg.timestamp && (
                                          <span className="text-[8px] text-slate-600">
                                            {new Date(msg.timestamp).toLocaleTimeString()}
                                          </span>
                                        )}
                                      </div>
                                      <div className={`p-2.5 rounded-xl text-xs leading-relaxed ${
                                        isBot 
                                          ? "bg-[#6C00FF]/10 text-slate-300 border border-[#6C00FF]/10 rounded-tl-none" 
                                          : "bg-emerald-950/10 text-emerald-100 border border-emerald-900/15 rounded-tr-none"
                                      }`}>
                                        {msg.text}
                                      </div>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          ) : (
                            <div className="bg-[#0c0515] border border-white/5 p-4 rounded-2xl text-center text-slate-500 text-[11px] font-mono leading-snug">
                              Client bypassed Kuma AI and consulted directly via the inquiry form submission page.
                            </div>
                          )}
                        </div>

                        {/* ADMINISTRATIVE LEAST PRIVILEGE ACTIONS CONTROL MATRIX */}
                        <div className="pt-4 border-t border-white/5 space-y-2">
                          <span className="text-slate-500 font-mono text-[9px] uppercase block tracking-wider">
                            Team Administrative Status Board Control
                          </span>
                          
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            <button
                              onClick={() => handleUpdateUnifiedLeadStatus(selectedLead, "pending")}
                              className={`px-2.5 py-2 rounded text-[11px] cursor-pointer font-bold border transition-all truncate text-center font-mono ${
                                selectedLead.status === "pending" 
                                  ? "bg-amber-950/40 text-amber-400 border-amber-500" 
                                  : "bg-[#0c0515] text-slate-400 border-white/5 hover:border-amber-500/30 hover:text-amber-300"
                              }`}
                            >
                              Pend
                            </button>
                            <button
                              onClick={() => handleUpdateUnifiedLeadStatus(selectedLead, "contacted")}
                              className={`px-2.5 py-2 rounded text-[11px] cursor-pointer font-bold border transition-all truncate text-center font-mono ${
                                selectedLead.status === "contacted" 
                                  ? "bg-blue-950/40 text-blue-400 border-blue-500" 
                                  : "bg-[#0c0515] text-slate-400 border-white/5 hover:border-blue-500/30 hover:text-blue-300"
                              }`}
                            >
                              Contacted
                            </button>
                            <button
                              onClick={() => handleUpdateUnifiedLeadStatus(selectedLead, "qualified")}
                              className={`px-2.5 py-2 rounded text-[11px] cursor-pointer font-bold border transition-all truncate text-center font-mono ${
                                selectedLead.status === "qualified" 
                                  ? "bg-emerald-950/40 text-emerald-400 border-emerald-500" 
                                  : "bg-[#0c0515] text-slate-400 border-white/5 hover:border-emerald-500/30 hover:text-emerald-300"
                              }`}
                            >
                              Qualified
                            </button>
                            <button
                              onClick={() => handleUpdateUnifiedLeadStatus(selectedLead, "closed")}
                              className={`px-2.5 py-2 rounded text-[11px] cursor-pointer font-bold border transition-all truncate text-center font-mono ${
                                selectedLead.status === "closed" 
                                  ? "bg-rose-950/20 text-rose-400 border-rose-500" 
                                  : "bg-[#0c0515] text-slate-400 border-white/5 hover:border-rose-500/30 hover:text-rose-300"
                              }`}
                            >
                              Closed
                            </button>
                            <button
                              onClick={() => handleUpdateUnifiedLeadStatus(selectedLead, "archived")}
                              className={`px-2.5 py-2 rounded col-span-2 sm:col-span-1 text-[11px] cursor-pointer font-bold border transition-all truncate text-center font-mono ${
                                selectedLead.status === "archived" 
                                  ? "bg-pink-950/20 text-pink-400 border-pink-500" 
                                  : "bg-[#0c0515] text-slate-400 border-white/5 hover:border-pink-500/30 hover:text-pink-300"
                              }`}
                            >
                              Archive
                            </button>
                          </div>
                        </div>

                      </div>
                    ) : (
                      <div className="flex-grow flex flex-col items-center justify-center text-center p-8 space-y-3">
                        <FileText className="w-10 h-10 text-slate-600 animate-pulse" />
                        <h4 className="text-xs font-mono font-bold text-slate-400 uppercase">Consultation Insights</h4>
                        <p className="text-[11px] text-slate-500 font-mono leading-relaxed max-w-[200px]">
                          Select a client record in the left scrubber to view their requirements profile alongside synced AI chat histories.
                        </p>
                      </div>
                    )}
                  </div>
                  
                </div>
              )}

              {/* TAB 2: RAG KNOWLEDGE BASE MANAGER */}
              {!loading && activeTab === "knowledge" && (
                <div className="flex-grow flex flex-col p-6 overflow-y-auto">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* Form Component to Add Documents */}
                    <form onSubmit={handleAddKbEntry} className="lg:col-span-4 bg-[#120826]/75 border border-[#6C00FF22] rounded-xl p-5 shadow-sm space-y-4 shrink-0">
                      <h4 className="font-display font-medium text-xs text-white uppercase tracking-widest flex items-center space-x-1.5 font-mono">
                        <Database className="w-4 h-4 text-[#A370FF]" />
                        <span>Append training record</span>
                      </h4>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Document Title *</label>
                        <input
                          type="text"
                          value={newKb.title}
                          onChange={(e) => setNewKb(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="e.g. Service: Penetration retainers"
                          className="w-full bg-[#0a0515]/90 border border-[#6C00FF33] rounded p-2.5 text-xs text-white focus:outline-none focus:border-[#6C00FF]"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Category</label>
                        <select
                          value={newKb.category}
                          onChange={(e) => setNewKb(prev => ({ ...prev, category: e.target.value as any }))}
                          className="w-full bg-[#0a0515]/90 border border-[#6C00FF33] rounded p-2.5 text-xs text-white focus:outline-none focus:border-[#6C00FF]"
                        >
                          <option className="bg-[#120826] text-white" value="service font-sans">Service Details</option>
                          <option className="bg-[#120826] text-white" value="company font-sans">Company Background</option>
                          <option className="bg-[#120826] text-white" value="case_study font-sans">Case Study summary</option>
                          <option className="bg-[#120826] text-white" value="faq font-sans">FAQ details</option>
                          <option className="bg-[#120826] text-white" value="methodology font-sans">Methodologies</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Keywords (Comma separated)</label>
                        <input
                          type="text"
                          value={newKb.keywords}
                          onChange={(e) => setNewKb(prev => ({ ...prev, keywords: e.target.value }))}
                          placeholder="cost, quote, custom, audit, mtn"
                          className="w-full bg-[#0a0515]/90 border border-[#6C00FF33] rounded p-2.5 text-xs text-white focus:outline-none focus:border-[#6C00FF]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Article Content *</label>
                        <textarea
                          value={newKb.content}
                          onChange={(e) => setNewKb(prev => ({ ...prev, content: e.target.value }))}
                          rows={6}
                          placeholder="Detailed markdown-supported documentation context for server-side semantic RAG lookup..."
                          className="w-full bg-[#0a0515]/90 border border-[#6C00FF33] rounded p-2.5 text-xs text-white resize-none focus:outline-none focus:border-[#6C00FF]"
                          required
                        ></textarea>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#6C00FF] hover:bg-[#8e3aff] text-white font-bold py-2.5 px-3 rounded text-[11px] cursor-pointer shadow-[0_0_12px_#6C00FF] transition-all flex items-center justify-center space-x-1 font-mono"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Publish to AI Indexer</span>
                      </button>
                    </form>

                    {/* Left Lists of KB Articles */}
                    <div className="lg:col-span-8 space-y-4">
                      {kbEntries.length === 0 ? (
                        <div className="bg-[#120826]/75 border border-[#6C00FF1a] rounded-xl p-8 text-center text-xs text-slate-500 font-mono">
                          Zero knowledge indexes found on server.
                        </div>
                      ) : (
                        kbEntries.map((doc) => (
                          <div key={doc.id} className="bg-[#120826]/75 border border-[#6C00FF1a] rounded-xl p-4 shadow-sm flex justify-between items-start space-x-4">
                            <div className="space-y-2 flex-1 min-w-0">
                              <div>
                                <div className="flex items-center space-x-2">
                                  <span className="bg-[#6C00FF22] text-[#A370FF] font-mono text-[8.5px] font-bold px-2 py-0.5 rounded border border-[#6C00FF33] uppercase shrink-0 font-mono">
                                    {doc.category}
                                  </span>
                                  <h5 className="font-display font-medium text-xs text-white truncate">{doc.title}</h5>
                                </div>
                                <div className="text-[9.5px] text-slate-400 mt-1 flex flex-wrap gap-1 font-mono">
                                  <span className="font-mono font-semibold uppercase tracking-wider text-[8.5px] shrink-0 mr-1 mt-0.5">Keywords:</span>
                                  {doc.keywords.map((k, i) => (
                                    <span key={i} className="bg-[#0a0515] border border-white/5 px-1.5 rounded text-slate-400 font-mono text-[9px]">{k}</span>
                                  ))}
                                </div>
                              </div>
                              <p className="text-[11px] text-slate-300 bg-[#0a0515]/50 border border-white/5 p-2.5 rounded leading-relaxed whitespace-pre-line">
                                {doc.content}
                              </p>
                            </div>

                            <button
                              onClick={() => handleDeleteKbEntry(doc.id)}
                              className="text-slate-500 hover:text-red-400 transition-all p-1.5 hover:bg-red-950/20 rounded shrink-0 cursor-pointer"
                              title="Delete article document"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>

                  </div>
                </div>
              )}

              {/* TAB 3: FULL CONVERSATION TRANSCRIPT CODES */}
              {!loading && activeTab === "chats" && (
                <div className="flex-grow flex flex-col p-6 overflow-y-auto space-y-4">
                  
                  <div className="space-y-1">
                    <h4 className="font-display font-bold text-white text-base">Raw Assistant Chat Transcripts</h4>
                    <p className="text-xs text-slate-400 font-mono">
                      Query and audits anonymous and customer dialog tunnels below.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {chats.length === 0 ? (
                      <div className="bg-[#120826]/75 border border-[#6C00FF1a] rounded-xl p-8 text-center text-xs text-slate-500 font-mono">
                        No active customer chatbot logs recorded yet.
                      </div>
                    ) : (
                      chats.map((chatLog: any) => (
                        <div key={chatLog.id} className="bg-[#120826]/75 border border-[#6C00FF33] rounded-xl p-5 shadow-sm space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-bold text-white text-xs truncate max-w-[150px]">
                                  {chatLog.visitorName || "Anonymous Searcher"}
                                </span>
                                {chatLog.isEscalated && (
                                  <span className="bg-[#6C00FF22] text-[#A370FF] border border-[#6C00FF44] px-2 py-0.5 rounded text-[8px] font-mono font-black uppercase tracking-wider animate-pulse shrink-0">
                                    ESCALATED TAKEOVER
                                  </span>
                                )}
                              </div>
                              <p className="text-[9.5px] text-slate-500 mt-1 font-mono">
                                Session ID: <span className="font-mono text-slate-300">{chatLog.id}</span> • Updated {new Date(chatLog.updatedAt).toLocaleString()}
                              </p>
                            </div>

                            <div className="flex items-center space-x-2">
                              {chatLog.visitorContact && (
                                <div className="bg-[#0a0515]/80 border border-[#6C00FF33] rounded px-2.5 py-1 text-[10px] font-mono font-bold text-slate-300 shrink-0">
                                  TAKEOVER DEST: <span className="text-[#A370FF]">{chatLog.visitorContact}</span>
                                </div>
                              )}
                              <button
                                onClick={() => handleDeleteChatLog(chatLog.id)}
                                className="text-slate-500 hover:text-red-400 p-1.5 rounded transition-all shrink-0 cursor-pointer"
                                title="Archived Log"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {chatLog.escalationReason && (
                            <div className="bg-[#6C00FF11] border border-[#6C00FF33] text-slate-300 text-[10px] p-2.5 rounded-lg font-mono">
                              <strong>Takeover Code Reason:</strong> {chatLog.escalationReason}
                            </div>
                          )}

                          {/* Dialog Bubbles */}
                          <div className="space-y-2 max-h-[160px] overflow-y-auto bg-[#0a0515] p-3 rounded-lg border border-white/5 text-[10.5px]">
                            {chatLog.messages && chatLog.messages.map((m: any, idx: number) => {
                              const isBot = m.role === "model";
                              return (
                                <div key={idx} className="flex space-x-2 items-start leading-relaxed text-slate-300">
                                  <span className={`font-mono text-[9px] uppercase font-bold shrink-0 ${isBot ? "text-[#A370FF]" : "text-emerald-400"}`}>
                                    {isBot ? "Shadow:" : "Visitor:"}
                                  </span>
                                  <span className="font-sans whitespace-pre-line break-words flex-1">{m.text}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                </div>
              )}

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
