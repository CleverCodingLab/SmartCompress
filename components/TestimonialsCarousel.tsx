"use client";

/**
 * TestimonialsCarousel — Auto-rotating testimonials with anime.js crossfade.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { animate } from "animejs";

interface Testimonial {
  name: string;
  role: string;
  quote: string;
  avatar: string;
}

const testimonials: Testimonial[] = [
  {
    name: "Sarah Chen",
    role: "Product Designer at Figma",
    quote:
      "CompressKit cut our image assets by 70% without visible quality loss. Our page load times dropped from 4.2s to 1.8s. Absolutely essential tool.",
    avatar: "SC",
  },
  {
    name: "Marcus Rivera",
    role: "Full-Stack Developer",
    quote:
      "I batch-compress all client uploads before storage. The WebP conversion is fantastic — saves us hundreds in CDN costs every month.",
    avatar: "MR",
  },
  {
    name: "Emily Watson",
    role: "Content Creator",
    quote:
      "No signup, no watermarks, just instant compression. I compress my thumbnails and video clips here every single day. Best tool I've found.",
    avatar: "EW",
  },
  {
    name: "David Park",
    role: "Engineering Lead at Vercel",
    quote:
      "We integrated CompressKit's approach into our CI pipeline. The ffmpeg-based compression is rock-solid and the output quality is superb.",
    avatar: "DP",
  },
];

export default function TestimonialsCarousel() {
  const [current, setCurrent] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasAnimated = useRef(false);

  const goTo = useCallback(
    (index: number) => {
      if (index === current) return;

      // Crossfade out current
      if (cardRef.current) {
        animate(cardRef.current, {
          opacity: [1, 0],
          translateX: [0, index > current ? -30 : 30],
          duration: 250,
          ease: "inCubic",
          onComplete: () => {
            setCurrent(index);
            // Crossfade in new
            if (cardRef.current) {
              animate(cardRef.current, {
                opacity: [0, 1],
                translateX: [index > current ? 30 : -30, 0],
                duration: 350,
                ease: "outCubic",
              });
            }
          },
        });
      } else {
        setCurrent(index);
      }
    },
    [current]
  );

  // Auto-rotate every 5 seconds
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      goTo((current + 1) % testimonials.length);
    }, 5000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [current, goTo]);

  // Scroll-triggered entrance
  useEffect(() => {
    if (!sectionRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true;
            animate(".testimonial-container", {
              translateY: [40, 0],
              opacity: [0, 1],
              duration: 700,
              ease: "outCubic",
            });
          }
        });
      },
      { threshold: 0.05 }
    );

    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const t = testimonials[current];

  return (
    <section className="py-24" ref={sectionRef}>
      <div className="section-container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: "var(--font-display)" }}>
            Loved by{" "}
            <span className="gradient-text">creators</span>
          </h2>
          <p className="text-[var(--text-secondary)]">
            Join thousands of developers and designers who trust CompressKit
          </p>
        </div>

        <div className="testimonial-container max-w-2xl mx-auto" style={{ opacity: 0 }}>
          <div
            ref={cardRef}
            className="glass rounded-2xl p-8 md:p-10 text-center"
          >
            {/* Avatar */}
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--indigo)] to-[var(--cyan)] flex items-center justify-center mx-auto mb-6">
              <span className="text-white font-bold text-sm">{t.avatar}</span>
            </div>

            {/* Quote */}
            <blockquote className="text-base md:text-lg leading-relaxed text-[var(--text-primary)] mb-6">
              &ldquo;{t.quote}&rdquo;
            </blockquote>

            {/* Author */}
            <div>
              <p className="font-semibold text-sm">{t.name}</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">{t.role}</p>
            </div>
          </div>

          {/* Navigation dots */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === current
                    ? "bg-[var(--indigo)] w-6"
                    : "bg-[var(--text-muted)]/30 hover:bg-[var(--text-muted)]/50"
                }`}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
