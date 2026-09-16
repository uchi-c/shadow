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
        text: "Hi, I'm Shadow, the virtual assistant for Shadow Root Security Technologies. \n\nI can answer questions about phishing simulations, secure web development, penetration audits, and AI workflow automation. How can I help?",
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
        throw new Error(result.error || "Something went wrong. Please try again.");
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
        setEscalationReason(result.escalationReason || "A team member will follow up.");
        // Prompt for details if not already saved
        if (!infoSaved) {
          setIsCapturingInfo(true);
        }
      }

    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `msg_err_${Date.now()}`,
        role: "model",
        text: err.message || "That didn't go through. Please contact Uchi directly via our WhatsApp/email links.",
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
        text: `Thanks, ${visitorName}. We've got your details and Uchi will reach out shortly on ${visitorContact}.`,
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
          aria-label="Open Shadow AI security concierge chat"
          className="relative bg-slate-950 hover:bg-[#0f1720] text-white rounded-full p-4 border border-[#2563eb] flex items-center justify-center cursor-pointer hover:scale-105 transition-all group"
        >
          <MessageSquare className="w-6 h-6 text-[#60a5fa] group-hover:rotate-6 transition-all" />
          <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-[#2563eb]"></span>
        </button>
      )}

      {/* Embedded Chat Modal Panel */}
      {isOpen && (
        <div className="w-[360px] sm:w-[410px] h-[580px] bg-[#0b0f14]/95 rounded-2xl border border-white/10 flex flex-col justify-between overflow-hidden">

          {/* Header Panel */}
          <div className="bg-[#0f1720] text-white px-4.5 py-4 border-b border-white/10 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-950"></span>
                <div className="bg-[#0b0f14] border border-[#2563eb33] p-2 rounded-xl text-[#60a5fa] flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
              </div>
              <div>
                <h3 className="font-display font-black text-sm tracking-tight flex items-center">
                  Shadow <span className="text-[10px] bg-[#2563eb22] border border-[#2563eb44] px-1.5 py-0.5 rounded ml-2 text-[#60a5fa] font-semibold">Online</span>
                </h3>
                <p className="text-[10px] text-slate-400 leading-none mt-1">
                  Chat with our team
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              className="text-slate-400 hover:text-white transition-all cursor-pointer p-1 rounded-full hover:bg-[#0f1720]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Team-follow-up banner if triggered */}
          {isEscalated && (
            <div className="bg-[#2563eb22] border-b border-white/10 px-4.5 py-2 flex items-center justify-between text-[10px] text-[#60a5fa] font-medium space-x-2 shrink-0">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-3.5 h-3.5 text-[#60a5fa]" />
                <span className="font-semibold">{escalationReason}</span>
              </div>
              <span className="bg-[#2563eb] text-white text-[9px] font-semibold px-1.5 py-0.5 rounded shrink-0">
                Pending
              </span>
            </div>
          )}

          {/* Messages Loop Area */}
          <div className="flex-1 overflow-y-auto px-4.5 py-5 space-y-4 bg-[#0b0f14] relative">
            
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
                      ? "bg-[#0f1720] text-[#60a5fa] border-[#2563eb33]" 
                      : "bg-[#2563eb22] text-white border-[#2563eb44]"
                  }`}>
                    {isBot ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                  </div>
                  <div className={`rounded-xl px-4 py-3 text-xs leading-relaxed font-sans shadow-lg whitespace-pre-line ${
                    isBot 
                      ? "bg-[#0f1720]/90 text-slate-100 rounded-tl-none border border-[#2563eb22]" 
                      : "bg-[#1e293b] text-white rounded-tr-none border border-[#2563eb33]"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              );
            })}

            {/* Typing indicator */}
            {loading && !isCapturingInfo && (
              <div className="flex items-center space-x-1.5 text-slate-400 text-xs py-2 pl-1.5">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#60a5fa]" />
                <span className="text-[#60a5fa] font-medium">
                  Shadow is typing...
                </span>
              </div>
            )}

            {/* Contact card prompt */}
            {isCapturingInfo && (
              <div className="bg-[#0f1720] border border-[#2563eb44] rounded-xl p-4 font-sans text-xs space-y-3.5 border-l-4 border-l-[#2563eb]">
                <div className="flex items-center space-x-2 text-white font-semibold">
                  <KeyRound className="w-4 h-4 text-[#60a5fa] shrink-0" />
                  <span>Share your contact details</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-normal">
                  This looks like something Uchi should follow up on directly. Leave your details and we&apos;ll reach out.
                </p>
                <form onSubmit={handleSaveContactDetails} className="space-y-2.5 text-white">
                  <input
                    type="text"
                    value={visitorName}
                    onChange={(e) => setVisitorName(e.target.value)}
                    placeholder="Your Full Name (e.g. Mwansa)"
                    className="w-full bg-[#0b0f14]/90 border border-[#2563eb33] rounded px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#2563eb]"
                    required
                  />
                  <input
                    type="text"
                    value={visitorContact}
                    onChange={(e) => setVisitorContact(e.target.value)}
                    placeholder="WhatsApp Phone or Verification Email"
                    className="w-full bg-[#0b0f14]/90 border border-[#2563eb33] rounded px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#2563eb]"
                    required
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold py-2 rounded text-[10px] cursor-pointer transition-all flex items-center justify-center space-x-1"
                  >
                    <Check className="w-3 h-3 shrink-0" />
                    <span>Send details</span>
                  </button>
                </form>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Form Control Footer */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-[#0b0f14]/95 border-t border-white/10 flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={isCapturingInfo ? "Please fill in your details first..." : "Ask about our services, pricing..."}
              disabled={loading || isCapturingInfo}
              className="flex-1 bg-[#0f1720]/90 border border-[#2563eb33] rounded-lg px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#2563eb] focus:bg-[#0f1720] transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !inputMessage.trim() || isCapturingInfo}
              className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-lg p-3 cursor-pointer transition-all disabled:opacity-50 flex items-center justify-center"
            >
              <Send className="w-3.5 h-3.5 text-white shrink-0" />
            </button>
          </form>

        </div>
      )}
    </div>
  );
}
