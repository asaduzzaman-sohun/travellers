"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  PhoneCall,
  MapPin,
  ShieldCheck,
  Heart,
  Mail,
  ChevronRight
} from "lucide-react";

export default function Footer() {
  const pathname = usePathname();
  const isDashboardRoute = pathname.startsWith("/profile") || pathname.startsWith("/admin") || pathname.startsWith("/manage");

  if (isDashboardRoute) {
    return null;
  }

  return (
    <footer className="w-full border-t border-[#EBE6DC] bg-[#F5F2EB] text-stone-600 text-sm">
      {/* Container matching standard website width */}
      <div className="w-full max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-14 2xl:px-20 py-16 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Column 1: Brand & Bangladesh Mission (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block group">
              <span className="font-serif text-3xl font-bold tracking-tight text-stone-900 group-hover:text-stone-700 transition-colors">
                Traveller&apos;s
              </span>
            </Link>
            <p className="text-stone-600 leading-relaxed text-sm sm:text-base max-w-md">
              A peaceful domestic travel space crafted for Bangladeshi explorers. Dedicated exclusively to authentic hill tracts, serene haors, tea valleys, and sustainable leave-no-trace ecotourism across all 8 divisions.
            </p>
            <div className="pt-2 text-xs sm:text-sm text-stone-500 space-y-1.5">
              <div>Tourist Police Hotline: <span className="text-stone-900 font-bold">999 / +880 1320-222222</span></div>
              <div>Operations Email: <span className="text-stone-900 font-semibold">support@travellers.com.bd</span></div>
              <div>Headquarters: <span className="text-stone-800">Banani, Dhaka-1213, Bangladesh</span></div>
            </div>
          </div>

          {/* Column 2: Divisional Expeditions */}
          <div className="space-y-4">
            <h4 className="text-xs sm:text-sm font-bold text-stone-900 uppercase tracking-wider">
              Divisional Expeditions
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/destinations?region=Chittagong" className="hover:text-stone-950 transition-colors">
                  Chittagong Hill Tracts (Sajek &amp; Bandarban)
                </Link>
              </li>
              <li>
                <Link href="/destinations?region=Sylhet" className="hover:text-stone-950 transition-colors">
                  Sylhet &amp; Sunamganj (Tanguar Haor)
                </Link>
              </li>
              <li>
                <Link href="/destinations?region=Khulna" className="hover:text-stone-950 transition-colors">
                  Khulna (Sundarbans Eco Cruise)
                </Link>
              </li>
              <li>
                <Link href="/destinations?region=Barishal" className="hover:text-stone-950 transition-colors">
                  Barishal Backwaters &amp; Kuakata
                </Link>
              </li>
              <li>
                <Link href="/destinations?region=Rajshahi" className="hover:text-stone-950 transition-colors">
                  Rajshahi &amp; Paharpur Heritage
                </Link>
              </li>
              <li>
                <Link href="/destinations?region=Rangpur" className="hover:text-stone-950 transition-colors">
                  Rangpur &amp; Kantajew Terracotta
                </Link>
              </li>
              <li>
                <Link href="/destinations?region=Mymensingh" className="hover:text-stone-950 transition-colors">
                  Mymensingh &amp; Birishiri Hills
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Travel Guides & Community */}
          <div className="space-y-4">
            <h4 className="text-xs sm:text-sm font-bold text-stone-900 uppercase tracking-wider">
              Travel Resources
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/tips" className="hover:text-stone-950 transition-colors">
                  Army Escort Schedules (Dighinala)
                </Link>
              </li>
              <li>
                <Link href="/tips" className="hover:text-stone-950 transition-colors">
                  Haor Boat Safety &amp; Lifejacket Rules
                </Link>
              </li>
              <li>
                <Link href="/hotels" className="hover:text-stone-950 transition-colors">
                  Resort &amp; Cottage Reviews
                </Link>
              </li>
              <li>
                <Link href="/community" className="hover:text-stone-950 transition-colors">
                  Community Discussions &amp; Stories
                </Link>
              </li>
              <li>
                <Link href="/write-post" className="hover:text-stone-950 transition-colors">
                  Write &amp; Share Trip Story
                </Link>
              </li>
              <li>
                <Link href="/profile?tab=expeditions" className="hover:text-stone-950 transition-colors">
                  Retrieve Booking Voucher
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Domestic Ecotourism Ethics */}
          <div className="space-y-4">
            <h4 className="text-xs sm:text-sm font-bold text-stone-900 uppercase tracking-wider">
              Leave No Trace
            </h4>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Never dispose single-use plastics into wetlands or rivers. Always support local boatmen and indigenous families with fair rates and courtesy.
            </p>
            <div className="pt-2 flex flex-col space-y-2 text-xs sm:text-sm">
              <Link href="/about" className="hover:text-stone-950 font-medium transition-colors">
                About Our Heritage &amp; Ethos
              </Link>
              <Link href="/contact" className="hover:text-stone-950 font-medium transition-colors">
                Regional Desks &amp; Support
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#E5DFD5] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-stone-500">
          <div>
            &copy; {new Date().getFullYear()} <strong className="text-stone-800">Traveller&apos;s</strong>. Built for peaceful journeys across Bangladesh.
          </div>
          <div className="flex items-center gap-6">
            <Link href="/tips" className="hover:text-stone-800 transition-colors">
              Security Protocol
            </Link>
            <span>•</span>
            <Link href="/about" className="hover:text-stone-800 transition-colors">
              Community Guidelines
            </Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-stone-800 transition-colors">
              Tourist Police Assistance
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
