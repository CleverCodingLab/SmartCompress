"use client";

/**
 * PricingSection — Three-tier pricing cards (Free / Pro / Team)
 * with anime.js stagger entrance on scroll.
 */

import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics";

interface PricingTier {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
}

const tiers: PricingTier[] = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for occasional use",
    features: [
      "Up to 10 files per batch",
      "Max 25MB per file",
      "WebP image compression",
      "Basic video compression",
      "No account required",
    ],
    cta: "Get Started Free",
  },
  {
    name: "Pro",
    price: "$9",
    period: "/month",
    description: "For power users & creators",
    features: [
      "Unlimited files per batch",
      "Max 500MB per file",
      "Advanced quality controls",
      "Priority processing queue",
      "API access",
      "No ads",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Team",
    price: "$29",
    period: "/month",
    description: "For teams & agencies",
    features: [
      "Everything in Pro",
      "Up to 10 team members",
      "2GB per file",
      "Custom presets & workflows",
      "Webhook integrations",
      "Priority support",
    ],
    cta: "Contact Sales",
  },
];

export default function PricingSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!sectionRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true;

            // Stagger pricing cards from bottom
            animate(".pricing-card", {
              translateY: [50, 0],
              opacity: [0, 1],
              delay: stagger(120),
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

  return (
    <section id="pricing" className="py-24" ref={sectionRef}>
      <div className="section-container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: "var(--font-display)" }}>
            Simple, transparent{" "}
            <span className="gradient-text">pricing</span>
          </h2>
          <p className="text-[var(--text-secondary)] max-w-lg mx-auto text-center">
            Start free. Upgrade when you need more power.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`pricing-card rounded-2xl p-7 flex flex-col card-hover relative ${
                tier.highlighted
                  ? "bg-gradient-to-b from-[var(--indigo)]/10 to-transparent border-2 border-[var(--indigo)]/40"
                  : "glass"
              }`}
              style={{ opacity: 0 }}
            >
              {tier.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[var(--indigo)] text-white text-xs font-semibold">
                  Most Popular
                </div>
              )}

              <h3 className="text-lg font-semibold mb-1">{tier.name}</h3>
              <p className="text-sm text-[var(--text-muted)] mb-4">
                {tier.description}
              </p>

              <div className="flex items-baseline gap-1 mb-6">
                <span className="stat-value text-4xl">{tier.price}</span>
                <span className="text-sm text-[var(--text-muted)]">
                  {tier.period}
                </span>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {tier.features.map((feature, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 text-sm text-[var(--text-secondary)]"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={tier.highlighted ? "var(--indigo)" : "var(--emerald)"}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="shrink-0 mt-0.5"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href="/compress"
                className={`w-full py-3 rounded-xl font-semibold text-center text-sm transition-all no-underline block ${
                  tier.highlighted
                    ? "btn-primary"
                    : "btn-secondary"
                }`}
                onClick={() =>
                  trackEvent("cta_click", { location: `pricing_${tier.name.toLowerCase()}` })
                }
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
