import Image from 'next/image';

const SIZE_MAP = { sm: 24, md: 32, lg: 48 } as const;

type Size = keyof typeof SIZE_MAP;

type Method = 'mtn_momo' | 'orange_money' | 'wave' | 'card' | 'bank_transfer';

const METHOD_FILE: Record<Method, { src: string; label: string }> = {
  mtn_momo:      { src: '/payment/mtn-momo.png',         label: 'MTN Mobile Money' },
  orange_money:  { src: '/payment/orange-money.png',     label: 'Orange Money' },
  wave:          { src: '/payment/wave.png',             label: 'Wave' },
  card:          { src: '/payment/carte-bancaire.webp',  label: 'Carte bancaire' },
  bank_transfer: { src: '/payment/carte-bancaire.webp',  label: 'Virement bancaire' },
};

interface Props {
  method: Method;
  size?: Size;
  className?: string;
}

export function PaymentMethodIcon({ method, size = 'md', className = '' }: Props) {
  const info = METHOD_FILE[method];
  if (!info) return null;
  const px = SIZE_MAP[size];
  return (
    <Image
      src={info.src}
      alt={info.label}
      width={px}
      height={px}
      className={`object-contain ${className}`}
    />
  );
}
