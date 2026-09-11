import { cva, type VariantProps } from 'class-variance-authority';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react';
import { Link } from 'react-router-dom';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap transition duration-200 ease-out disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-accent text-base shadow-[0_0_0_1px_rgba(91,140,255,0.4),0_10px_30px_-12px_rgba(91,140,255,0.8)] hover:bg-accent-soft',
        cta: 'btn-cta-shine font-semibold shadow-[0_0_0_1px_rgba(139,171,255,0.45),0_8px_28px_-10px_rgba(91,140,255,0.85)] hover:brightness-110 hover:shadow-[0_0_0_1px_rgba(139,171,255,0.55),0_12px_36px_-8px_rgba(91,140,255,0.95)] active:scale-[0.98]',
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
    to?: never;
  };

type ButtonAsAnchor = AnchorHTMLAttributes<HTMLAnchorElement> &
  ButtonVariants & {
    /** External or in-page hash links. SPA routes should use `to` instead. */
    href: string;
    to?: never;
  };

type ButtonAsRouterLink = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> &
  ButtonVariants & {
    /** In-app React Router destination. */
    to: string;
    href?: never;
  };

type ButtonProps = ButtonAsButton | ButtonAsAnchor | ButtonAsRouterLink;

export function Button({ className, variant, size, ...props }: ButtonProps) {
  const classes = cn(buttonVariants({ variant, size }), className);

  if ('to' in props && typeof props.to === 'string') {
    const { to, ...linkProps } = props;
    return <Link to={to} className={classes} {...linkProps} />;
  }

  if ('href' in props && typeof props.href === 'string') {
    const { href, ...anchorProps } = props;
    return <a href={href} className={classes} {...anchorProps} />;
  }

  const { type = 'button', ...buttonProps } = props as ButtonAsButton;
  return <button type={type} className={classes} {...buttonProps} />;
}

export { buttonVariants };
