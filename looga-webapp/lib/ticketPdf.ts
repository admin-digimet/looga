import type { Ticket } from '@/types';
import { formatEventDate } from '@/lib/utils';

// Client-only PDF: no network or third-party PDF service. The QR uses the
// existing rendered qrcode.react canvas and is never recreated from fake data.
export async function downloadTicketPdf(ticket: Ticket, position: number, count: number) {
  if (typeof document === 'undefined') return;
  const width = 1240, height = 1754;
  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Impossible de générer le document');
  const orange = '#FF5C1A';
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = '#20132E'; ctx.fillRect(65, 65, 1110, 1510);
  ctx.fillStyle = orange; ctx.fillRect(65, 65, 1110, 18);
  ctx.font = 'bold 65px Arial, sans-serif'; ctx.fillStyle = orange; ctx.fillText('looga.', 115, 190);
  ctx.font = 'bold 27px Arial, sans-serif'; ctx.fillStyle = '#C4B5CE'; ctx.fillText('TON BILLET D’ENTRÉE', 115, 250);
  ctx.font = 'bold 57px Arial, sans-serif'; ctx.fillStyle = '#FFFFFF';
  const title = ticket.eventName || 'Événement';
  ctx.fillText(title.length > 28 ? title.slice(0, 27) + '…' : title, 115, 360);
  const lines: [string, string][] = [
    ['DATE', formatEventDate(ticket.eventDate, ticket.eventTime) || 'Non renseignée'],
    ['LIEU', ticket.eventLocation || 'Non renseigné'],
    ['CATÉGORIE', ticket.ticketTypeName || 'Billet'],
    ['BILLET', `${String(position).padStart(2, '0')} / ${String(count).padStart(2, '0')}`],
    ['RÉFÉRENCE', ticket.ticketNumber || ticket.id],
    ['STATUT', ticket.status === 'valid' ? 'Valide' : ticket.status === 'used' ? 'Utilisé' : ticket.status === 'cancelled' ? 'Annulé' : ticket.status === 'pending' ? 'En attente' : 'Expiré'],
  ];
  let y = 455;
  for (const [label, value] of lines) {
    ctx.font = 'bold 23px Arial, sans-serif'; ctx.fillStyle = orange; ctx.fillText(label, 115, y);
    ctx.font = '30px Arial, sans-serif'; ctx.fillStyle = '#FFFFFF';
    ctx.fillText(value.length > 45 ? value.slice(0, 44) + '…' : value, 115, y + 42);
    y += 117;
  }
  ctx.setLineDash([13, 12]); ctx.strokeStyle = '#FF905F'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(115, 1185); ctx.lineTo(1125, 1185); ctx.stroke(); ctx.setLineDash([]);
  const qrElement = document.getElementById(`ticket-pdf-qr-${ticket.id}`) as HTMLCanvasElement | null;
  const canShowQr = ticket.status === 'valid' && Boolean(ticket.qrCode || ticket.ticketNumber);
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(424, 1220, 392, 294);
  if (canShowQr && qrElement) {
    ctx.drawImage(qrElement, 480, 1235, 280, 265);
  } else {
    ctx.fillStyle = '#51475A'; ctx.font = 'bold 26px Arial, sans-serif';
    ctx.textAlign = 'center'; ctx.fillText('QR non disponible', 620, 1385); ctx.textAlign = 'left';
  }
  ctx.fillStyle = '#453A4E'; ctx.font = '23px Arial, sans-serif';
  ctx.textAlign = 'center'; ctx.fillText('Présente ce billet à l’entrée de l’événement.', 620, 1665); ctx.textAlign = 'left';
  const dataUri = canvas.toDataURL('image/jpeg', 0.91);
  const binary = atob(dataUri.split(',')[1]);
  const jpg = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) jpg[i] = binary.charCodeAt(i);
  const encoder = new TextEncoder();
  const chunks: Uint8Array[] = []; let offset = 0; const offsets: number[] = [0];
  const add = (data: string | Uint8Array) => { const bytes = typeof data === 'string' ? encoder.encode(data) : data; chunks.push(bytes); offset += bytes.length; };
  const obj = (id: number, content: string | Uint8Array, prefix = '', suffix = '') => {
    offsets[id] = offset; add(`${id} 0 obj\n${prefix}`); add(content); add(`${suffix}\nendobj\n`);
  };
  add('%PDF-1.4\n');
  obj(1, '<< /Type /Catalog /Pages 2 0 R >>');
  obj(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
  obj(3, '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /XObject << /Im1 4 0 R >> >> /Contents 5 0 R >>');
  obj(4, jpg, `<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpg.length} >>\nstream\n`, '\nendstream');
  const commands = 'q 595 0 0 842 0 0 cm /Im1 Do Q\n';
  obj(5, commands, `<< /Length ${encoder.encode(commands).length} >>\nstream\n`, 'endstream');
  const xrefOffset = offset;
  add('xref\n0 6\n0000000000 65535 f \n');
  for (let i = 1; i <= 5; i++) add(`${String(offsets[i]).padStart(10, '0')} 00000 n \n`);
  add(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);
  const blob = new Blob(chunks as BlobPart[], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `Looga-billet-${(ticket.ticketNumber || ticket.id).replace(/[^a-zA-Z0-9_-]/g, '-')}.pdf`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
