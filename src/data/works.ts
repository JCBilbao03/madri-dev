export type WorkPreviewVariant = 'rental' | 'cleaning';

export interface Work {
  id: string;
  title: string;
  category: string;
  description: string;
  href: string;
  ctaLabel: string;
  /** Short slug for the preview wordmark, e.g. rental → rental_app */
  appSlug: string;
  preview: WorkPreviewVariant;
  stack: string[];
  highlights: string[];
}

export const works: Work[] = [
  {
    id: 'rental-marketplace',
    title: 'Rental marketplace',
    category: 'PropTech',
    description:
      'Tenants browse listings, save favorites, and apply online. Landlords publish properties and review applications from one dashboard.',
    href: '/login',
    ctaLabel: 'Explore rentals',
    appSlug: 'rental',
    preview: 'rental',
    stack: ['React', 'Firebase Auth', 'Firestore'],
    highlights: ['Role-based tenant & landlord flows', 'Saved listings & applications', 'Custom screening per property'],
  },
  {
    id: 'cleaning-marketplace',
    title: 'Cleaning marketplace',
    category: 'On-demand services',
    description:
      'Search by city or service, compare cleaners and agencies with rates and reviews, and book a visit in a guided flow.',
    href: '/cleaning-app',
    ctaLabel: 'Find cleaners',
    appSlug: 'cleaning',
    preview: 'cleaning',
    stack: ['React', 'Vite', 'Zustand'],
    highlights: ['Filterable cleaner search', 'Profiles with reviews & services', 'Multi-step booking flow'],
  },
];
