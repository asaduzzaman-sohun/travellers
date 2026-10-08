import type { Metadata } from "next";
import { API_BASE } from "@/lib/api";

type Props = {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  try {
    const res = await fetch(`${API_BASE}/traveltips/${id}`, {
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      return {
        title: "Travel Guidelines",
        description: "Official travel directives, checkposts, and packing tips for Bangladesh.",
      };
    }

    const tip = await res.json();

    return {
      title: `${tip.title} - Guide & Directive`,
      description: tip.summary?.slice(0, 160) || `Essential guidelines, checkpost instructions, and route tips for ${tip.division}.`,
      openGraph: {
        title: `${tip.title} | Traveller's Field Guide`,
        description: tip.summary?.slice(0, 160),
        images: tip.coverImage
          ? [
              {
                url: tip.coverImage,
                width: 1200,
                height: 630,
                alt: tip.title,
              },
            ]
          : [],
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
        title: `${tip.title}`,
        description: tip.summary?.slice(0, 160),
        images: tip.coverImage ? [tip.coverImage] : [],
      },
    };
  } catch {
    return {
      title: "Travel Guide & Directives",
      description: "Essential travel guides and safety directives across Bangladesh.",
    };
  }
}

export default async function TipLayout({ params, children }: Props) {
  const { id } = await params;

  let jsonLd = null;
  try {
    const res = await fetch(`${API_BASE}/traveltips/${id}`, {
      next: { revalidate: 300 },
    });
    if (res.ok) {
      const tip = await res.json();
      jsonLd = {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: tip.title,
        description: tip.summary,
        image: tip.coverImage,
        articleSection: tip.category,
        datePublished: tip.createdAtUtc,
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
