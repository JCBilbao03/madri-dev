import { cva, type VariantProps } from 'class-variance-authority';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap transition duration-200 ease-out disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-accent text-base shadow-[0_0_0_1px_rgba(91,140,255,0.4),0_10px_30px_-12px_rgba(91,140,255,0.8)] hover:bg-accent-soft',
        secondary: 'border border-line bg-surface text-ink hover:border-accent/60 hover:bg-surface-raised',
        ghost: 'text-ink-muted hover:bg-surface hover:text-ink',
      },
      size: {
        sm: 'h-9 px-4 text-sm',
        md: 'h-11 px-5 text-sm',
        lg: 'h-13 px-7 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

type ButtonVariants = VariantProps<typeof buttonVariants>;

type ButtonAsButton = ButtonHTMLAttributes<HTMLButtonElement> &
  ButtonVariants & {
    href?: never;
  };

type ButtonAsLink = AnchorHTMLAttributes<HTMLAnchorElement> &
  ButtonVariants & {
    /** When present the button renders as an anchor, keeping link semantics intact. */
    href: string;
  };

type ButtonProps = ButtonAsButton | ButtonAsLink;

export function Button({ className, variant, size, ...props }: ButtonProps) {
  const classes = cn(buttonVariants({ variant, size }), className);

  if (typeof props.href === 'string') {
    const { href, ...anchorProps } = props as ButtonAsLink;
    return <a href={href} className={classes} {...anchorProps} />;
  }

  const { type = 'button', ...buttonProps } = props as ButtonAsButton;
  return <button type={type} className={classes} {...buttonProps} />;
}

export { buttonVariants };
