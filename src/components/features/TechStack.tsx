import { Reveal } from '@/components/shared/Reveal';
import { Container } from '@/components/ui/Container';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { techStackGroups } from '@/data/techStack';

export function TechStack() {
  return (
    <section id="stack" aria-labelledby="stack-heading" className="scroll-mt-24 border-y border-line bg-surface/40 py-20 sm:py-28">
      <Container>
        <Reveal>
          <SectionHeader
            eyebrow="Tech stack"
            title="What we"
            titleAccent="build with"
            headingId="stack-heading"
            description="Every MadriBuild project ships on React, Next.js, or Vite with TypeScript and Tailwind CSS, Node.js and Express on the server, and Firebase for auth, data, and hosting."
          />
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          {techStackGroups.map((group, groupIndex) => (
            <Reveal key={group.id} delay={groupIndex * 0.08}>
              <div>
                <h3 className="text-xs font-medium tracking-[0.16em] text-ink-muted uppercase">{group.label}</h3>
                <ul className="mt-4 flex flex-col gap-2">
                  {group.items.map((item) => (
                    <li
                      key={item.id}
                      className="rounded-lg border border-line bg-base px-4 py-4 transition-colors duration-150 hover:bg-surface-raised"
                    >
                      <p className="font-medium text-ink">{item.name}</p>
                      <p className="mt-1 text-sm leading-relaxed text-ink-muted">{item.description}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
