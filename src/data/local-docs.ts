export interface LocalDocCategory {
  name: string;
  color: string;
}

export interface LocalDocItem {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  url?: string;
  category: LocalDocCategory;
}

// Starter local docs aligned with backend/seed.py
export const LOCAL_DOCS: LocalDocItem[] = [
  {
    id: 'local-1',
    title: 'Albedo Support: Getting Started',
    excerpt: 'Learn the basics of Albedo Support platform and key features.',
    slug: 'docs/getting-started',
    url: undefined,
    category: { name: 'Getting Started', color: '#3b82f6' },
  },
  {
    id: 'local-2',
    title: 'Install Albedo Support',
    excerpt: 'Step-by-step installation instructions for Albedo Support.',
    slug: 'docs/installation',
    url: undefined,
    category: { name: 'Installation', color: '#10b981' },
  },
  {
    id: 'local-3',
    title: 'FAQ: Common Questions',
    excerpt: 'Frequently asked questions about Albedo Support.',
    slug: 'docs/faq',
    url: undefined,
    category: { name: 'FAQ', color: '#f59e0b' },
  },
];


