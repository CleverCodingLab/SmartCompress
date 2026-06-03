import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description:
    "CompressKit cookie policy — what cookies we use and how to manage them.",
  alternates: {
    canonical: "/cookies",
  },
  openGraph: {
    title: "Cookie Policy — CompressKit",
    description:
      "CompressKit cookie policy — what cookies we use and how to manage them.",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cookie Policy — CompressKit",
    description:
      "CompressKit cookie policy — what cookies we use and how to manage them.",
    images: ["/og-image.png"],
  },
};

export default function CookiesPage() {
  return (
    <div className="section-container py-28 max-w-3xl mx-auto">
      <h1
        className="text-3xl font-bold mb-8"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Cookie Policy
      </h1>

      <div className="prose prose-invert max-w-none space-y-6 text-[var(--text-secondary)] text-sm leading-relaxed">
        <p className="text-xs text-[var(--text-muted)]">
          Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </p>

        <section>
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">
            1. What Are Cookies
          </h2>
          <p>
            Cookies are small text files stored on your device when you visit a
            website. They help websites remember your preferences and improve
            your experience.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">
            2. Cookies We Use
          </h2>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-default)]">
                  <th className="text-left py-2 pr-4 text-[var(--text-primary)] font-semibold">
                    Cookie
                  </th>
                  <th className="text-left py-2 pr-4 text-[var(--text-primary)] font-semibold">
                    Type
                  </th>
                  <th className="text-left py-2 pr-4 text-[var(--text-primary)] font-semibold">
                    Purpose
                  </th>
                  <th className="text-left py-2 text-[var(--text-primary)] font-semibold">
                    Duration
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[var(--border-subtle)]">
                  <td className="py-2 pr-4 font-mono text-xs">
                    compresskit_consent
                  </td>
                  <td className="py-2 pr-4">Essential</td>
                  <td className="py-2 pr-4">
                    Stores your cookie preferences
                  </td>
                  <td className="py-2">Persistent</td>
                </tr>
                <tr className="border-b border-[var(--border-subtle)]">
                  <td className="py-2 pr-4 font-mono text-xs">
                    compresskit_theme
                  </td>
                  <td className="py-2 pr-4">Essential</td>
                  <td className="py-2 pr-4">
                    Stores dark/light mode preference
                  </td>
                  <td className="py-2">Persistent</td>
                </tr>
                <tr className="border-b border-[var(--border-subtle)]">
                  <td className="py-2 pr-4 font-mono text-xs">_ga, _ga_*</td>
                  <td className="py-2 pr-4">Analytics</td>
                  <td className="py-2 pr-4">
                    Google Analytics 4 — anonymous usage tracking
                  </td>
                  <td className="py-2">2 years</td>
                </tr>
                <tr className="border-b border-[var(--border-subtle)]">
                  <td className="py-2 pr-4 font-mono text-xs">
                    __gads, __gpi
                  </td>
                  <td className="py-2 pr-4">Advertising</td>
                  <td className="py-2 pr-4">
                    Google AdSense — ad personalization
                  </td>
                  <td className="py-2">13 months</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">
            3. Managing Cookies
          </h2>
          <p>
            You can manage your cookie preferences at any time:
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>Use our cookie consent banner (appears on first visit)</li>
            <li>Clear your browser&apos;s localStorage to reset preferences</li>
            <li>Use your browser&apos;s built-in cookie management tools</li>
            <li>Enable Do Not Track in your browser settings</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">
            4. Contact
          </h2>
          <p>
            Questions about our cookie policy? Email{" "}
            <a
              href="mailto:privacy@compresskit.com"
              className="text-[var(--indigo-light)] hover:underline"
            >
              privacy@compresskit.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
