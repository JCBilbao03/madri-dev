import { useEffect } from 'react';

interface PageMetaOptions {
  title: string;
  description?: string;
  robots?: string;
}

function upsertMeta(name: string, content: string): void {
  let element = document.querySelector(`meta[name="${name}"]`);

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute('name', name);
    document.head.appendChild(element);
  }

  element.setAttribute('content', content);
}

export function usePageMeta({ title, description, robots }: PageMetaOptions): void {
  useEffect(() => {
    const previousTitle = document.title;
    const descriptionElement = document.querySelector('meta[name="description"]');
    const robotsElement = document.querySelector('meta[name="robots"]');
    const previousDescription = descriptionElement?.getAttribute('content') ?? null;
    const previousRobots = robotsElement?.getAttribute('content') ?? null;

    document.title = title;

    if (description) {
      upsertMeta('description', description);
    }

    if (robots) {
      upsertMeta('robots', robots);
    }

    return () => {
      document.title = previousTitle;

      if (description) {
        if (previousDescription !== null) {
          upsertMeta('description', previousDescription);
        } else {
          descriptionElement?.remove();
        }
      }

      if (robots) {
        if (previousRobots !== null) {
          upsertMeta('robots', previousRobots);
        } else {
          robotsElement?.remove();
        }
      }
    };
  }, [title, description, robots]);
}
