import React from "react";

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
  return (
    <div className="glass rounded-2xl p-7 card-hover group">
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
