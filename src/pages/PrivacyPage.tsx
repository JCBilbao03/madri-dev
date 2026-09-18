import { Link } from 'react-router-dom';

import { Footer } from '@/components/features/Footer';
import { Header } from '@/components/features/Header';
import { Container } from '@/components/ui/Container';
import { usePageMeta } from '@/hooks/usePageMeta';
import { BRAND_NAME, CONTACT_EMAIL } from '@/lib/site';

export function PrivacyPage() {
  usePageMeta({
    title: `Privacy Policy — ${BRAND_NAME}`,
    description: `How ${BRAND_NAME} collects and uses data, including anonymous demo app analytics.`,
  });

  return (
    <>
      <Header />
      <main id="main" className="border-b border-line bg-base py-12 sm:py-16">
        <Container className="max-w-3xl">
          <p className="text-sm text-ink-muted">Last updated: September 18, 2026</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">Privacy Policy</h1>
          <p className="mt-4 text-sm leading-relaxed text-ink-muted">
            MadriBuild (&quot;we&quot;, &quot;us&quot;) explains here what we collect when you use our website and demo
            applications, why we collect it, and your choices. This policy is designed to align with common privacy
            principles under the Philippines Data Privacy Act (RA 10173), GDPR-style transparency, and data-minimization
            best practices.
          </p>

          <section className="mt-10 space-y-3">
            <h2 className="font-display text-xl font-semibold text-ink">1. Who this applies to</h2>
            <p className="text-sm leading-relaxed text-ink-muted">
              This policy covers visitors to madribuild.com, users of our demo apps (rental, cleaning, inventory), and
              admin users of our internal workspace.
            </p>
          </section>

          <section className="mt-8 space-y-3">
            <h2 className="font-display text-xl font-semibold text-ink">2. Data you provide directly</h2>
            <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-ink-muted">
              <li>
                <strong className="text-ink">Contact &amp; lead forms</strong> — name, email, message, and related
                fields when you submit an inquiry or demo booking.
              </li>
              <li>
                <strong className="text-ink">Account registration</strong> — name and email if you create an account in
                the rental demo.
              </li>
              <li>
                <strong className="text-ink">Admin workspace</strong> — authentication data handled by Firebase Auth
                for authorized staff only.
              </li>
            </ul>
          </section>

          <section className="mt-8 space-y-3">
            <h2 className="font-display text-xl font-semibold text-ink">3. Anonymous demo app analytics</h2>
            <p className="text-sm leading-relaxed text-ink-muted">
              When you open a live demo from our <strong className="text-ink">Works</strong> section or visit a demo URL
              directly, we record <strong className="text-ink">aggregated usage statistics</strong> so we can understand
              interest in each product. We designed this to minimize personal data:
            </p>
            <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-ink-muted">
              <li>
                <strong className="text-ink">What we store:</strong> counts per demo app, per day; whether the visit
                came from Works or a direct link; approximate <strong className="text-ink">country</strong> (ISO code);
                optional browser language and timezone hints.
              </li>
              <li>
                <strong className="text-ink">What we do not store:</strong> your name, email, precise GPS location,
                advertising IDs, or your IP address in our database.
              </li>
              <li>
                <strong className="text-ink">How country is derived:</strong> our server briefly uses your connection
                IP to look up an approximate country, then discards the IP. Only the country code is added to aggregate
                counters.
              </li>
              <li>
                <strong className="text-ink">Cookies:</strong> this analytics flow does not set marketing cookies. We
                use <code className="rounded bg-surface px-1 py-0.5 text-xs">sessionStorage</code> in your browser to
                avoid counting the same tab repeatedly (cleared when you close the tab).
              </li>
              <li>
                <strong className="text-ink">Legal basis:</strong> legitimate interest in measuring demo interest and
                improving our services, balanced against your privacy through aggregation and minimization.
              </li>
              <li>
                <strong className="text-ink">Retention:</strong> daily aggregate documents are kept for operational
                reporting; short-lived deduplication records expire automatically (Firestore TTL on{' '}
                <code className="rounded bg-surface px-1 py-0.5 text-xs">expiresAt</code>).
              </li>
            </ul>
          </section>

          <section className="mt-8 space-y-3">
            <h2 className="font-display text-xl font-semibold text-ink">4. Firebase &amp; Google Analytics</h2>
            <p className="text-sm leading-relaxed text-ink-muted">
              We may also use Firebase Analytics (Google) for site measurement. That service may use cookies or similar
              technologies subject to Google&apos;s policies. Where required by law, we will request consent before
              enabling non-essential analytics cookies in your region.
            </p>
          </section>

          <section className="mt-8 space-y-3">
            <h2 className="font-display text-xl font-semibold text-ink">5. How we use data</h2>
            <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-ink-muted">
              <li>Respond to inquiries and operate demo applications.</li>
              <li>Secure our services (Firebase App Check, authentication, Firestore rules).</li>
              <li>Produce anonymous traffic reports for our admin team.</li>
              <li>Improve product design and portfolio presentation.</li>
            </ul>
          </section>

          <section className="mt-8 space-y-3">
            <h2 className="font-display text-xl font-semibold text-ink">6. Sharing</h2>
            <p className="text-sm leading-relaxed text-ink-muted">
              We use Google Firebase (hosting, database, authentication, functions) to run the site. We do not sell
              personal data. We may disclose information if required by law or to protect our rights and users.
            </p>
          </section>

          <section className="mt-8 space-y-3">
            <h2 className="font-display text-xl font-semibold text-ink">7. Your rights</h2>
            <p className="text-sm leading-relaxed text-ink-muted">
              Depending on your location, you may have rights to access, correct, delete, or object to processing of
              your personal data. Because demo visit analytics are anonymous aggregates, we generally cannot identify an
              individual visitor to delete a specific visit record. Contact us for any privacy request related to
              information you submitted directly (forms, accounts).
            </p>
          </section>

          <section className="mt-8 space-y-3">
            <h2 className="font-display text-xl font-semibold text-ink">8. Contact</h2>
            <p className="text-sm leading-relaxed text-ink-muted">
              Questions about this policy:{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-accent-soft underline-offset-2 hover:underline">
                {CONTACT_EMAIL}
              </a>
              . You may also return to the{' '}
              <Link to="/" className="text-accent-soft underline-offset-2 hover:underline">
                home page
              </Link>
              .
            </p>
          </section>
        </Container>
      </main>
      <Footer />
    </>
  );
}
