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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">
          Traveler Handbook
        </span>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
          Practical Travel Tips for Bangladesh
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
          Essential advice, checkpoint instructions, safety precautions, and packing guidelines to ensure a smooth, peaceful journey across Bangladesh.
        </p>
      </div>

      {/* Emergency Contact Bar */}
      <div className="bg-[#0b1120] border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0">
            <PhoneCall className="h-5 w-5" />
          </div>
          <div className="text-xs">
            <h4 className="font-bold text-white">Tourist Police Bangladesh (24/7 Helpline)</h4>
            <p className="text-slate-400">Immediate assistance for local and foreign travelers in any division</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="font-mono bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-700 text-teal-300 font-bold">
            +880 1320-222222
          </span>
          <span className="font-mono bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-700 text-slate-200 font-bold">
            Emergency: 999
          </span>
        </div>
      </div>

      {/* Tips Cards */}
      <div className="space-y-6">
        {tips.map((item, idx) => (
          <div
            key={idx}
            className="bg-[#0b1120] border border-slate-800 rounded-2xl p-6 sm:p-7 space-y-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border ${item.badgeColor}`}>
                {item.category}
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-white">
              {item.title}
            </h3>

            <ul className="space-y-2.5 text-xs text-slate-300">
              {item.content.map((point, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Responsible Tourism Pledge */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 text-center space-y-3">
        <Heart className="h-6 w-6 text-teal-400 mx-auto" />
        <h4 className="text-sm font-bold text-white">Let’s Keep Our Country Clean</h4>
        <p className="text-xs text-slate-400 max-w-xl mx-auto leading-relaxed">
          Please avoid leaving non-biodegradable plastics in Sajek Valley, Tanguar Haor, Saint Martin's Island, and Sundarbans. Always bring your personal trash back to the nearest city waste collection points.
        </p>
      </div>
    </div>
  );
}
