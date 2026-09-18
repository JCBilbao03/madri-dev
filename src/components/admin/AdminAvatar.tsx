import { cn } from '@/lib/utils';

interface AdminAvatarProps {
  name: string;
  size?: 'sm' | 'md';
  className?: string;
}

const GRADIENTS = [
  'from-emerald-400/80 to-teal-600/80',
  'from-sky-400/80 to-blue-600/80',
  'from-violet-400/80 to-purple-600/80',
  'from-amber-400/80 to-orange-600/80',
  'from-rose-400/80 to-pink-600/80',
  'from-cyan-400/80 to-indigo-600/80',
] as const;

function hashName(name: string): number {
  let hash = 0;
  for (let index = 0; index < name.length; index += 1) {
    hash = name.charCodeAt(index) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0];
  const last = parts[parts.length - 1];

  if (!first) {
    return '?';
  }

  if (!last || parts.length === 1) {
    return first.slice(0, 2).toUpperCase();
  }

  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase();
}

export function AdminAvatar({ name, size = 'sm', className }: AdminAvatarProps) {
  const initials = initialsFromName(name);
  const gradient = GRADIENTS[hashName(name) % GRADIENTS.length];

  return (
    <span
      className={cn(
        'inline-grid shrink-0 place-items-center rounded-lg bg-gradient-to-br font-sans text-[10px] font-medium tracking-wide text-white shadow-sm',
        size === 'sm' ? 'size-7' : 'size-9 text-xs',
        gradient,
        className,
      )}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}
