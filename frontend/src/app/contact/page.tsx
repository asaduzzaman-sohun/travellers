"use client";

import { useState } from "react";
import { PhoneCall, Mail, MapPin, Send, CheckCircle2, ShieldCheck, Clock, MessageSquare } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [division, setDivision] = useState("Dhaka");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-8 lg:px-12 2xl:px-16 py-12 space-y-12">
      {/* Title */}
      <div className="space-y-3">
        <span className="text-xs font-bold text-teal-400 uppercase tracking-widest">
          Get in Touch &amp; Field Desks
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Contact TourFlow Bangladesh
        </h1>
        <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
          Questions regarding tour itineraries, local guide connections, road conditions, or army escort timings? Reach out to our team or regional field desks.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Contact Info & Helplines (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#080d1d] border border-white/[0.08] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-teal-400" />
              National Emergency &amp; Police Desks
            </h3>

            <div className="space-y-4 text-xs text-slate-300">
              <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.06] space-y-1">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Tourist Police 24/7 Hotline</span>
                <span className="font-mono text-base font-bold text-teal-300">+880 1320-222222</span>
                <p className="text-[11px] text-slate-500">Immediate security assistance in Sajek, Cox&apos;s Bazar, Sreemangal, and Kuakata.</p>
              </div>

              <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.06] space-y-1">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">National Emergency Number</span>
                <span className="font-mono text-base font-bold text-white">999</span>
                <p className="text-[11px] text-slate-500">Police, Ambulance, and Fire Service across Bangladesh.</p>
              </div>

              <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.06] space-y-1">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Operations Support Email</span>
                <span className="text-slate-200 font-medium">support@tourflow.com.bd</span>
              </div>
            </div>
          </div>

          <div className="bg-[#080d1d] border border-white/[0.08] rounded-3xl p-6 sm:p-8 space-y-4 text-xs text-slate-300 shadow-xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <MapPin className="h-5 w-5 text-sky-400" />
              Divisional Travel Hubs
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/[0.06]">
                <strong className="text-white block">Dhaka Hub:</strong>
                <span className="text-slate-400">Banani / Sayedabad Bus Counters</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/[0.06]">
                <strong className="text-white block">Sylhet Hub:</strong>
                <span className="text-slate-400">Sunamganj Ghat / Sreemangal Station</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/[0.06]">
                <strong className="text-white block">Chittagong Hub:</strong>
                <span className="text-slate-400">Dighinala Army Checkpost Desk</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/[0.06]">
                <strong className="text-white block">Khulna Hub:</strong>
                <span className="text-slate-400">Mongla Port Vessel Terminal</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Send Message Form (7 cols) */}
        <div className="lg:col-span-7 bg-[#080d1d] border border-white/[0.08] rounded-3xl p-6 sm:p-10 shadow-xl">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white">Send Us An Inquiry</h2>
            <p className="text-xs text-slate-400 mt-1">
              Our travel specialists respond within 24 hours with verified field updates.
            </p>
          </div>

          {submitted ? (
            <div className="py-12 text-center space-y-4">
              <div className="h-14 w-14 mx-auto rounded-full bg-teal-500/10 text-teal-400 flex items-center justify-center">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-white">Message Received!</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Thank you, {name}. Our Bangladesh operations coordinator will review your request and reach out.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setName("");
                  setPhone("");
                  setEmail("");
                  setMessage("");
                }}
                className="px-5 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-bold"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1.5 font-medium">Your Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Tanvir Ahmed"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-black/40 border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1.5 font-medium">Phone / WhatsApp</label>
                  <input
                    type="tel"
                    placeholder="+880 1711-234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-black/40 border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1.5 font-medium">Email Address</label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black/40 border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1.5 font-medium">Destination of Interest</label>
                  <select
                    value={division}
                    onChange={(e) => setDivision(e.target.value)}
                    className="w-full bg-black/40 border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
                  >
                    <option value="Sajek">Sajek Valley &amp; Rangamati</option>
                    <option value="Haor">Tanguar Haor &amp; Sunamganj</option>
                    <option value="Sreemangal">Sreemangal Tea Estates</option>
                    <option value="Cox">Cox&apos;s Bazar &amp; Inani</option>
                    <option value="Sundarbans">Sundarbans Mangrove Safari</option>
                    <option value="Bandarban">Bandarban Mountain Trails</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1.5 font-medium">Your Message or Question</label>
                <textarea
                  rows={5}
                  placeholder="Ask about travel dates, vehicle rates, escort schedules, or custom group bookings..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-black/40 border border-white/[0.1] rounded-xl p-3.5 text-white focus:outline-none focus:ring-1 focus:ring-teal-500 leading-relaxed"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-sky-600 hover:from-teal-400 hover:to-sky-500 text-white font-bold text-xs shadow-lg shadow-teal-500/20 transition-all"
                >
                  <Send className="h-4 w-4" />
                  <span>Send Message</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
