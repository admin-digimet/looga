const DAYS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

export function formatDate(iso: string): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (isNaN(date.getTime())) return '';
  const day = DAYS[date.getDay()];
  const dayNum = date.getDate();
  const month = MONTHS[date.getMonth()];
  return `${day} ${dayNum} ${month}`;
}

export function formatPrice(amount: number): string {
  if (amount == null || isNaN(Number(amount))) return '— FCFA';
  return `${Number(amount).toLocaleString('fr-FR')} FCFA`;
}
