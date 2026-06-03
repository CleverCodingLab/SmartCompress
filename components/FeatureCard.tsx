"use client";

/**
 * FeatureCard — Icon + title + description card with IntersectionObserver
 * triggering anime.js fade-in on scroll.
 */

import { useEffect, useRef } from "react";
import { animate } from "animejs";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
}

export default function FeatureCard({
  icon,
  title,
  description,
  index,
}: FeatureCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  // IntersectionObserver triggers anime.js entrance
  useEffect(() => {
    const cardEl = cardRef.current;
    if (!cardEl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true;

            // Stagger based on card index
            animate(cardEl, {
              translateY: [40, 0],
              opacity: [0, 1],
              delay: index * 120,
              duration: 700,
              ease: "outCubic",
            });
          }
        });
      },
      { threshold: 0.05 }
    );

    observer.observe(cardEl);
    return () => observer.disconnect();
  }, [index]);

  return (
    <div
      ref={cardRef}
      className="glass rounded-2xl p-7 card-hover group"
      style={{ opacity: 0 }}
    >
      {/* Icon container */}
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--indigo)]/15 to-[var(--cyan)]/15 flex items-center justify-center mb-5 transition-transform group-hover:scale-110 group-hover:rotate-3">
        {icon}
      </div>

      <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: "var(--font-display)" }}>
        {title}
      </h3>

      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
        {description}
      </p>
    </div>
  );
}
