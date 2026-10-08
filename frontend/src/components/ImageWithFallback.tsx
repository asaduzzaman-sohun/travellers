"use client";

import { useState } from "react";

interface ImageWithFallbackProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> {
  src?: string;
  fallbackSrc?: string;
  fallbackCategory?: "nature" | "resort" | "hills" | "beach";
}

const DEFAULT_FALLBACKS = {
  nature: "https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?auto=format&fit=crop&w=1200&q=80",
  resort: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
  hills: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
  beach: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
};

export default function ImageWithFallback({
  src,
  alt = "Bangladesh Travel",
  className = "",
  fallbackSrc,
  fallbackCategory = "hills",
  ...props
}: ImageWithFallbackProps) {
  const chosenFallback = fallbackSrc || DEFAULT_FALLBACKS[fallbackCategory] || DEFAULT_FALLBACKS.hills;
  const initialSrc = typeof src === "string" && src.trim() ? src : chosenFallback;
  const [imgSrc, setImgSrc] = useState<string>(initialSrc);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(chosenFallback);
    }
  };

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imgSrc || chosenFallback}
      alt={alt}
      onError={handleError}
      loading="lazy"
      className={className}
      {...props}
    />
  );
}
