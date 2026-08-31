export interface NavLink {
  label: string;
  href: string;
}

export const navLinks: NavLink[] = [
  { label: 'Services', href: '#services' },
  { label: 'Process', href: '#process' },
  { label: 'Founders', href: '#founders' },
];

export const CONTACT_EMAIL = 'hello@madridev.com';

export const socialLinks: NavLink[] = [
  { label: 'GitHub', href: 'https://github.com/madridev' },
  { label: 'LinkedIn', href: 'https://linkedin.com/company/madridev' },
  { label: 'X', href: 'https://x.com/madridev' },
];
