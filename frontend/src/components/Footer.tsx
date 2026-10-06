import Link from "next/link";
import { Compass, PhoneCall, ShieldCheck, Heart, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#050812] border-t border-slate-900 text-slate-400 text-xs">
      {/* Bangladesh Emergency & Tourism Helpline Strip */}
      <div className="border-b border-slate-900/80 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-[12px]">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-slate-300">
            <span className="flex items-center gap-1.5 text-teal-400 font-semibold">
              <ShieldCheck className="h-4 w-4" />
              Tourist Police Bangladesh Helpline:
            </span>
            <span className="font-mono text-white bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              +880 1320-222222
            </span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="text-slate-400">
              National Emergency Service: <strong className="text-white">999</strong>
            </span>
          </div>

          <div className="text-slate-500 text-[11px] text-center md:text-right">
            <span>Travel responsibly • Protect our rivers, haors & mangrove forests</span>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <div className="h-7 w-7 rounded-lg bg-teal-600 flex items-center justify-center text-white">
                <Compass className="h-4 w-4" />
              </div>
              <span>TourFlow Bangladesh</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              A serene travel guide and community dedicated to uncovering the peaceful natural wonders, green hill tracts, and heritage of Bangladesh.
            </p>
            <div className="text-[11px] text-slate-500 pt-1">
              Dhaka, Chittagong, Sylhet & Cox's Bazar Support Hubs
            </div>
          </div>

          {/* Divisions */}
          <div className="space-y-2.5">
            <h4 className="text-white text-xs font-bold uppercase tracking-wider">Top Destinations</h4>
            <ul className="space-y-1.5">
              <li><Link href="/destinations" className="hover:text-teal-300 transition-colors">Sajek Valley (Rangamati)</Link></li>
              <li><Link href="/destinations" className="hover:text-teal-300 transition-colors">Tanguar Haor (Sunamganj)</Link></li>
              <li><Link href="/destinations" className="hover:text-teal-300 transition-colors">Sreemangal Tea Estates</Link></li>
              <li><Link href="/destinations" className="hover:text-teal-300 transition-colors">Cox's Bazar & Marine Drive</Link></li>
              <li><Link href="/destinations" className="hover:text-teal-300 transition-colors">Sundarbans Mangrove</Link></li>
              <li><Link href="/destinations" className="hover:text-teal-300 transition-colors">Bandarban Nilgiri</Link></li>
            </ul>
          </div>

          {/* Quick Guides */}
          <div className="space-y-2.5">
            <h4 className="text-white text-xs font-bold uppercase tracking-wider">Traveler Resources</h4>
            <ul className="space-y-1.5">
              <li><Link href="/tips" className="hover:text-teal-300 transition-colors">Travel Tips & Packing Guides</Link></li>
              <li><Link href="/hotels" className="hover:text-teal-300 transition-colors">Verified Hotel & Resort Reviews</Link></li>
              <li><Link href="/community" className="hover:text-teal-300 transition-colors">Community Forum & Q&A</Link></li>
              <li><Link href="/about" className="hover:text-teal-300 transition-colors">About TourFlow BD</Link></li>
              <li><Link href="/contact" className="hover:text-teal-300 transition-colors">Contact & Support</Link></li>
            </ul>
          </div>

          {/* Eco Principles */}
          <div className="space-y-2.5">
            <h4 className="text-white text-xs font-bold uppercase tracking-wider">Responsible Travel</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Help preserve Bangladesh’s fragile natural ecosystems. Please bring all non-biodegradable waste back from Saint Martin's, haors, and hill summits.
            </p>
            <div className="pt-2 text-[11px] text-teal-400 flex items-center gap-1">
              <Heart className="h-3.5 w-3.5 fill-teal-400" />
              <span>Leave nothing but footprints, take nothing but memories.</span>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
          <div>
            © {new Date().getFullYear()} TourFlow Bangladesh. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <Link href="/about" className="hover:text-slate-400">About</Link>
            <Link href="/contact" className="hover:text-slate-400">Contact</Link>
            <Link href="/tips" className="hover:text-slate-400">Guidelines</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
