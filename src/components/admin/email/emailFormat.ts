import type { MailAddress, MailMessage } from '@/types/email';

export function initialsFromAddress(address: MailAddress): string {
  const name = address.name.trim();
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] ?? '';
    const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
    return `${first}${last}`.toUpperCase() || address.address.slice(0, 2).toUpperCase();
  }

  const local = address.address.split('@')[0] ?? '';
  return local.slice(0, 2).toUpperCase() || '?';
}

export function displaySender(address: MailAddress): string {
  if (address.name.trim()) {
    return address.name.trim();
  }

  return address.address || 'Unknown sender';
}

export function formatAddressList(values: MailMessage['to']): string {
  if (values.length === 0) {
    return '—';
  }

  return values
    .map((item) => (item.name.trim() ? `${item.name} <${item.address}>` : item.address))
    .join(', ');
}

export function formatThreadDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (sameDay) {
    return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  }

  const sameYear = date.getFullYear() === now.getFullYear();
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' }),
  });
}

export function formatMessageDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
