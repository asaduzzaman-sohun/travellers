import type { Metadata } from "next";
import { API_BASE } from "@/lib/api";

type Props = {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  try {
    const res = await fetch(`${API_BASE}/hotels/${id}`, {
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      return {
        title: "Resort & Hotel Review",
        description: "Curated eco-resorts and hotels in Bangladesh.",
      };
    }

    const hotel = await res.json();

    return {
      title: `${hotel.name} - ${hotel.place}`,
      description: hotel.description?.slice(0, 160) || `Stay at ${hotel.name} in ${hotel.place}, ${hotel.location}. Verified traveler reviews and amenities.`,
      openGraph: {
        title: `${hotel.name} | Traveller's Resorts`,
        description: hotel.description?.slice(0, 160),
        images: hotel.coverImage
          ? [
              {
                url: hotel.coverImage,
                width: 1200,
                height: 630,
                alt: hotel.name,
              },
            ]
          : [],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: `${hotel.name}`,
        description: hotel.description?.slice(0, 160),
        images: hotel.coverImage ? [hotel.coverImage] : [],
      },
    };
  } catch {
    return {
      title: "Resort & Hotel Details",
      description: "Explore eco-resorts and hotels across Bangladesh.",
    };
  }
}

export default async function HotelLayout({ params, children }: Props) {
  const { id } = await params;

  let jsonLd = null;
  try {
    const res = await fetch(`${API_BASE}/hotels/${id}`, {
      next: { revalidate: 300 },
    });
    if (res.ok) {
      const hotel = await res.json();
      jsonLd = {
        "@context": "https://schema.org",
        "@type": "LodgingBusiness",
        name: hotel.name,
        description: hotel.description,
        address: {
          "@type": "PostalAddress",
          addressLocality: hotel.place,
          addressRegion: hotel.location,
          addressCountry: "Bangladesh",
        },
        starRating: {
          "@type": "Rating",
          ratingValue: hotel.rating || 4.5,
        },
        priceRange: hotel.pricePerNight || `BDT ${hotel.priceNumeric}`,
        image: hotel.coverImage,
      };
    }
  } catch {
    // Graceful fallback
  }

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {children}
    </>
  );
}
