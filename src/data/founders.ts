export type FounderBackdrop = 'quarter' | 'diamond' | 'circle' | 'triangle';

export interface Founder {
  id: string;
  name: string;
  role: string;
  bio: string;
  /** Path relative to `public/`. Omit to show an initials placeholder. */
  photo?: string;
  /** Describes the person and setting for screen reader users. */
  photoAlt: string;
  /** CSS object-position value, e.g. "center 38%". Defaults to top. */
  photoPosition?: string;
  /** Geometric color shape that sits behind the circular portrait. */
  backdrop: FounderBackdrop;
}

/** Founder details. Photo files live in `public/founders/`. */
export const founders: Founder[] = [
  {
    id: 'maricarl',
    name: 'Maricarl',
    role: 'Sales',
    bio: 'Maricarl leads discovery and keeps every conversation grounded in what your business actually needs — clear scope, honest timelines, and no surprise upsells.',
    photo: '/founders/maricarl.jpg',
    photoAlt: 'Maricarl smiling in a black ribbed top with a gold cross necklace, in a bright indoor setting.',
    photoPosition: 'center 28%',
    backdrop: 'quarter',
  },
  {
    id: 'john-carlo',
    name: 'John Carlo',
    role: 'Engineering',
    bio: 'John Carlo architects and ships the codebase — performance, reliability, and patterns your team can maintain long after handoff.',
    photo: '/founders/john-carlo.jpg',
    photoAlt: 'John Carlo smiling in a navy textured blazer over a white t-shirt, professional headshot.',
    photoPosition: 'center 18%',
    backdrop: 'diamond',
  },
  {
    id: 'teresa',
    name: 'Teresa',
    role: 'Design',
    bio: 'Teresa turns complex workflows into interfaces people enjoy using — from wireframes through polished UI that holds up in production.',
    photo: '/founders/teresa.jpg',
    photoAlt: 'Teresa in a white top and gold-rimmed glasses, professional headshot on a light gray background.',
    photoPosition: 'center 18%',
    backdrop: 'circle',
  },
  {
    id: 'carla',
    name: 'Carla',
    role: 'Marketing',
    bio: 'Carla shapes how products reach the right audience — messaging, launch strategy, and the story that makes your app worth paying attention to.',
    photo: '/founders/carla.jpg',
    photoAlt: 'Carla in a black blazer and patterned blouse, smiling in a professional headshot.',
    photoPosition: 'center 22%',
    backdrop: 'triangle',
  },
];
