"use client";

import { useState } from "react";
import {
  Hotel,
  Star,
  MapPin,
  Check,
  X,
  Sparkles,
  Wifi,
  Coffee,
  Waves,
  Mountain
} from "lucide-react";

export default function HotelsReviewPage() {
  const [selectedPlace, setSelectedPlace] = useState("All");

  const hotels = [
    {
      id: "sayeman",
      name: "Sayeman Beach Resort",
      location: "Marine Drive, Kolatoli, Cox's Bazar",
      place: "Cox's Bazar",
      rating: 4.8,
      reviewsCount: 320,
      pricePerNight: "৳৭,৫০০ – ৳১৫,০০০",
      coverImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80",
      description: "Direct beachfront location with a stunning infinity pool overlooking the Bay of Bengal. Highly regarded for its clean private beach front, excellent breakfast spread at Casablanca restaurant, and quiet environment away from the crowded main beach.",
      pros: [
        "Unobstructed sunset ocean view from sea-view rooms",
        "Clean, private beachfront security guards",
        "Exceptional buffet breakfast and seafood dining"
      ],
      cons: [
        "Slightly expensive during long weekends and government holidays",
        "Advance booking required 2-3 weeks prior for sea-facing balconies"
      ]
    },
    {
      id: "grand-sultan",
      name: "Grand Sultan Tea Resort & Golf",
      location: "Radhanagar, Sreemangal, Moulvibazar",
      place: "Sreemangal",
      rating: 4.7,
      reviewsCount: 245,
      pricePerNight: "৳১০,৫০০ – ৳২২,০০০",
      coverImage: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80",
      description: "Bangladesh's premier 5-star tea estate resort. Set amidst lush green trees with multiple temperature-controlled swimming pools, mini golf course, 3D theater, and world-class spa facilities. Ideal for peaceful retreats.",
      pros: [
        "Surrounded by lush forest and green tea landscapes",
        "Multiple large swimming pools and indoor recreation facilities",
        "Courteous staff and safe environment for children"
      ],
      cons: [
        "Located 4km outside Sreemangal town center",
        "Restaurant menu pricing is on the higher side"
      ]
    },
    {
      id: "megh-kabbo",
      name: "Megh Kabbo Cottage Sajek",
      location: "Ruilui Para, Sajek Valley, Rangamati",
      place: "Sajek Valley",
      rating: 4.6,
      reviewsCount: 180,
      pricePerNight: "৳৪,০০০ – ৳৭,০০০",
      coverImage: "https://images.unsplash.com/photo-1628172906059-839088ff7b6c?auto=format&fit=crop&w=1000&q=80",
      description: "Perched directly over the edge of the hill with open wooden balconies facing East. Guests can watch the dense morning white clouds roll beneath their feet. Warm local hospitality and delicious bamboo chicken dinners.",
      pros: [
        "Prime eastern ridge view for morning cloud sea & sunrise",
        "Traditional wooden architectural feel with modern bathroom fittings",
        "Cozy environment with generator support during load shedding"
      ],
      cons: [
        "Water supply is limited (water is transported from valley below; use conservatively)",
        "Must walk up a steep ramp to reach the cottage"
      ]
    },
    {
      id: "sairu",
      name: "Sairu Hill Resort",
      location: "Chimbuk Road, Y-Junction, Bandarban",
      place: "Bandarban",
      rating: 4.7,
      reviewsCount: 195,
      pricePerNight: "৳৯,০০০ – ৳১৬,০০০",
      coverImage: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=80",
      description: "Architecturally elevated on a 1,800-foot ridge overlooking the Shangu River and continuous hill folds. Features a breathtaking horizon infinity pool and panoramic open terraces. A serene haven far from city noise.",
      pros: [
        "360-degree views of morning clouds and sunset over green valleys",
        "Infinity pool overlooking natural hill terrain",
        "Impeccable privacy and serene ambiance"
      ],
      cons: [
        "18km away from Bandarban town; requires dedicated 4x4 vehicle or Chander Gari",
        "Rooms with valley views get reserved weeks in advance"
      ]
    },
    {
      id: "royal-tulip",
      name: "Royal Tulip Sea Pearl Beach Resort & Spa",
      location: "Jaliapalong, Inani, Cox's Bazar",
      place: "Cox's Bazar",
      rating: 4.5,
      reviewsCount: 410,
      pricePerNight: "৳৮,০০০ – ৳১৮,০০০",
      coverImage: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1000&q=80",
      description: "Expansive luxury property located on the quiet coral coast of Inani. Features private access to clean sandy shores, a water park, multiple swimming pools, and quiet ocean breeze away from Cox's Bazar city crowds.",
      pros: [
        "Direct access to peaceful Inani beach with live coral formations",
        "Water park and huge outdoor pools suitable for families",
        "Quiet and clean compared to central Kolatoli beach"
      ],
      cons: [
        "Approx. 25km (40-minute drive) from Cox's Bazar city center",
        "Food prices are relatively high inside the resort"
      ]
    }
  ];

  const places = ["All", "Cox's Bazar", "Sreemangal", "Sajek Valley", "Bandarban"];

  const filteredHotels = hotels.filter(
    (h) => selectedPlace === "All" || h.place === selectedPlace
  );

  return (
    <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-8 lg:px-12 2xl:px-16 py-12 space-y-12">
      {/* Header */}
      <div className="space-y-3">
        <div className="text-xs font-bold uppercase tracking-widest text-teal-400">
          Independent Traveler Reviews
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Resorts &amp; Eco-Cottages in Bangladesh
        </h1>
        <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
          Honest assessments of domestic accommodations. We highlight true pros, cons, realistic road distances, and genuine prices in BDT.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/[0.08]">
        {places.map((place) => (
          <button
            key={place}
            onClick={() => setSelectedPlace(place)}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedPlace === place
                ? "bg-teal-600 text-white shadow-md shadow-teal-600/20"
                : "bg-white/[0.04] text-slate-300 hover:text-white hover:bg-white/[0.08]"
            }`}
          >
            {place === "All" ? "All Locations" : place}
          </button>
        ))}
      </div>

      {/* Hotel Cards List */}
      <div className="space-y-8">
        {filteredHotels.map((hotel) => (
          <div
            key={hotel.id}
            className="bg-[#080d1d] border border-white/[0.08] rounded-3xl overflow-hidden shadow-xl hover:border-teal-500/30 transition-all flex flex-col lg:flex-row"
          >
            {/* Image Box */}
            <div className="lg:w-2/5 h-64 lg:h-auto relative bg-slate-900 shrink-0">
              <img
                src={hotel.coverImage}
                alt={hotel.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-black/60 backdrop-blur-md text-white border border-white/[0.1] flex items-center gap-1.5">
                  <MapPin className="h-3 w-3 text-sky-400" />
                  {hotel.place}
                </span>
              </div>
            </div>

            {/* Content Box */}
            <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-xl sm:text-2xl font-bold text-white">{hotel.name}</h3>
                  <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bold">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span>{hotel.rating}</span>
                    <span className="text-slate-400 font-normal">({hotel.reviewsCount} reviews)</span>
                  </div>
                </div>

                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-teal-400 shrink-0" />
                  <span>{hotel.location}</span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {hotel.description}
                </p>

                {/* Pros & Cons Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="bg-black/40 border border-white/[0.06] rounded-2xl p-4 space-y-2">
                    <span className="text-[11px] font-bold uppercase text-teal-400 flex items-center gap-1">
                      <Check className="h-3.5 w-3.5" /> What Guests Loved
                    </span>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {hotel.pros.map((p, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-teal-400 shrink-0">•</span>
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-black/40 border border-white/[0.06] rounded-2xl p-4 space-y-2">
                    <span className="text-[11px] font-bold uppercase text-rose-400 flex items-center gap-1">
                      <X className="h-3.5 w-3.5" /> Things to Keep in Mind
                    </span>
                    <ul className="space-y-1.5 text-xs text-slate-400">
                      {hotel.cons.map((c, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-rose-400 shrink-0">•</span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Price & Booking Note */}
              <div className="pt-4 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-slate-400 text-[11px]">Typical Nightly Rate</span>
                  <div className="text-base font-bold text-white">{hotel.pricePerNight}</div>
                </div>
                <div className="text-slate-400 text-[11px] italic">
                  Book directly with property or verified booking agents 2 weeks in advance.
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
