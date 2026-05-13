export function formatEventDate(date: string, time?: string): string {
  if (!date) return '';
  try {
    const d = new Date(date);
    const formatted = new Intl.DateTimeFormat('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }).format(d);
    const capitalized = formatted.charAt(0).toUpperCase() + formatted.slice(1);
    return time ? `${capitalized} • ${time}` : capitalized;
  } catch {
    return date;
  }
}

export function formatPrice(price: number): string {
  if (price === 0) return 'Gratuit';
  return `${new Intl.NumberFormat('fr-FR').format(price)} FCFA`;
}

export function formatPriceFrom(price: number): string {
  if (price === 0) return 'Gratuit';
  return `À partir de ${new Intl.NumberFormat('fr-FR').format(price)} FCFA`;
}
