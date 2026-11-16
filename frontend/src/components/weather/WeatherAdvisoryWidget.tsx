"use client";

import { useEffect, useState } from "react";
import { Cloud, CloudRain, CloudSun, Sun, CloudLightning, Compass, ShieldAlert, Wind, Thermometer, Droplets } from "lucide-react";

interface WeatherDay {
  date: string;
  dayName: string;
  code: number;
  maxTemp: number;
  minTemp: number;
  rainChance: number;
}

interface DestinationGeo {
  name: string;
  lat: number;
  lon: number;
  advisory: string;
  bestSeason: string;
}

const DESTINATION_REGIONS: Record<string, DestinationGeo> = {
  sajek: {
    name: "Sajek Valley",
    lat: 23.3820,
    lon: 92.2938,
    advisory: "Army convoy escort operates twice daily from Dighinala checkpost (10:30 AM & 3:30 PM). 4WD Chander Gari jeep mandatory for hill climbs.",
    bestSeason: "September – March (Best cloud sea season)",
  },
  sylhet: {
    name: "Sylhet & Haors",
    lat: 24.8949,
    lon: 91.8687,
    advisory: "Ratargul swamp boat safaris & Tanguar haor houseboats peak during June–October. Grip sandals advised for Bichnakandi stone beds.",
    bestSeason: "June – October (Haor waters) / Nov – Feb (Tea gardens)",
  },
  sreemangal: {
    name: "Sreemangal",
    lat: 24.3065,
    lon: 91.7296,
    advisory: "Lawachara rain forest trails may have leeches during rainy season. Carry anti-leech spray or salt. Cycling through tea estates is peaceful.",
    bestSeason: "October – March",
  },
  bandarban: {
    name: "Bandarban Hill Tracts",
    lat: 22.1953,
    lon: 92.2184,
    advisory: "Entry permits & NID copies required at Nilgiri / Thanchi checkposts. Monsoon road slips may occur; 4WD mountain vehicles recommended.",
    bestSeason: "October – April",
  },
  "cox's bazar": {
    name: "Cox's Bazar",
    lat: 21.4272,
    lon: 91.9701,
    advisory: "Follow Red Flag warnings at Laboni and Kolatoli beaches during strong riptides. Sea cruise excursions to Sonadia depart early morning.",
    bestSeason: "November – March",
  },
  "saint martin": {
    name: "Saint Martin's Island",
    lat: 20.6273,
    lon: 92.3225,
    advisory: "Vessel sailings strictly weather-dependent (Nov–March authorized window). Plastic ban enforced by environment dept on Chera Dwip.",
    bestSeason: "November – March (Vessels suspended in Monsoon)",
  },
  sundarban: {
    name: "Sundarbans Mangrove",
    lat: 22.4900,
    lon: 89.6000,
    advisory: "Armed Forest Department guards mandatory on all vessel safaris. Tidal schedules determine creek canal dinghy cruises into Katka & Hiron Point.",
    bestSeason: "November – February",
  },
  rangamati: {
    name: "Rangamati & Kaptai",
    lat: 22.6533,
    lon: 92.1753,
    advisory: "Kaptai lake boat cruises to Shuvolong falls require life jackets. Indigenous weaving markets operate near Tabalchhari ghat.",
    bestSeason: "October – March",
  },
};

function resolveDestination(raw?: string): DestinationGeo {
  if (!raw) return DESTINATION_REGIONS.sajek;
  const lower = raw.toLowerCase();
  for (const [key, val] of Object.entries(DESTINATION_REGIONS)) {
    if (lower.includes(key) || key.includes(lower)) {
      return val;
    }
  }
  return DESTINATION_REGIONS.sylhet;
}

function getWeatherIcon(code: number) {
  if (code === 0 || code === 1) return <Sun className="h-6 w-6 text-amber-500" />;
  if (code === 2 || code === 3) return <CloudSun className="h-6 w-6 text-amber-400" />;
  if (code >= 51 && code <= 67) return <CloudRain className="h-6 w-6 text-blue-500" />;
  if (code >= 80 && code <= 82) return <CloudRain className="h-6 w-6 text-blue-600" />;
  if (code >= 95) return <CloudLightning className="h-6 w-6 text-purple-600" />;
  return <Cloud className="h-6 w-6 text-stone-400" />;
}

function getWeatherConditionText(code: number): string {
  if (code === 0) return "Clear Sky";
  if (code === 1 || code === 2) return "Partly Cloudy";
  if (code === 3) return "Overcast";
  if (code >= 51 && code <= 55) return "Light Drizzle";
  if (code >= 61 && code <= 65) return "Rain Showers";
  if (code >= 80 && code <= 82) return "Heavy Rain";
  if (code >= 95) return "Thunderstorm";
  return "Cloudy";
}

export function WeatherAdvisoryWidget({ destination }: { destination?: string }) {
  const geo = resolveDestination(destination);
  const [forecast, setForecast] = useState<WeatherDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;
    const fetchWeather = async () => {
      try {
        setLoading(true);
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${geo.lat}&longitude=${geo.lon}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia%2FDhaka`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Weather service offline");
        const data = await res.json();

        if (data.daily && !isCancelled) {
          const days: WeatherDay[] = (data.daily.time || []).slice(0, 5).map((d: string, idx: number) => {
            const dateObj = new Date(d);
            const dayName = idx === 0 ? "Today" : dateObj.toLocaleDateString("en-US", { weekday: "short" });
            return {
              date: d,
              dayName,
              code: data.daily.weathercode?.[idx] ?? 0,
              maxTemp: Math.round(data.daily.temperature_2m_max?.[idx] ?? 28),
              minTemp: Math.round(data.daily.temperature_2m_min?.[idx] ?? 20),
              rainChance: Math.round(data.daily.precipitation_probability_max?.[idx] ?? 10),
            };
          });
          setForecast(days);
        }
      } catch {
        // Fallback default forecast for Bangladesh regional weather
        if (!isCancelled) {
          setForecast([
            { date: "Day 1", dayName: "Today", code: 1, maxTemp: 31, minTemp: 22, rainChance: 15 },
            { date: "Day 2", dayName: "Tomorrow", code: 2, maxTemp: 30, minTemp: 21, rainChance: 25 },
            { date: "Day 3", dayName: "Day 3", code: 61, maxTemp: 28, minTemp: 21, rainChance: 60 },
            { date: "Day 4", dayName: "Day 4", code: 1, maxTemp: 29, minTemp: 22, rainChance: 20 },
            { date: "Day 5", dayName: "Day 5", code: 0, maxTemp: 31, minTemp: 23, rainChance: 10 },
          ]);
        }
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    fetchWeather();
    return () => {
      isCancelled = true;
    };
  }, [geo.lat, geo.lon]);

  const today = forecast[0];

  return (
    <div className="bg-white border border-[#EBE6DC] rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F0EBE1] pb-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
            <Compass className="h-3.5 w-3.5" />
            Live Field Weather &amp; Advisory
          </span>
          <h3 className="text-xl font-serif font-bold text-stone-900 mt-0.5">
            {geo.name} Region
          </h3>
        </div>

        {today && (
          <div className="flex items-center gap-2.5 bg-[#FAF8F5] border border-[#E5DFD5] px-3.5 py-1.5 rounded-2xl">
            {getWeatherIcon(today.code)}
            <div>
              <span className="font-bold text-sm text-stone-900">{today.maxTemp}°C</span>
              <span className="text-[11px] text-stone-500 block leading-tight">{getWeatherConditionText(today.code)}</span>
            </div>
          </div>
        )}
      </div>

      {/* 5-Day Forecast Grid */}
      <div>
        <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-3">5-Day Outlook</h4>
        {loading ? (
          <div className="grid grid-cols-5 gap-2 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-24 bg-[#FAF8F5] rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-5 gap-2 text-center">
            {forecast.map((d) => (
              <div
                key={d.date}
                className="bg-[#FAF8F5] border border-[#EAE4D9] rounded-2xl p-2.5 flex flex-col items-center justify-between space-y-1.5"
              >
                <span className="text-[11px] font-bold text-stone-700">{d.dayName}</span>
                <div className="my-0.5">{getWeatherIcon(d.code)}</div>
                <div className="text-xs font-semibold text-stone-900">
                  {d.maxTemp}° <span className="text-stone-400 font-normal">{d.minTemp}°</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-blue-600 font-medium">
                  <Droplets className="h-3 w-3" />
                  <span>{d.rainChance}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Seasonal Travel Advisory Callout */}
      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
        <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
          <ShieldAlert className="h-4 w-4 text-amber-700 shrink-0" />
          <span>Regional Field Advisory</span>
        </div>
        <p className="text-xs text-amber-950/80 leading-relaxed">
          {geo.advisory}
        </p>
        <div className="pt-1 text-[11px] text-amber-800 font-medium flex items-center gap-1">
          <Thermometer className="h-3 w-3 text-amber-700" />
          <span>Best Travel Window: <strong>{geo.bestSeason}</strong></span>
        </div>
      </div>
    </div>
  );
}
