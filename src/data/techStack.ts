export interface TechStackItem {
  id: string;
  name: string;
  description: string;
}

export const techStackGroups = [
  {
    id: 'frontend',
    label: 'Frontend',
    items: [
      {
        id: 'react',
        name: 'React',
        description: 'Component-driven UI with strict TypeScript and atomic state management.',
      },
      {
        id: 'nextjs',
        name: 'Next.js',
        description: 'App Router, SSR, and static generation for SEO-heavy sites and full-stack products.',
      },
      {
        id: 'vite',
        name: 'Vite',
        description: 'Fast local dev and optimized SPA builds with instant HMR.',
      },
      {
        id: 'typescript',
        name: 'TypeScript',
        description: 'End-to-end type safety from UI components through data models.',
      },
      {
        id: 'tailwind',
        name: 'Tailwind CSS',
        description: 'Utility-first styling with design tokens, responsive layouts, and dark mode built in.',
      },
    ] satisfies TechStackItem[],
  },
  {
    id: 'backend',
    label: 'Backend & platform',
    items: [
      {
        id: 'nodejs',
        name: 'Node.js',
        description: 'Server runtime for APIs, background jobs, and integration with third-party services.',
      },
      {
        id: 'express',
        name: 'Express',
        description: 'REST APIs, middleware, and routing with typed request handlers and validation.',
      },
      {
        id: 'firestore',
        name: 'Firestore',
        description: 'Real-time data, role-based security rules, and structured collections.',
      },
      {
        id: 'auth',
        name: 'Firebase Auth',
        description: 'Email and social sign-in with tenant, landlord, and admin roles.',
      },
      {
        id: 'hosting',
        name: 'Firebase Hosting',
        description: 'Global CDN deploys with SPA routing, security headers, and instant rollbacks.',
      },
    ] satisfies TechStackItem[],
  },
] as const;
