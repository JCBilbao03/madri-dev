import { cva, type VariantProps } from 'class-variance-authority';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react';
import { Link } from 'react-router-dom';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg font-medium whitespace-normal sm:whitespace-nowrap transition-colors duration-150 ease-out disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'border border-accent bg-accent text-white hover:bg-accent-soft active:bg-accent/95',
        cta: 'border border-accent bg-accent text-white hover:bg-accent-soft active:bg-accent/95',
        secondary:
          'border border-line bg-surface text-ink hover:border-ink-muted/30 hover:bg-surface-raised active:bg-surface',
        ghost: 'text-ink-muted hover:bg-surface hover:text-ink active:bg-surface-raised',
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
