import Link from "next/link";
import { Compass, ShieldCheck, Award, HeartHandshake, Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 text-xs">
      {/* Trust & Guarantee Banner */}
      <div className="border-b border-slate-900 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex items-start gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-white text-sm font-bold mb-1">100% Guaranteed Departures</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Once booked, your expedition will never be canceled due to low passenger numbers.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-white text-sm font-bold mb-1">Expert Local Leaders</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Led by certified UIAGM mountain guides, marine biologists, and native cultural historians.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <HeartHandshake className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-white text-sm font-bold mb-1">Certified Carbon Neutral</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                We offset 100% of emissions from ground transit, lodging, and expedition operations.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-white text-sm font-bold mb-1">24/7 Global Concierge</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Dedicated round-the-clock operations team on standby while you are in the field.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Compass className="h-5 w-5" />
              </div>
              <span className="text-lg font-black tracking-tight text-white">TOURFLOW EXPEDITIONS</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              We design transformative journeys and small-group expeditions across the world’s most pristine wilderness and storied heritage corridors. Registered member of the Adventure Travel Trade Association (ATTA).
            </p>
            <div className="pt-2 text-slate-500 text-[11px] space-y-1">
              <div>Global HQ: 450 Lexington Avenue, Suite 1900, New York, NY 10017</div>
              <div>UK Concierge: 25 St James's Square, London SW1Y 4JH</div>
            </div>
          </div>

          {/* Col 1 */}
          <div>
            <h5 className="text-white text-xs font-bold uppercase tracking-wider mb-4">Destinations</h5>
            <ul className="space-y-2.5">
              <li><Link href="/tours?region=Americas" className="hover:text-white transition-colors">Patagonia & Andes</Link></li>
              <li><Link href="/tours?region=Africa" className="hover:text-white transition-colors">Serengeti & Tanzania</Link></li>
              <li><Link href="/tours?region=Europe" className="hover:text-white transition-colors">Amalfi & Swiss Alps</Link></li>
              <li><Link href="/tours?region=Asia" className="hover:text-white transition-colors">Japan & Kumano Kodo</Link></li>
              <li><Link href="/tours?region=Europe" className="hover:text-white transition-colors">Icelandic Arctic</Link></li>
              <li><Link href="/tours?region=Africa" className="hover:text-white transition-colors">Morocco & Sahara</Link></li>
            </ul>
          </div>

          {/* Col 2 */}
          <div>
            <h5 className="text-white text-xs font-bold uppercase tracking-wider mb-4">Expedition Styles</h5>
            <ul className="space-y-2.5">
              <li><Link href="/tours" className="hover:text-white transition-colors">High-Altitude Trekking</Link></li>
              <li><Link href="/tours" className="hover:text-white transition-colors">Wildlife & Big Five Safaris</Link></li>
              <li><Link href="/tours" className="hover:text-white transition-colors">Pilgrimages & Spiritual</Link></li>
              <li><Link href="/tours" className="hover:text-white transition-colors">Private Yacht Expeditions</Link></li>
              <li><Link href="/tours" className="hover:text-white transition-colors">Arctic & Northern Lights</Link></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h5 className="text-white text-xs font-bold uppercase tracking-wider mb-4">Traveler Care</h5>
            <ul className="space-y-2.5">
              <li><Link href="/manage" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">Manage My Booking</Link></li>
              <li><Link href="/admin" className="hover:text-white transition-colors">Operator Dashboard</Link></li>
              <li><a href="http://localhost:5000/scalar/v1" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Developer API Docs</a></li>
              <li><span className="hover:text-white cursor-pointer transition-colors">Travel Insurance Guide</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors">Terms & Booking Conditions</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-4">
          <div>
            © {new Date().getFullYear()} TourFlow Expeditions Inc. All rights reserved. Registered Tour Operator #48291.
          </div>
          <div className="flex items-center gap-6">
            <span>ASTA Member</span>
            <span>ATOL Protected</span>
            <span>Leave No Trace Partner</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
