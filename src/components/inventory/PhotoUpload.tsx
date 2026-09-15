import { ImagePlus, X } from 'lucide-react';
import { useCallback, useRef } from 'react';

import { cn } from '@/lib/utils';

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024;

interface PhotoUploadProps {
  previewUrl: string;
  onFileSelect: (file: File | null, previewUrl: string) => void;
  className?: string;
}

export function PhotoUpload({ previewUrl, onFileSelect, className }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File | undefined) => {
      if (!file || !file.type.startsWith('image/')) {
        return;
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onFileSelect(file, reader.result);
        }
      };
      reader.readAsDataURL(file);
    },
    [onFileSelect],
  );

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      handleFile(event.target.files?.[0]);
      event.target.value = '';
    },
    [handleFile],
  );

  const handleRemove = useCallback(() => {
    onFileSelect(null, '');
  }, [onFileSelect]);

  return (
    <div className={cn('space-y-3', className)}>
      <input ref={inputRef} type="file" accept="image/*" className="sr-only" onChange={handleInputChange} />

      {previewUrl ? (
        <div className="relative overflow-hidden border border-line bg-surface">
          <img src={previewUrl} alt="Product preview" className="aspect-square w-full object-cover" />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 inline-flex size-11 items-center justify-center border border-line bg-base/90 text-ink-muted transition-colors hover:text-ink"
            aria-label="Remove photo"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="relative flex aspect-square w-full flex-col items-center justify-center gap-3 border border-dashed border-line bg-base/40 px-4 text-center transition-colors duration-150 hover:border-[color:var(--inv-scan)]/50 hover:bg-surface"
        >
          <ImagePlus className="size-7 text-[color:var(--inv-scan)]" aria-hidden="true" />
          <span className="font-display text-[11px] tracking-[0.16em] text-ink uppercase">Capture optic</span>
          <span className="text-xs text-ink-muted">PNG or JPG · max 2 MB</span>
        </button>
      )}
    </div>
  );
}
