import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: Parameters<typeof clsx>) {
  return twMerge(clsx(inputs));
}

/* Deterministic color from a string */
function colorFromString(str: string) {
  const palette = [
    'bg-teal-100   text-teal-800',
    'bg-emerald-100 text-emerald-800',
    'bg-sky-100    text-sky-800',
    'bg-violet-100 text-violet-800',
    'bg-rose-100   text-rose-800',
    'bg-amber-100  text-amber-800',
    'bg-indigo-100 text-indigo-800',
    'bg-cyan-100   text-cyan-800',
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return palette[Math.abs(hash) % palette.length];
}

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('');
}

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const sizeClasses: Record<AvatarSize, { wrapper: string; text: string }> = {
  xs: { wrapper: 'w-6  h-6',  text: 'text-[10px]' },
  sm: { wrapper: 'w-8  h-8',  text: 'text-xs'     },
  md: { wrapper: 'w-10 h-10', text: 'text-sm'      },
  lg: { wrapper: 'w-12 h-12', text: 'text-base'    },
  xl: { wrapper: 'w-16 h-16', text: 'text-xl'      },
};

export interface AvatarProps {
  name:        string;
  src?:        string;
  size?:       AvatarSize;
  className?:  string;
  alt?:        string;
}

export function Avatar({ name, src, size = 'md', className, alt }: AvatarProps) {
  const { wrapper, text } = sizeClasses[size];
  const colorClass         = colorFromString(name);

  return (
    <div
      aria-label={alt ?? name}
      className={cn(
        'relative flex-shrink-0 rounded-full flex items-center justify-center overflow-hidden',
        wrapper,
        !src && colorClass,
        className,
      )}
    >
      {src ? (
        <img
          src={src}
          alt={alt ?? name}
          className="w-full h-full object-cover"
        />
      ) : (
        <span
          aria-hidden="true"
          className={cn('font-bold leading-none select-none', text)}
        >
          {initials(name)}
        </span>
      )}
    </div>
  );
}
