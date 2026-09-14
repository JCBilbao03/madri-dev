import { Blocks, Cloud, Gauge, Layers, Palette, Plug, type LucideIcon } from 'lucide-react';

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  highlights: string[];
}

export const services: Service[] = [
  {
    id: 'custom-web-apps',
    title: 'Custom Web Apps',
    description:
      'Internal tools, customer portals, and dashboards built around how your team actually works — not around a template.',
    icon: Blocks,
    highlights: ['React, Next.js & Vite', 'Tailwind CSS', 'Firestore-backed data'],
  },
  {
    id: 'saas-development',
    title: 'SaaS Development',
    description:
      'End-to-end product builds with billing, multi-tenancy, and onboarding handled properly from the first release.',
    icon: Layers,
    highlights: ['Multi-tenant architecture', 'Stripe billing', 'Usage analytics'],
  },
  {
    id: 'performance-optimization',
    title: 'Performance Optimization',
    description:
      'We audit your existing app, find what is actually slow, and fix it. Most engagements cut load time by more than half.',
    icon: Gauge,
    highlights: ['Core Web Vitals', 'Bundle analysis', 'Render profiling'],
  },
  {
    id: 'api-integrations',
    title: 'APIs & Integrations',
    description:
      'Connect the systems you already pay for. Payments, CRMs, ERPs, and internal services, wired together and monitored.',
    icon: Plug,
    highlights: ['REST & GraphQL', 'Webhook pipelines', 'Retry and backoff'],
  },
  {
    id: 'design-systems',
    title: 'Design Systems',
    description:
      'A component library your team can build on, with accessibility and dark mode handled once instead of per screen.',
    icon: Palette,
    highlights: ['Tailwind CSS tokens', 'WCAG AA baseline', 'Documented in Storybook'],
  },
  {
    id: 'backend-platform',
    title: 'Backend & Platform',
    description:
      'Node.js and Express APIs backed by Firestore, Firebase Auth, and Hosting — security rules, App Check, and deploy scripts included.',
    icon: Cloud,
    highlights: ['Node.js & Express', 'Firestore & Auth', 'Firebase Hosting'],
  },
];
