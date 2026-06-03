import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "CompressKit privacy policy — how we handle your data, files, and personal information.",
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: "Privacy Policy — CompressKit",
    description:
      "CompressKit privacy policy — how we handle your data, files, and personal information.",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy — CompressKit",
    description:
      "CompressKit privacy policy — how we handle your data, files, and personal information.",
    images: ["/og-image.png"],
  },
};

export default function PrivacyPage() {
  return (
    <div className="section-container py-28 max-w-3xl mx-auto">
      <h1
        className="text-3xl font-bold mb-8"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Privacy Policy
      </h1>

      <div className="prose prose-invert max-w-none space-y-6 text-[var(--text-secondary)] text-sm leading-relaxed">
        <p className="text-xs text-[var(--text-muted)]">
          Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </p>

        <section>
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">
            1. Information We Collect
          </h2>
          <p>
            CompressKit is designed with privacy first. We collect minimal data:
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>
              <strong>Files you upload:</strong> Processed server-side in memory
              and automatically deleted after compression. We never store,
              analyze, or share your files.
            </li>
            <li>
              <strong>Analytics data:</strong> If you consent, we collect
              anonymous usage data via Google Analytics 4 (page views, file
              types compressed, compression ratios). No personal identifiers.
            </li>
            <li>
              <strong>Cookie preferences:</strong> Stored locally in your
              browser&apos;s localStorage. Never sent to our servers.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">
            2. How We Use Your Data
          </h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>To provide file compression services</li>
            <li>To improve our service through anonymous analytics (with consent)</li>
            <li>To display relevant advertising (with consent)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">
            3. Data Retention
          </h2>
          <p>
            Uploaded files are processed in temporary server memory and are
            deleted immediately after you download the compressed result, or
            automatically within 1 hour if not downloaded.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">
            4. Third-Party Services
          </h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Google Analytics 4:</strong> Anonymous usage tracking
              (only with consent)
            </li>
            <li>
              <strong>Google AdSense:</strong> Advertising (only with consent)
            </li>
          </ul>
          <p className="mt-2">
            Both services are blocked until you explicitly accept cookies via
            our consent banner. We respect the Do Not Track browser signal.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">
            5. Your Rights
          </h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>Reject non-essential cookies at any time</li>
            <li>Request deletion of any data we hold about you</li>
            <li>Access information about what data we collect</li>
            <li>Withdraw consent at any time by clearing your browser&apos;s localStorage</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">
            6. Contact
          </h2>
          <p>
            For privacy-related inquiries, please contact us at{" "}
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
