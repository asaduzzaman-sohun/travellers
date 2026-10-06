import Link from "next/link";
import {
  Compass,
  PhoneCall,
  MapPin,
  ShieldCheck,
  Heart,
  ExternalLink,
  Mail
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/[0.08] bg-[#040711] text-slate-400 text-xs">
      {/* 100% Full-Width Content Container with generous horizontal padding */}
      <div className="w-full px-4 sm:px-8 lg:px-12 2xl:px-16 py-14 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Column 1: Brand & Bangladesh Mission */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-teal-500 to-sky-600 flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
                <Compass className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                TourFlow <span className="text-teal-400 font-extrabold text-sm uppercase">BD</span>
              </span>
            </Link>
            <p className="text-slate-400 leading-relaxed text-xs max-w-sm">
              A peaceful domestic tourism portal crafted exclusively for Bangladeshi travelers. Dedicated to authentic hill tracts, serene haor houseboats, ancient tea estates, and sustainable leave-no-trace ecotourism across our motherland.
            </p>
            <div className="pt-2 text-[11px] text-slate-500 space-y-1">
              <div>Dhaka Central Hub: Motijheel / Banani, Dhaka-1213</div>
              <div>Emergency Tourist Assistance: <span className="text-teal-400 font-semibold">+880 1320-222222</span></div>
            </div>
          </div>

          {/* Column 2: Explore Divisions */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider text-teal-400">
              Divisional Expeditions
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/destinations?region=Chittagong" className="hover:text-teal-300 transition-colors">
                  Chittagong Hill Tracts (Sajek & Bandarban)
                </Link>
              </li>
              <li>
                <Link href="/destinations?region=Sylhet" className="hover:text-teal-300 transition-colors">
                  Sylhet & Sunamganj Haors
                </Link>
              </li>
              <li>
                <Link href="/destinations?region=Khulna" className="hover:text-teal-300 transition-colors">
                  Khulna & Sundarbans Mangrove
                </Link>
              </li>
              <li>
                <Link href="/destinations?region=Chittagong" className="hover:text-teal-300 transition-colors">
                  Cox&apos;s Bazar &amp; Inani Marine Drive
                </Link>
              </li>
              <li>
                <Link href="/destinations?region=Rajshahi" className="hover:text-teal-300 transition-colors">
                  Rajshahi &amp; Barind Heritage
                </Link>
              </li>
              <li>
                <Link href="/destinations?region=Barisal" className="hover:text-teal-300 transition-colors">
                  Barisal Floating Guava Markets
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Travel Guides & Community */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider text-sky-400">
              Travel Resources
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/tips" className="hover:text-white transition-colors">
                  Army Escort Schedules (Dighinala)
                </Link>
              </li>
              <li>
                <Link href="/tips" className="hover:text-white transition-colors">
                  Haor Boat Safety &amp; Lifejacket Rules
                </Link>
              </li>
              <li>
                <Link href="/hotels" className="hover:text-white transition-colors">
                  Verified Resort Reviews
                </Link>
              </li>
              <li>
                <Link href="/community" className="hover:text-white transition-colors">
                  Community Discussions &amp; Q&amp;A
                </Link>
              </li>
              <li>
                <Link href="/write-post" className="hover:text-white transition-colors">
                  Share Your Road &amp; Trip Report
                </Link>
              </li>
              <li>
                <Link href="/manage" className="hover:text-white transition-colors">
                  Check Booking &amp; Travel Voucher
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Tourist Safety & Helpline */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider text-teal-400">
              Safety &amp; Helplines
            </h4>
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-2">
              <div className="flex items-center gap-2 text-white font-semibold text-xs">
                <ShieldCheck className="h-4 w-4 text-teal-400" />
                <span>Tourist Police Bangladesh</span>
              </div>
              <div className="text-[11px] text-slate-300 font-mono">
                Hotline: 999 / +880 1320-222222
              </div>
              <p className="text-[10px] text-slate-500">
                Call for assistance in Sajek, Cox&apos;s Bazar, Jaflong, or Sreemangal.
              </p>
            </div>

            <div className="pt-1 text-[11px] text-slate-400 flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-teal-400" />
              <span>support@tourflow.com.bd</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Eco Statement */}
        <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <div>
            &copy; {new Date().getFullYear()} TourFlow BD. Built with love for Bangladeshi domestic explorers.
          </div>

          <div className="flex items-center gap-6">
            <Link href="/about" className="hover:text-white transition-colors">
              Our Story
            </Link>
            <Link href="/contact" className="hover:text-white transition-colors">
              Contact Desks
            </Link>
            <span className="text-teal-400 flex items-center gap-1 font-medium">
              <Heart className="h-3 w-3 fill-teal-400 text-teal-400" />
              Preserve Beautiful Bangladesh
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
