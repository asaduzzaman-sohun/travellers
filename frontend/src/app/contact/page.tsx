"use client";

import { useState } from "react";
import { Send, CheckCircle2, ShieldCheck, MapPin, Phone, Mail, Clock } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [division, setDivision] = useState("Dhaka");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !message.trim()) return;
    setSubmitted(true);
  };

  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] pb-24">
      {/* Header Banner */}
      <section className="border-b border-[#EBE6DC] bg-[#FAF8F5] py-14 sm:py-16">
        <div className="w-full max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-14 2xl:px-20 space-y-4">
          <span className="text-xs sm:text-sm font-semibold tracking-widest uppercase text-amber-800">
            Get in Touch &amp; Field Desks
          </span>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-stone-900 tracking-tight">
            Contact Traveller&apos;s
          </h1>
          <p className="text-base sm:text-lg text-stone-600 max-w-3xl leading-relaxed">
            Questions regarding tour itineraries, local guide connections, road conditions, or army escort timings? Reach out to our team or regional field desks.
          </p>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="w-full max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-14 2xl:px-20 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Contact Info & Helplines (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-[#EBE6DC] rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
              <h3 className="text-xl font-serif font-bold text-stone-900 flex items-center gap-2.5">
                <ShieldCheck className="h-5 w-5 text-amber-800" />
                Emergency &amp; Police Desks
              </h3>

              <div className="space-y-4 text-xs sm:text-sm text-stone-600">
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5] space-y-1">
                  <span className="text-stone-500 block text-[11px] uppercase font-bold tracking-wider">Tourist Police 24/7 Hotline</span>
                  <span className="font-mono text-lg font-bold text-stone-900">+880 1320-222222</span>
                  <p className="text-xs text-stone-500 pt-0.5">Immediate security assistance in Sajek, Cox&apos;s Bazar, Sreemangal, and Kuakata.</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5] space-y-1">
                  <span className="text-stone-500 block text-[11px] uppercase font-bold tracking-wider">National Emergency Number</span>
                  <span className="font-mono text-lg font-bold text-stone-900">999</span>
                  <p className="text-xs text-stone-500 pt-0.5">Police, Ambulance, and Fire Service across Bangladesh.</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5] space-y-1">
                  <span className="text-stone-500 block text-[11px] uppercase font-bold tracking-wider">Operations Desk Email</span>
                  <span className="text-stone-900 font-semibold block text-sm">support@travellers.com.bd</span>
                  <span className="text-stone-500 text-xs">Response time within 4 hours</span>
                </div>
              </div>
            </div>

            {/* Regional Hubs */}
            <div className="bg-white border border-[#EBE6DC] rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm">
              <h3 className="text-xl font-serif font-bold text-stone-900 flex items-center gap-2.5">
                <MapPin className="h-5 w-5 text-amber-800" />
                Divisional Travel Hubs
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs sm:text-sm">
                <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5]">
                  <strong className="text-stone-900 block font-bold">Dhaka Hub:</strong>
                  <span className="text-stone-500">Banani / Sayedabad Counters</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5]">
                  <strong className="text-stone-900 block font-bold">Sylhet Hub:</strong>
                  <span className="text-stone-500">Sunamganj Ghat / Sreemangal</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5]">
                  <strong className="text-stone-900 block font-bold">Chittagong Hub:</strong>
                  <span className="text-stone-500">Dighinala Army Checkpost Desk</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5]">
                  <strong className="text-stone-900 block font-bold">Khulna Hub:</strong>
                  <span className="text-stone-500">Mongla Port Vessel Terminal</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Send Message Form (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-[#EBE6DC] rounded-3xl p-6 sm:p-10 lg:p-12 shadow-sm flex flex-col justify-between">
            <div>
              <div className="mb-6 space-y-2">
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">Send Us An Inquiry</h2>
                <p className="text-sm text-stone-500">
                  Our domestic travel specialists respond within 24 hours with verified field updates and local guidance.
                </p>
              </div>

              {submitted ? (
                <div className="py-16 text-center space-y-4 bg-[#FAF8F5] rounded-3xl border border-[#E5DFD5] p-8">
                  <div className="h-16 w-16 mx-auto rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-stone-900">Message Received!</h3>
                  <p className="text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
                    Thank you, <strong className="text-stone-900">{name}</strong>. Our field coordinator will review your inquiry and reach out via phone or email shortly.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setName("");
                      setPhone("");
                      setEmail("");
                      setMessage("");
                    }}
                    className="mt-2 px-6 py-2.5 rounded-full bg-stone-900 text-stone-50 text-xs sm:text-sm font-semibold hover:bg-stone-800 transition-colors"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs sm:text-sm font-semibold text-stone-800">Your Full Name *</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Tanvir Ahmed"
                        className="w-full px-4 py-3 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5] text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 transition-colors"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs sm:text-sm font-semibold text-stone-800">Contact Number *</label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. 01712-345678"
                        className="w-full px-4 py-3 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5] text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs sm:text-sm font-semibold text-stone-800">Email Address (Optional)</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. tanvir@example.com"
                        className="w-full px-4 py-3 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5] text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 transition-colors"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs sm:text-sm font-semibold text-stone-800">Destination of Interest</label>
                      <select
                        value={division}
                        onChange={(e) => setDivision(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5] text-sm font-medium text-stone-900 focus:outline-none focus:border-stone-900 transition-colors cursor-pointer"
                      >
                        <option value="Sajek">Sajek Valley &amp; Rangamati</option>
                        <option value="Bandarban">Bandarban (Nilgiri &amp; Keokradong)</option>
                        <option value="Tanguar">Tanguar Haor &amp; Sunamganj</option>
                        <option value="Sreemangal">Sreemangal &amp; Lawachara</option>
                        <option value="CoxsBazar">Cox&apos;s Bazar &amp; Inani</option>
                        <option value="SaintMartin">Saint Martin&apos;s Island</option>
                        <option value="Sundarbans">Sundarbans Eco Cruise</option>
                        <option value="Barishal">Barishal Floating Canals</option>
                        <option value="NorthBengal">Paharpur &amp; North Heritage</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs sm:text-sm font-semibold text-stone-800">Your Message or Travel Query *</label>
                    <textarea
                      required
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Please mention dates, number of travelers, budget constraints, or any specific accommodation preferences..."
                      className="w-full px-4 py-3 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5] text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-6 rounded-2xl bg-stone-900 hover:bg-stone-800 text-stone-50 font-semibold text-sm transition-all shadow-xs flex items-center justify-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    <span>Submit Inquiry</span>
                  </button>
                </form>
              )}
            </div>

            <div className="pt-6 border-t border-[#F0EBE1] text-xs text-stone-400 flex items-center justify-between">
              <span>Security Guarantee: Your contact info is strictly confidential.</span>
              <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> 9:00 AM – 9:00 PM BST</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
