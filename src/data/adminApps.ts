import type { AppId } from '@/types/admin';

export interface AdminApp {
  id: AppId;
  name: string;
  description: string;
  href: string;
}

export const ADMIN_APPS: AdminApp[] = [
  {
    id: 'marketing',
    name: 'MadriBuild site',
    description: 'Agency landing page and project inquiries from the contact form.',
    href: '/',
  },
  {
    id: 'rental',
    name: 'Rental marketplace',
    description: 'Tenant applications and landlord listings backed by Firebase.',
    href: '/tenant',
  },
  {
    id: 'cleaning',
    name: 'Cleaning marketplace',
    description: 'Cleaner search and booking requests from the cleaning demo app.',
    href: '/cleaning-app',
  },
  {
    id: 'inventory',
    name: 'Dang Lifestyle Operations',
    description:
      'Operations hub for barcodes, ASN builder, damage claims, and refund tracking — demo/simulated Shopify and 3PL.',
    href: '/inventory-app',
  },
];
