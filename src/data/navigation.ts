export interface NavLink {
  label: string;
  href: string;
}

export const navLinks: NavLink[] = [
  { label: 'Services', href: '#services' },
  { label: 'Work', href: '#work' },
  { label: 'Stack', href: '#stack' },
  { label: 'Process', href: '#process' },
  { label: 'Founders', href: '#founders' },
];

export const CONTACT_EMAIL = 'hello@madribuild.com';

export const socialLinks: NavLink[] = [
  { label: 'Instagram', href: 'https://instagram.com/madribuild' },
  { label: 'LinkedIn', href: 'https://linkedin.com/company/madribuild' },
  { label: 'X', href: 'https://x.com/madribuild' },
];
