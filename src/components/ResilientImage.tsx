import { Mountain } from "lucide-react";
import { useEffect, useState } from "react";

type ResilientImageProps = {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
  fallbackGradient?: string;
  tone?: "buddhist" | "daoist" | "nature" | "neutral";
};

export function ResilientImage({
  src,
  alt,
  className = "h-full w-full object-cover",
  fallbackTitle,
  fallbackGradient,
  tone = "neutral",
}: ResilientImageProps) {
  const [failed, setFailed] = useState(false);

  // Ensure switching between scenes resets error state for the new image src
  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (failed || !src) {
    const gradient =
      fallbackGradient ||
      (tone === "daoist"
        ? "from-[#1d3b34] via-[#274b42] to-[#122621]"
        : tone === "nature"
          ? "from-[#21373d] via-[#1c322c] to-[#121f22]"
          : tone === "buddhist"
            ? "from-[#5c2c23] via-[#3e251c] to-[#261611]"
            : "from-[#44362e] via-[#2d241f] to-[#1b1613]");

    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex h-full w-full flex-col items-center justify-center bg-gradient-to-br ${gradient} p-4 text-center text-[#f4ead7]`}
      >
        <Mountain size={28} className="opacity-70" />
        {fallbackTitle && (
          <span className="mt-2 font-serif-display text-sm tracking-wide opacity-85">
            {fallbackTitle}
          </span>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
