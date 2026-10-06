"use client";

import { useState } from "react";
import { PhoneCall, Mail, MapPin, Send, CheckCircle2, ShieldCheck } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="space-y-2 text-center sm:text-left">
        <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">
          Get in Touch
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Contact TourFlow Bangladesh
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
          Questions regarding itineraries, local guide contacts, or road conditions? Send us a message or reach our local community leads.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contact Info & Helplines */}
        <div className="space-y-6">
          <div className="bg-[#0b1120] border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-teal-400" />
              National Traveler Helplines
            </h3>

            <div className="space-y-3 text-xs text-slate-300">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Tourist Police 24/7 Hotline</span>
                <span className="font-mono text-sm font-bold text-teal-300">+880 1320-222222</span>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">National Emergency Service</span>
                <span className="font-mono text-sm font-bold text-white">999</span>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Community Support Email</span>
                <span className="text-slate-200">help@tourflowbd.com</span>
              </div>
            </div>
          </div>

          <div className="bg-[#0b1120] border border-slate-800 rounded-2xl p-6 space-y-3 text-xs text-slate-300">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MapPin className="h-4 w-4 text-sky-400" />
              Regional Coordinator Hubs
            </h3>
            <ul className="space-y-2 text-slate-400">
              <li>• <strong>Dhaka:</strong> Banani, Road 11, Dhaka 1213</li>
              <li>• <strong>Sylhet:</strong> Zindabazar, Sylhet 3100</li>
              <li>• <strong>Chittagong:</strong> GEC Circle, Chittagong 4000</li>
            </ul>
          </div>
        </div>

        {/* Message Form */}
        <div className="bg-[#0b1120] border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-sm">
          {submitted ? (
            <div className="py-12 text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-teal-500/10 text-teal-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h4 className="text-base font-bold text-white">Message Received!</h4>
              <p className="text-xs text-slate-400">
                A member of our community team will reply within 24 hours.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-2 text-xs text-teal-400 underline"
              >
                Send another note
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <h3 className="text-sm font-bold text-white">Send an Inquiry or Tip</h3>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Your Name</label>
                <input
                  type="text"
                  placeholder="e.g. Asadur Rahman"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Phone / WhatsApp</label>
                <input
                  type="tel"
                  placeholder="+880 1700-000000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Message or Query</label>
                <textarea
                  rows={4}
                  placeholder="Ask about guide contacts, road safety, or family booking advice..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold transition-all shadow"
              >
                Submit Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
