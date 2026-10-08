import type { Metadata } from "next";
import { API_BASE } from "@/lib/api";

type Props = {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const res = await fetch(`${API_BASE}/tourpackages/${slug}`, {
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      return {
        title: "Tour Package",
        description: "Explore breathtaking destinations across Bangladesh.",
      };
    }

    const tour = await res.json();

    return {
      title: `${tour.title}`,
      description: tour.summary || tour.description?.slice(0, 160),
      openGraph: {
        title: `${tour.title} | Traveller's Bangladesh`,
        description: tour.summary || tour.description?.slice(0, 160),
        images: tour.coverImageUrl
          ? [
              {
                url: tour.coverImageUrl,
                width: 1200,
                height: 630,
                alt: tour.title,
              },
            ]
          : [],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: `${tour.title}`,
        description: tour.summary,
        images: tour.coverImageUrl ? [tour.coverImageUrl] : [],
      },
    };
  } catch {
    return {
      title: "Tour Package",
      description: "Explore serene Bangladesh tour itineraries.",
    };
  }
}

export default async function TourLayout({ params, children }: Props) {
  const { slug } = await params;

  let jsonLd = null;
  try {
    const res = await fetch(`${API_BASE}/tourpackages/${slug}`, {
      next: { revalidate: 300 },
    });
    if (res.ok) {
      const tour = await res.json();
      jsonLd = {
        "@context": "https://schema.org",
        "@type": "TouristTrip",
        name: tour.title,
        description: tour.summary,
        touristType: tour.category,
        offers: {
          "@type": "Offer",
          price: tour.discountPrice || tour.basePrice,
          priceCurrency: "BDT",
          availability: "https://schema.org/InStock",
        },
        image: tour.coverImageUrl,
        itinerary: tour.itineraryDays?.map((d: any) => ({
          "@type": "DayAction",
          name: d.title,
          description: d.description,
        })),
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
