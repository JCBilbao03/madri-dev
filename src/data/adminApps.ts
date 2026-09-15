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
    name: 'Inventory app',
    description: 'Firestore-backed SKU catalog with photos, barcode labels, and CSV/Excel export.',
    href: '/inventory-app',
  },
];
