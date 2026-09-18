import { AppWindow, Inbox, Mail, Users, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface WorkspaceLink {
  to: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

const WORKSPACE_LINKS: WorkspaceLink[] = [
  {
    to: '/admin/leads',
    label: 'Leads',
    description: 'Pipeline, follow-ups, Excel import, and outreach',
    icon: Inbox,
  },
  {
    to: '/admin/email',
    label: 'Email',
    description: 'Titan inbox, compose, and reply from hello@madribuild.com',
    icon: Mail,
  },
  {
    to: '/admin/apps',
    label: 'Apps',
    description: 'Products in this workspace and lead volume by app',
    icon: AppWindow,
  },
  {
    to: '/admin/users',
    label: 'Users',
    description: 'Tenants, landlords, and admin accounts',
    icon: Users,
  },
];

export function DashboardWorkspaceLinks() {
  return (
    <section>
      <h2 className="font-display text-base font-semibold text-ink sm:text-lg">Workspace</h2>
      <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
        {WORKSPACE_LINKS.map((item) => (
          <li key={item.to}>
            <Link
              to={item.to}
              className="flex h-full flex-col rounded-2xl border border-line/80 bg-surface px-4 py-4 transition hover:border-line hover:shadow-sm hover:shadow-ink/5"
            >
              <item.icon className="size-5 text-accent-soft" aria-hidden="true" />
              <span className="mt-3 font-display text-sm font-semibold text-ink">{item.label}</span>
              <span className="mt-1 text-xs leading-relaxed text-ink-muted">{item.description}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
