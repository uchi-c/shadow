import React, { useState } from "react";
import { Send, CheckCircle, ShieldAlert, ChevronRight, ChevronLeft } from "lucide-react";

interface QuoteFormProps {
  prefilledService?: string;
  prefilledMessage?: string;
}

export default function QuoteForm({ prefilledService = "", prefilledMessage = "" }: QuoteFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Form State with individual secure input data fields
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    service: prefilledService || "phishing_simulation",
    message: prefilledMessage || "",
    size: "1-10",
    hasTimeline: "flexible"
  });

  // Prefill service + message when arriving from a product / academy / tool CTA.
  React.useEffect(() => {
    if (prefilledService) {
      setFormData(prev => ({ ...prev, service: prefilledService }));
    }
  }, [prefilledService]);

  React.useEffect(() => {
    if (prefilledMessage) {
      setFormData(prev => ({ ...prev, message: prefilledMessage }));
    }
  }, [prefilledMessage]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateStep = (step: number): boolean => {
    setSubmitError("");
    if (step === 1) {
      if (!formData.name.trim()) {
        setSubmitError("Please fill out your Full Name.");
        return false;
      }
      if (!formData.email.trim() || !formData.email.includes("@")) {
        setSubmitError("A valid professional email address is required.");
        return false;
      }
      if (!formData.phone.trim()) {
        setSubmitError("Please provide a contact phone/WhatsApp number for takeover routing.");
        return false;
      }
    }
    if (step === 2) {
      if (!formData.message.trim() || formData.message.length < 10) {
        setSubmitError("Please describe your project or cybersecurity vulnerability challenge (min 10 characters).");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    setSubmitError("");
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(1) || !validateStep(2)) return;

    setLoading(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "An unexpected error occurred during submission.");
      }

      setSubmitSuccess(true);
      // Clear form inputs
      setFormData({
        name: "",
        company: "",
        email: "",
        phone: "",
        service: "phishing_simulation",
        message: "",
        size: "1-10",
        hasTimeline: "flexible"
      });
    } catch (err: any) {
      setSubmitError(err.message || "Failed to catalog lead. Please check your connectivity.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="quote" className="bg-transparent py-16 border-b border-[#2563eb33] font-sans">
      <div className="max-w-4xl mx-auto px-4 md:px-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 flex flex-col space-y-4">
          <div className="text-xs font-mono font-bold tracking-widest text-[#60a5fa] uppercase">
            Inquiry Center
          </div>
          <h2 className="font-display font-bold text-3xl text-white tracking-tight leading-none">
            Book a secure consultation
          </h2>
          <p className="text-sm text-slate-400">
            Tell us about your organization or project parameters. CEO Uchi Chinyama will securely review your case metrics and respond within business hours.
          </p>
        </div>

        {/* Multi-step card container */}
        <div className="bg-[#0f1720]/70 rounded-2xl border border-[#2563eb33] p-6 md:p-8 shadow-2xl relative">
          
          {submitSuccess ? (
            <div 
              className="flex flex-col items-center justify-center text-center py-12 space-y-5 font-sans"
              aria-live="polite"
            >
              <div className="bg-emerald-950/20 text-emerald-400 border border-emerald-800/40 p-3 h-16 w-16 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                <CheckCircle className="w-10 h-10 shrink-0" />
              </div>
              <div className="space-y-2 max-w-md">
                <h3 className="font-display font-medium text-white text-xl">Consultation Securely Logged</h3>
                <p className="text-xs text-slate-400 leading-normal">
                  Thank you! Your security inquiry data has been locked and recorded in our local parameterized records file. General takeover has routed alerts directly to Uchi. We will reach back using WhatsApp or email shortly.
                </p>
              </div>
              <button
                onClick={() => {
                  setSubmitSuccess(false);
                  setCurrentStep(1);
                }}
                className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-5 py-2.5 rounded-lg text-xs font-semibold cursor-pointer transition-all shadow-[0_0_12px_#2563eb] focus-visible:ring-2 focus-visible:ring-[#2563eb] focus:outline-none"
                aria-label="Submit another consultation inquiry form"
              >
                Submit another inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="font-sans">
              {/* Step indicator pipeline */}
              <div 
                className="flex items-center justify-between mb-8 pb-4 border-b border-white/5 text-xs font-mono font-bold text-slate-400"
                aria-label="Multi-step form progress pipeline"
              >
                <div className="flex items-center space-x-2">
                  <span 
                    className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                      currentStep === 1 ? "bg-[#2563eb] text-white border-[#2563eb] shadow-[0_0_10px_#2563eb]" : "bg-[#0b0f14]/60 border-white/10 text-slate-400"
                    }`}
                    aria-current={currentStep === 1 ? "step" : undefined}
                  >1</span>
                  <span className={currentStep === 1 ? "text-white" : "text-slate-500"}>CONTACT CREDS</span>
                </div>
                <div className="h-px bg-white/5 grow mx-4 hidden sm:block"></div>
                <div className="flex items-center space-x-2">
                  <span 
                    className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                      currentStep === 2 ? "bg-[#2563eb] text-white border-[#2563eb] shadow-[0_0_10px_#2563eb]" : "bg-[#0b0f14]/60 border-white/10 text-slate-400"
                    }`}
                    aria-current={currentStep === 2 ? "step" : undefined}
                  >2</span>
                  <span className={currentStep === 2 ? "text-white" : "text-slate-500"}>SCOPE DETAILS</span>
                </div>
              </div>

              {/* Error Callout */}
              {submitError && (
                <div 
                  className="mb-6 bg-red-950/20 border border-red-900/40 p-4 rounded-xl flex items-center space-x-3 text-red-400 text-xs"
                  aria-live="assertive"
                >
                  <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* STEP 1 FIELDS */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1.5 flex flex-col">
                      <label htmlFor="quote-name" className="text-xs font-bold text-slate-300 uppercase tracking-wide font-mono">Full Name *</label>
                      <input
                        id="quote-name"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Uchi Chinyama"
                        className="w-full bg-[#0b0f14]/80 border border-[#2563eb33] rounded-lg px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#2563eb] focus:bg-[#0b0f14] transition-all focus-visible:ring-2 focus-visible:ring-[#2563eb]"
                        required
                        aria-required="true"
                      />
                    </div>
                    <div className="space-y-1.5 flex flex-col">
                      <label htmlFor="quote-company" className="text-xs font-bold text-slate-300 uppercase tracking-wide font-mono">Company / Organization</label>
                      <input
                        id="quote-company"
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        placeholder="Local NGO or Scaleup Brand"
                        className="w-full bg-[#0b0f14]/80 border border-[#2563eb33] rounded-lg px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#2563eb] focus:bg-[#0b0f14] transition-all focus-visible:ring-2 focus-visible:ring-[#2563eb]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1.5 flex flex-col">
                      <label htmlFor="quote-email" className="text-xs font-bold text-slate-300 uppercase tracking-wide font-mono">Primary Email *</label>
                      <input
                        id="quote-email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="client@mail.org"
                        className="w-full bg-[#0b0f14]/80 border border-[#2563eb33] rounded-lg px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#2563eb] focus:bg-[#0b0f14] transition-all focus-visible:ring-2 focus-visible:ring-[#2563eb]"
                        required
                        aria-required="true"
                      />
                    </div>
                    <div className="space-y-1.5 flex flex-col">
                      <label htmlFor="quote-phone" className="text-xs font-bold text-slate-300 uppercase tracking-wide font-mono">Phone / WhatsApp Number *</label>
                      <input
                        id="quote-phone"
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="0979501830"
                        className="w-full bg-[#0b0f14]/80 border border-[#2563eb33] rounded-lg px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#2563eb] focus:bg-[#0b0f14] transition-all focus-visible:ring-2 focus-visible:ring-[#2563eb]"
                        required
                        aria-required="true"
                      />
                    </div>
                  </div>

                  {/* Service Preference Dropdown */}
                  <div className="space-y-1.5 flex flex-col">
                    <label htmlFor="quote-service" className="text-xs font-bold text-slate-300 uppercase tracking-wide font-mono">Service of Interest</label>
                    <select
                      id="quote-service"
                      name="service"
                      value={formData.service}
                      onChange={handleInputChange}
                      className="w-full bg-[#0b0f14]/85 border border-[#2563eb33] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#2563eb] focus:bg-[#0b0f14] transition-all focus-visible:ring-2 focus-visible:ring-[#2563eb]"
                    >
                      <option className="bg-[#0f1720] text-white" value="phishing_simulation">Phishing Simulations campaign</option>
                      <option className="bg-[#0f1720] text-white" value="secure_web_dev">Secure React/Full-Stack Development</option>
                      <option className="bg-[#0f1720] text-white" value="pentest_audits">Penetration Audit pen-test / retainer</option>
                      <option className="bg-[#0f1720] text-white" value="ai_workflows">Custom Google Gemini AI integration</option>
                      <option className="bg-[#0f1720] text-white" value="uruu">URUU platform (early access)</option>
                      <option className="bg-[#0f1720] text-white" value="academy">Shadow Root Academy</option>
                      <option className="bg-[#0f1720] text-white" value="consultation">General Strategy Discussion</option>
                    </select>
                  </div>
                </div>
              )}

              {/* STEP 2 FIELDS */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1.5 flex flex-col">
                      <label htmlFor="quote-size" className="text-xs font-bold text-slate-300 uppercase tracking-wide font-mono">Organization Size</label>
                      <select
                        id="quote-size"
                        name="size"
                        value={formData.size}
                        onChange={handleInputChange}
                        className="w-full bg-[#0b0f14]/85 border border-[#2563eb33] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#2563eb] focus:bg-[#0b0f14] transition-all focus-visible:ring-2 focus-visible:ring-[#2563eb]"
                      >
                        <option className="bg-[#0f1720] text-white" value="1-10">1 to 10 staff (Micro/Startup)</option>
                        <option className="bg-[#0f1720] text-white" value="11-50">11 to 50 staff (SME/Standard NGO)</option>
                        <option className="bg-[#0f1720] text-white" value="51-100">51 to 100 staff</option>
                        <option className="bg-[#0f1720] text-white" value="100+">100+ staff (Enterprise)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5 flex flex-col">
                      <label htmlFor="quote-timeline" className="text-xs font-bold text-slate-300 uppercase tracking-wide font-mono">Desired Project Timeline</label>
                      <select
                        id="quote-timeline"
                        name="hasTimeline"
                        value={formData.hasTimeline}
                        onChange={handleInputChange}
                        className="w-full bg-[#0b0f14]/85 border border-[#2563eb33] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#2563eb] focus:bg-[#0b0f14] transition-all focus-visible:ring-2 focus-visible:ring-[#2563eb]"
                      >
                        <option className="bg-[#0f1720] text-white" value="emergency">Emergency Incident Response / Critical Breach</option>
                        <option className="bg-[#0f1720] text-white" value="urgent">Urgent Launch (Next 30 days)</option>
                        <option className="bg-[#0f1720] text-white" value="flexible">Flexible / Planning Phase</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5 flex flex-col">
                    <label htmlFor="quote-message" className="text-xs font-bold text-slate-300 uppercase tracking-wide font-mono">Project Details / Security Focus *</label>
                    <textarea
                      id="quote-message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={5}
                      placeholder="Describe your current system challenges, specific anti-phishing training goals, or Web/AI portal ideas. This input is escapable and encrypted on server write."
                      className="w-full bg-[#0b0f14]/80 border border-[#2563eb33] rounded-lg p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#2563eb] focus:bg-[#0b0f14] transition-all resize-none focus-visible:ring-2 focus-visible:ring-[#2563eb]"
                      required
                      aria-required="true"
                    ></textarea>
                    <div className="text-[10px] text-slate-500 text-right">
                      Max characters: 3000
                    </div>
                  </div>
                </div>
              )}

              {/* Form Navigation Controls */}
              <div className="mt-8 pt-6 border-t border-white/5 flex justify-between">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="bg-[#0b0f14]/60 border border-white/10 hover:bg-slate-800 text-slate-200 px-5 py-2.5 rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center space-x-1 focus-visible:ring-2 focus-visible:ring-[#2563eb] focus:outline-none"
                  >
                    <ChevronLeft className="w-4 h-4 shrink-0" />
                    <span>Back</span>
                  </button>
                ) : (
                  <div></div>
                )}

                {currentStep < 2 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-5 py-2.5 rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center space-x-1 shadow-[0_0_12px_#2563eb] ml-auto focus-visible:ring-2 focus-visible:ring-[#2563eb] focus:outline-none"
                  >
                    <span>Continue</span>
                    <ChevronRight className="w-4 h-4 shrink-0" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-6 py-2.5 rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center space-x-2 disabled:opacity-50 ml-auto shadow-[0_0_15px_#2563eb] focus-visible:ring-2 focus-visible:ring-[#2563eb] focus:outline-none"
                  >
                    {loading ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        <span>Cataloging...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5 shrink-0" />
                        <span>Secure Consultation Inquiry</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}
