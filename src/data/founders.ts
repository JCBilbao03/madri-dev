export interface Founder {
  id: string;
  name: string;
  role: string;
  bio: string;
  /** Path relative to `public/`. */
  photo: string;
  /** Describes the person and setting for screen reader users. */
  photoAlt: string;
  /** CSS object-position value, e.g. "center 38%". Defaults to top. */
  photoPosition?: string;
}

/** Founder details. Photo files live in `public/founders/`. */
export const founders: Founder[] = [
  {
    id: 'ma-carla',
    name: 'Ma Carla Encio',
    role: 'Co-Founder & CEO',
    bio: 'Ma Carla spent a decade shipping mission-critical systems where downtime was not an option. She runs discovery, scopes the work honestly, and stays on every project through launch.',
    photo: '/founders/ma-carla-encio.jpg',
    photoAlt: 'Ma Carla Encio smiling in a white spacesuit aboard a spacecraft, with Earth visible through the window behind her.',
  },
  {
    id: 'maricarl',
    name: 'Maricarl Bilbao',
    role: 'Co-Founder & Head of Product',
    bio: 'Maricarl came to software from clinical practice, where a confusing interface has real consequences. She leads product and design, and insists every screen earns its place.',
    photo: '/founders/maricarl-bilbao.jpg?v=4',
    photoAlt: 'Maricarl Bilbao in navy scrubs with a stethoscope, smiling and holding a young child in a bright pediatric clinic.',
    photoPosition: 'center 38%',
  },
];
