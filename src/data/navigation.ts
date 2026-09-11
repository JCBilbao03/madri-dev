export interface NavLink {
  label: string;
  href: string;
}

export const navLinks: NavLink[] = [
  { label: 'Services', href: '#services' },
  { label: 'Process', href: '#process' },
  { label: 'Founders', href: '#founders' },
];

export const CONTACT_EMAIL = 'hello@madribuild.com';

export const socialLinks: NavLink[] = [
  { label: 'GitHub', href: 'https://github.com/madribuild' },
  { label: 'LinkedIn', href: 'https://linkedin.com/company/madribuild' },
  { label: 'X', href: 'https://x.com/madribuild' },
];
