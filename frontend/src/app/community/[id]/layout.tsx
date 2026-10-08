import type { Metadata } from "next";
import { API_BASE } from "@/lib/api";

type Props = {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  try {
    const res = await fetch(`${API_BASE}/blogposts/${id}`, {
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      return {
        title: "Travel Story",
        description: "Authentic travel stories from Bangladesh.",
      };
    }

    const post = await res.json();

    return {
      title: `${post.title}`,
      description: post.summary || post.content?.slice(0, 160) || "Travel story by " + post.authorName,
      openGraph: {
        title: `${post.title} | Traveller's Stories`,
        description: post.summary || post.content?.slice(0, 160),
        images: post.coverImageUrl
          ? [
              {
                url: post.coverImageUrl,
                width: 1200,
                height: 630,
                alt: post.title,
              },
            ]
          : [],
        type: "article",
        publishedTime: post.createdAtUtc,
        authors: [post.authorName],
      },
      twitter: {
        card: "summary_large_image",
        title: `${post.title}`,
        description: post.summary || post.content?.slice(0, 160),
        images: post.coverImageUrl ? [post.coverImageUrl] : [],
      },
    };
  } catch {
    return {
      title: "Travel Story",
      description: "Read genuine traveler experiences from Bangladesh.",
    };
  }
}

export default async function StoryLayout({ params, children }: Props) {
  const { id } = await params;

  let jsonLd = null;
  try {
    const res = await fetch(`${API_BASE}/blogposts/${id}`, {
      next: { revalidate: 300 },
    });
    if (res.ok) {
      const post = await res.json();
      jsonLd = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.title,
        description: post.summary,
        image: post.coverImageUrl,
        author: {
          "@type": "Person",
          name: post.authorName,
        },
        datePublished: post.createdAtUtc,
        articleBody: post.content,
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
