import { CONTACT_EMAIL, socialLinks } from '@/data/navigation';

export const SITE_URL = 'https://madribuild.com';

export const BRAND_NAME = 'MadriBuild';

export const BRAND_ALTERNATE_NAMES = ['Madri Build', 'madri build'] as const;

export { CONTACT_EMAIL };

export const SITE_TITLE = 'MadriBuild — Web Application Development Studio';

export const SITE_DESCRIPTION =
  'MadriBuild is a senior web application development studio shipping high-performance React, Next.js, and Vite apps with TypeScript, Tailwind CSS, Node.js, Express, and Firebase.';

export const OG_IMAGE_PATH = '/og-image.png';

export const OG_IMAGE_URL = `${SITE_URL}${OG_IMAGE_PATH}`;

export const LOGO_URL = `${SITE_URL}/brand/madribuild-mark-on-light.png`;

export const SOCIAL_URLS = socialLinks.map((link) => link.href);
