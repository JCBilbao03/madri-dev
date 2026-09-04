import { useCallback, useState } from 'react';

import { cn } from '@/lib/utils';

interface PropertyGalleryProps {
  title: string;
  photos: string[];
}

interface ThumbButtonProps {
  src: string;
  alt: string;
  isActive: boolean;
  index: number;
  onSelect: (index: number) => void;
}

function ThumbButton({ src, alt, isActive, index, onSelect }: ThumbButtonProps) {
  const handleClick = useCallback(() => {
    onSelect(index);
  }, [index, onSelect]);

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={isActive}
      className={cn(
        'overflow-hidden rounded-xl border transition',
        isActive ? 'border-accent' : 'border-line hover:border-accent/50',
      )}
    >
      <img src={src} alt={alt} className="aspect-[16/10] size-full object-cover" />
    </button>
  );
}

export function PropertyGallery({ title, photos }: PropertyGalleryProps) {
  const [active, setActive] = useState(0);
  const photo = photos[active] ?? photos[0];

  return (
    <div>
      <div className="aspect-[16/9] bg-surface-raised">
        {photo ? (
          <img src={photo} alt={title} className="size-full object-cover" />
        ) : (
          <div className="grid size-full place-items-center text-sm text-ink-muted">No photo</div>
        )}
      </div>
      {photos.length > 1 ? (
        <div className="grid grid-cols-4 gap-2 border-t border-line p-3">
          {photos.map((src, index) => (
            <ThumbButton
              key={`${src}-${index}`}
              src={src}
              alt={`${title} photo ${index + 1}`}
              isActive={index === active}
              index={index}
              onSelect={setActive}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
