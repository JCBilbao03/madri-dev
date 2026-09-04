import type { ReactNode } from 'react';

import { ThemeToggle } from '@/components/features/ThemeToggle';
import { Container } from '@/components/ui/Container';
import { Logo } from '@/components/ui/Logo';

interface AuthShellProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function AuthShell({ title, description, children }: AuthShellProps) {
  return (
    <div className="flex min-h-svh flex-col bg-base">
      <header className="border-b border-line">
        <Container className="flex h-18 items-center justify-between">
          <Logo to="/" />
          <ThemeToggle />
        </Container>
      </header>

      <main className="flex flex-1 items-center justify-center px-5 py-16">
        <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-8">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">{title}</h1>
          <p className="mt-2 text-sm text-ink-muted">{description}</p>
          <div className="mt-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
