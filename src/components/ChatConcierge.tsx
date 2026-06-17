import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Bot, User, Shield, AlertCircle, RefreshCw, KeyRound, Check } from "lucide-react";
import { ChatMessage } from "../types";

export default function ChatConcierge() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [isEscalated, setIsEscalated] = useState(false);
  const [escalationReason, setEscalationReason] = useState("");

  // Escalation flow input state
  const [isCapturingInfo, setIsCapturingInfo] = useState(false);
  const [visitorName, setVisitorName] = useState("");
  const [visitorContact, setVisitorContact] = useState("");
  const [infoSaved, setInfoSaved] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize secure anonymous session ID
  useEffect(() => {
    let session = sessionStorage.getItem("shadow_concierge_session");
    if (!session) {
      session = `session_anon_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
      sessionStorage.setItem("shadow_concierge_session", session);
    }
    setSessionId(session);

    // Initial Greeting from Shadow
    setMessages([
      {
        id: "msg_greet",
        role: "model",
        text: "Greetings, visitor. I am Shadow, the 24/7 Virtual Concierge for Shadow Root Security Technologies. \n\nI can outline our phishing simulations, custom React web builds, penetration audits, and estimated retainer models. How can I protect your digital systems today?",
        timestamp: Date.now()
      }
    ]);
  }, []);

  // Smooth scroll callback
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    const userText = inputMessage;
    setInputMessage("");
    setLoading(true);

    const userMsg: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      role: "user",
      text: userText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          sessionId,
          message: userText,
          visitorName: visitorName || undefined,
          visitorContact: visitorContact || undefined
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "A secure connection timeout occurred.");
      }

      const botMsg: ChatMessage = {
        id: `msg_bot_${Date.now()}`,
        role: "model",
        text: result.text,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, botMsg]);

      if (result.isEscalated) {
        setIsEscalated(true);
        setEscalationReason(result.escalationReason || "Human-takeover condition triggered.");
        // Prompt for details if not already saved
        if (!infoSaved) {
          setIsCapturingInfo(true);
        }
      }

    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `msg_err_${Date.now()}`,
        role: "model",
        text: err.message || "My network gateway timed out. Please contact Uchi directly via our WhatsApp/Email links.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveContactDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorName.trim() || !visitorContact.trim()) return;

    setLoading(true);
    try {
      // Send a silent payload to update chat log details
      await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          message: "[Visitor completed contact card]",
          visitorName,
          visitorContact
        })
      });

      setInfoSaved(true);
      setIsCapturingInfo(false);

      const confirmationMsg: ChatMessage = {
        id: `msg_card_${Date.now()}`,
        role: "model",
        text: `Thank you, ${visitorName}. Your contact credentials have been validated and compiled in our pending takeover database for Uchi. They will reach you shortly on ${visitorContact}.`,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, confirmationMsg]);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans flex flex-col items-end">
      {/* Floating Action Button Badge */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative bg-slate-950 hover:bg-[#120826] text-white rounded-full p-4 border border-[#6C00FF] flex items-center justify-center cursor-pointer shadow-[0_0_20px_rgba(108,0,255,0.4)] hover:scale-105 transition-all group"
        >
          {/* Glowing pulse ring */}
          <div className="absolute inset-0 rounded-full border border-[#6C00FF33] animate-pulse-ring pointer-events-none"></div>
          <MessageSquare className="w-6 h-6 text-[#A370FF] group-hover:rotate-6 transition-all" />
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8e3aff] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#6C00FF]"></span>
          </span>
        </button>
      )}

      {/* Embedded Chat Modal Panel */}
      {isOpen && (
        <div className="w-[360px] sm:w-[410px] h-[580px] bg-[#0a0515]/95 rounded-2xl border border-[#6C00FF44] shadow-2xl flex flex-col justify-between overflow-hidden">
          
          {/* Header Panel */}
          <div className="bg-[#120826] text-white px-4.5 py-4 border-b border-[#6C00FF33] flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-950"></span>
                <div className="bg-[#0a0515] border border-[#6C00FF33] p-2 rounded-xl text-[#A370FF] flex items-center justify-center shadow-[0_0_8px_rgba(108,0,255,0.3)]">
                  <Shield className="w-4 h-4" />
                </div>
              </div>
              <div>
                <h3 className="font-display font-black text-sm tracking-tight flex items-center">
                  SHADOW <span className="text-[10px] bg-[#6C00FF22] border border-[#6C00FF44] px-1.5 py-0.5 rounded ml-2 text-[#A370FF] font-mono uppercase font-extrabold">Online</span>
                </h3>
                <p className="text-[9px] text-slate-450 font-mono tracking-widest leading-none mt-1">
                  SECURE CHAT CONCIERGE
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white transition-all cursor-pointer p-1 rounded-full hover:bg-[#120826]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Active Escalated takeover banner if alert triggered */}
          {isEscalated && (
            <div className="bg-gradient-to-r from-[#6C00FF22] to-transparent border-b border-[#6C00FF33] px-4.5 py-2 flex items-center justify-between text-[10px] text-[#A370FF] font-medium space-x-2 shrink-0">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-3.5 h-3.5 text-[#A370FF] animate-pulse" />
                <span className="font-mono text-[9px] font-bold">HUMAN TAKE-OVER ESCALATION INITIATED: {escalationReason}</span>
              </div>
              <span className="bg-[#6C00FF] text-white font-mono text-[8px] font-bold px-1.5 py-0.5 rounded shrink-0">
                PENDING
              </span>
            </div>
          )}

          {/* Messages Loop Area */}
          <div className="flex-1 overflow-y-auto px-4.5 py-5 space-y-4 bg-[#0d071a] relative">
            
            {messages.map((msg) => {
              const isBot = msg.role === "model";
              return (
                <div
                  key={msg.id}
                  className={`flex items-start space-x-3.5 max-w-[85%] ${
                    isBot ? "mr-auto" : "ml-auto flex-row-reverse space-x-reverse"
                  }`}
                >
                  <div className={`p-1.5 rounded-lg shrink-0 flex items-center justify-center border ${
                    isBot 
                      ? "bg-[#120826] text-[#A370FF] border-[#6C00FF33]" 
                      : "bg-[#6C00FF22] text-white border-[#6C00FF44]"
                  }`}>
                    {isBot ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                  </div>
                  <div className={`rounded-xl px-4 py-3 text-xs leading-relaxed font-sans shadow-lg whitespace-pre-line ${
                    isBot 
                      ? "bg-[#120826]/90 text-slate-100 rounded-tl-none border border-[#6C00FF22]" 
                      : "bg-[#240f4f] text-white rounded-tr-none border border-[#6C00FF33]"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              );
            })}

            {/* Simulated typing dot */}
            {loading && !isCapturingInfo && (
              <div className="flex items-center space-x-1.5 text-slate-400 text-xs py-2 pl-1.5">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#A370FF]" />
                <span className="font-mono text-[9px] uppercase tracking-widest text-[#A370FF] font-extrabold animate-pulse">
                  Shadow decrypting...
                </span>
              </div>
            )}

            {/* Dynamic Card Prompt if Escalated */}
            {isCapturingInfo && (
              <div className="bg-[#120826] border border-[#6C00FF44] rounded-xl p-4 shadow-md font-sans text-xs space-y-3.5 border-l-4 border-l-[#6C00FF]">
                <div className="flex items-center space-x-2 text-white font-mono font-bold">
                  <KeyRound className="w-4 h-4 text-[#A370FF] shrink-0" />
                  <span>Takeover Contact Card</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-normal">
                  Shadow has detected quote negotiations or complex parameters. Fill this quick card to escalate details directly to Uchi.
                </p>
                <form onSubmit={handleSaveContactDetails} className="space-y-2.5 text-white">
                  <input
                    type="text"
                    value={visitorName}
                    onChange={(e) => setVisitorName(e.target.value)}
                    placeholder="Your Full Name (e.g. Mwansa)"
                    className="w-full bg-[#0a0515]/90 border border-[#6C00FF33] rounded px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#6C00FF]"
                    required
                  />
                  <input
                    type="text"
                    value={visitorContact}
                    onChange={(e) => setVisitorContact(e.target.value)}
                    placeholder="WhatsApp Phone or Verification Email"
                    className="w-full bg-[#0a0515]/90 border border-[#6C00FF33] rounded px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#6C00FF]"
                    required
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#6C00FF] hover:bg-[#8e3aff] text-white font-bold py-2 rounded text-[10px] cursor-pointer shadow-[0_0_10px_#6C00FF] transition-all flex items-center justify-center space-x-1"
                  >
                    <Check className="w-3 h-3 shrink-0" />
                    <span>Confirm takeover credentials</span>
                  </button>
                </form>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Form Control Footer */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-[#0a0515]/95 border-t border-[#6C00FF33] flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={isCapturingInfo ? "Please fulfill the contact card first..." : "Inquire about simulations, pricing ret..."}
              disabled={loading || isCapturingInfo}
              className="flex-1 bg-[#120826]/90 border border-[#6C00FF33] rounded-lg px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#6C00FF] focus:bg-[#120826] transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !inputMessage.trim() || isCapturingInfo}
              className="bg-[#6C00FF] hover:bg-[#8e3aff] text-white rounded-lg p-3 cursor-pointer transition-all disabled:opacity-50 flex items-center justify-center shadow-[0_0_10px_#6C00FF]"
            >
              <Send className="w-3.5 h-3.5 text-white shrink-0" />
            </button>
          </form>

        </div>
      )}
    </div>
  );
}
