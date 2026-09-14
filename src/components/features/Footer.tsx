import { ArrowUpRight } from 'lucide-react';

import { Container } from '@/components/ui/Container';
import { Logo } from '@/components/ui/Logo';
import { CONTACT_EMAIL, navLinks, socialLinks } from '@/data/navigation';

export function Footer() {
  return (
    <footer className="border-t border-line bg-surface/40">
      <Container className="py-12">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="max-w-xs">
            <Logo variant="full" />
            <p className="mt-4 text-sm leading-relaxed text-ink-muted">
              A senior studio building React and Next.js apps with Tailwind CSS — plus Node.js,
              Express, and Firebase for APIs, auth, and hosting.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:gap-16">
            <nav aria-label="Footer">
              <h2 className="text-xs font-medium tracking-[0.16em] text-ink uppercase">Explore</h2>
              <ul className="mt-4 flex flex-col gap-2.5">
                {[...navLinks, { label: 'Contact', href: '#contact' }].map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-sm text-ink-muted transition-colors duration-150 hover:text-ink"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div>
              <h2 className="text-xs font-medium tracking-[0.16em] text-ink uppercase">Elsewhere</h2>
              <ul className="mt-4 flex flex-col gap-2.5">
                {socialLinks.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-1 text-sm text-ink-muted transition-colors duration-150 hover:text-ink"
                    >
                      {link.label}
                      <ArrowUpRight className="size-3.5" aria-hidden="true" />
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  </li>
                ))}
                <li>
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="text-sm text-ink-muted transition-colors duration-150 hover:text-ink"
                  >
                    Email us
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-line pt-6 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} MadriBuild. All rights reserved.</p>
          <ul className="flex gap-6">
            <li>
              <a href="#top" className="transition-colors duration-150 hover:text-ink">
                Privacy
              </a>
            </li>
            <li>
              <a href="#top" className="transition-colors duration-150 hover:text-ink">
                Terms
              </a>
            </li>
          </ul>
        </div>
      </Container>
    </footer>
  );
}
