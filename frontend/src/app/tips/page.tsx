"use client";

import {
  Compass,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Luggage,
  PhoneCall,
  Sun,
  Droplets,
  Heart
} from "lucide-react";

export default function TravelTipsPage() {
  const tips = [
    {
      category: "Hill Tracts (Sajek & Bandarban)",
      title: "Security Checkposts, NID Photocopies & Army Escorts",
      badgeColor: "text-teal-400 bg-teal-500/10 border-teal-500/20",
      content: [
        "Carry at least 4 to 6 photocopies of your National ID (NID) card or Passport. Security personnel at checkposts in Dighinala, Ruilui, Ruma, and Thanchi require these for entry logs.",
        "Sajek Valley travel is strictly guided by Bangladesh Army convoys twice a day (morning escort ~10:30 AM, afternoon escort ~3:30 PM). If you miss the convoy at Dighinala, you must wait for the next escort.",
        "Always hire registered local indigenous guides when trekking beyond Boga Lake or towards waterfalls like Nafakhum and Amiakhum.",
        "Mobile network: Teletalk has reliable coverage in Sajek; Robi/Airtel works decently. Grameenphone has spotty signal at certain hilltop ridges."
      ]
    },
    {
      category: "Sunamganj (Tanguar Haor)",
      title: "Monsoon Season, Houseboat Safety & Water Conservation",
      badgeColor: "text-sky-400 bg-sky-500/10 border-sky-500/20",
      content: [
        "Peak haor season is late June through early October when the water level is highest and hills in Meghalaya are lush green. November to February is best for migratory birds.",
        "Verify that your chosen wooden bajra/houseboat provides certified life jackets. Always wear a life jacket when swimming in deep haor water or near the watchtower.",
        "Never throw plastic bottles, chips packets, or soap waste into the haor. Tanguar Haor is an internationally recognized Ramsar wetland sanctuary.",
        "Niladri Lake (Shahid Siraj Lake) looks calm, but its limestone quarry floor drops abruptly to extreme depths. Avoid swimming in the deep center."
      ]
    },
    {
      category: "Sylhet & Moulvibazar",
      title: "Tea Garden Strolls, Rain Forest Etiquette & Transport",
      badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      content: [
        "Take the morning Parabat Express or Kalni Express train from Kamalapur to Sreemangal. Train journeys offer peaceful views of the countryside and bypass highway jams.",
        "Lawachara National Park is home to rare Hoolock Gibbons. Keep noise levels strictly minimal while walking the forest trails to avoid scaring wildlife.",
        "Do not pluck fresh tea leaves from private tea estates without permission from garden authorities.",
        "Try the local culinary specialty: Beef or Chicken curry cooked with wild Shatkora (a fragrant local citrus fruit)."
      ]
    },
    {
      category: "Khulna (Sundarbans Mangrove)",
      title: "Forest Regulations, Silent Canals & Clothing Colors",
      badgeColor: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
      content: [
        "Wear earthy or dull colors such as khaki, olive green, or brown. Bright red, neon yellow, or bright orange can disturb wildlife.",
        "Armed Forest Department security guards accompany every group during walking excursions inside the Kotka and Harbaria tiger corridors.",
        "During early morning rowboat canal tours, maintain absolute silence. Sound travels easily over water and silences bird calls.",
        "Do not consume or bring alcohol into the reserved wildlife sanctuary areas."
      ]
    }
  ];

  const packingEssentials = [
    "Lightweight rain poncho or umbrella (mandatory during monsoon trips)",
    "Comfortable water sandals with strap and anti-skid grip",
    "High-capacity power bank (20,000mAh) – frequent power cuts in hill cottages",
    "Mosquito repellent cream (Odomos) & personal first-aid kit",
    "Dry bag for smartphones & cameras during boat journeys",
    "Reusable water bottle to prevent single-use plastic waste"
  ];

  return (
    <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-8 lg:px-12 2xl:px-16 py-12 space-y-12">
      {/* Header */}
      <div className="space-y-3">
        <div className="text-xs font-bold uppercase tracking-widest text-teal-400">
          Field Manual &amp; Guidance
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Practical Travel Tips for Bangladesh
        </h1>
        <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
          Ground-truth advice verified by domestic travelers and licensed guides. Plan smoothly for hill tract convoys, haor weather shifts, and forest safety regulations.
        </p>
      </div>

      {/* Main Tips Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {tips.map((item, index) => (
          <div
            key={index}
            className="bg-[#080d1d] border border-white/[0.08] rounded-3xl p-6 sm:p-8 space-y-5 shadow-lg hover:border-teal-500/30 transition-all"
          >
            <div className="space-y-1">
              <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-semibold border ${item.badgeColor}`}>
                {item.category}
              </span>
              <h2 className="text-lg font-bold text-white pt-1">{item.title}</h2>
            </div>

            <ul className="space-y-3 text-xs text-slate-300">
              {item.content.map((point, i) => (
                <li key={i} className="flex items-start gap-2.5 leading-relaxed">
                  <CheckCircle2 className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Packing Checklist Strip */}
      <div className="bg-[#080d1d] border border-white/[0.08] rounded-3xl p-8 space-y-6 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
            <Luggage className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Recommended Domestic Packing List</h3>
            <p className="text-xs text-slate-400">Essential items every traveler in Bangladesh should pack in their backpack.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {packingEssentials.map((item, i) => (
            <div key={i} className="p-3.5 rounded-2xl bg-black/40 border border-white/[0.06] text-slate-300 flex items-center gap-2.5">
              <span className="h-2 w-2 rounded-full bg-teal-400 shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Helpline Contact Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-teal-950/40 to-sky-950/40 border border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <PhoneCall className="h-6 w-6 text-teal-400 shrink-0" />
          <div>
            <div className="font-bold text-white text-sm">Need On-The-Ground Assistance?</div>
            <div className="text-slate-400">Bangladesh Tourist Police 24/7 National Operations Center</div>
          </div>
        </div>
        <div className="font-mono text-sm font-bold text-teal-300 bg-black/40 px-4 py-2 rounded-xl border border-white/[0.08]">
          Dial 999 / +880 1320-222222
        </div>
      </div>
    </div>
  );
}
