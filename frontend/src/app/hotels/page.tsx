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
      name: "Megh Kabbo Hilltop Cottage",
      location: "Ruilui Para, Sajek Valley, Rangamati",
      place: "Sajek Valley",
      rating: 4.9,
      reviewsCount: 180,
      pricePerNight: "৳৪,৫০০ – ৳৭,০০০",
      coverImage: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1000&q=80",
      description: "A peaceful wooden eco-cottage perched on the edge of the hill in Ruilui Para. Facing east, allowing you to wake up to clouds floating directly into your private wooden balcony at sunrise.",
      pros: [
        "Spectacular 180-degree sunrise view above the clouds",
        "Comfortable wooden interior with solar power backup and geyser",
        "Friendly local management and traditional bamboo chicken dinner on order"
      ],
      cons: [
        "Mobile network can be intermittent during foggy mornings",
        "Must book well in advance for weekend stays"
      ]
    },
    {
      id: "sairu",
      name: "Sairu Hill Resort",
      location: "Chimbuk Road, Y-Junction, Bandarban",
      place: "Bandarban",
      rating: 4.8,
      reviewsCount: 195,
      pricePerNight: "৳৯,০০০ – ৳১৮,০০০",
      coverImage: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1000&q=80",
      description: "Designed following traditional indigenous architecture seamlessly blended with modern luxury. Positioned high on the mountain ridgeline, providing 360-degree vistas of Shangu River and green hills.",
      pros: [
        "Breathtaking mountain ridgeline views and infinity pool",
        "High quality architectural design and peaceful gardens",
        "Reliable Wi-Fi and power backup despite remote hill location"
      ],
      cons: [
        "About 18km from Bandarban town; requires private car or reserved Chander Gari",
        "Strict cancellation policy"
      ]
    },
    {
      id: "royal-tulip",
      name: "Royal Tulip Sea Pearl Beach Resort",
      location: "Inani Beach, Marine Drive, Cox's Bazar",
      place: "Cox's Bazar",
      rating: 4.6,
      reviewsCount: 410,
      pricePerNight: "৳৮,০০০ – ৳২০,০০০",
      coverImage: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1000&q=80",
      description: "Massive sprawling luxury beach resort situated on the calm, coral-studded shores of Inani Beach. Far away from the hustle of Kolatoli, featuring a private water park, multiple international restaurants, and expansive beachfront lawns.",
      pros: [
        "Direct access to peaceful and clean Inani Beach",
        "Large private pools and kids water park",
        "Scenic drive on Marine Drive road to reach the resort"
      ],
      cons: [
        "25km south of Cox's Bazar city center (approx. 40 minutes drive)",
        "Can feel bustling during corporate retreat weekends"
      ]
    }
  ];

  const places = ["All", "Cox's Bazar", "Sajek Valley", "Sreemangal", "Bandarban"];

  const filteredHotels = hotels.filter((h) => selectedPlace === "All" || h.place === selectedPlace);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">
          Verified Reviews
        </span>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
          Hotels & Resorts Reviews in Bangladesh
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
          Honest, unbiased feedback from Bangladeshi travelers on amenities, road access, breakfast quality, and room cleanliness.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {places.map((place) => (
          <button
            key={place}
            onClick={() => setSelectedPlace(place)}
            className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap ${
              selectedPlace === place
                ? "bg-teal-600 text-white font-semibold"
                : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
            }`}
          >
            {place}
          </button>
        ))}
      </div>

      {/* Hotel Cards List */}
      <div className="space-y-6">
        {filteredHotels.map((h) => (
          <div
            key={h.id}
            className="bg-[#0b1120] border border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row gap-6 p-5 sm:p-6"
          >
            {/* Image */}
            <div className="md:w-72 h-52 shrink-0 rounded-xl overflow-hidden bg-slate-900 relative">
              <img
                src={h.coverImage}
                alt={h.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2.5 left-2.5 bg-slate-950/80 px-2 py-0.5 rounded text-[11px] text-white font-medium">
                {h.place}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center text-amber-400 text-xs font-bold bg-amber-500/10 px-2 py-0.5 rounded">
                      <Star className="h-3.5 w-3.5 fill-amber-400 mr-1" />
                      {h.rating} / 5.0
                    </span>
                    <span className="text-[11px] text-slate-400">({h.reviewsCount} reviews)</span>
                  </div>

                  <span className="text-xs font-bold text-teal-400">
                    {h.pricePerNight}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-white">
                  {h.name}
                </h3>

                <div className="text-xs text-slate-400 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-teal-400 shrink-0" />
                  <span>{h.location}</span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed pt-1">
                  {h.description}
                </p>
              </div>

              {/* Pros and Cons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-800/80 text-[11px]">
                <div className="space-y-1">
                  <span className="font-bold text-emerald-400 flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    What Guests Loved:
                  </span>
                  <ul className="space-y-0.5 text-slate-300">
                    {h.pros.map((p, i) => (
                      <li key={i} className="line-clamp-1">• {p}</li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-1">
                  <span className="font-bold text-rose-400 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    Good to Know:
                  </span>
                  <ul className="space-y-0.5 text-slate-400">
                    {h.cons.map((c, i) => (
                      <li key={i} className="line-clamp-1">• {c}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
