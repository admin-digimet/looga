import type { Metadata } from 'next';
import { Mail, MessageSquare, Phone } from 'lucide-react';
import { InfoPage } from '@/components/InfoPage';
import { ContactForm } from '@/components/ContactForm';

export const metadata: Metadata = {
  title: 'Contactez-nous — Looga',
  description: 'Une question, une suggestion ? L’équipe Looga est à votre écoute.',
};

const channels = [
  {
    icon: Mail,
    title: 'Email',
    value: 'contact@looga.ci',
    description: 'Réponse sous 24 à 48h ouvrées.',
  },
  {
    icon: Phone,
    title: 'Téléphone',
    value: '+225 00 00 00 00',
    description: 'Lun–Ven · 9h–18h (GMT).',
  },
  {
    icon: MessageSquare,
    title: 'Réseaux sociaux',
    value: '@looga.ci',
    description: 'Sur Twitter, Instagram et LinkedIn.',
  },
];

export default function ContactPage() {
  return (
    <InfoPage
      title="Contactez-nous"
      intro="Une question, un partenariat, une suggestion ? Nous serons ravis d’échanger avec vous."
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {channels.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.title} className="bg-white rounded-2xl p-6 border border-cream-2">
              <div className="w-10 h-10 rounded-full bg-orange/10 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-orange" />
              </div>
              <p className="font-heading font-bold text-ink text-lg mb-1">{c.title}</p>
              <p className="text-ink text-sm font-medium">{c.value}</p>
              <p className="text-ink-muted text-xs mt-1">{c.description}</p>
            </div>
          );
        })}
      </div>

      <div className="mb-10">
        <ContactForm />
      </div>

      <div className="bg-white rounded-2xl p-6 md:p-8 border border-cream-2">
        <h2 className="font-heading font-bold text-ink text-xl mb-2">
          Vous êtes organisateur·trice ?
        </h2>
        <p className="text-ink-muted text-sm mb-4">
          Pour toute demande commerciale ou de partenariat, écrivez-nous à
          <span className="font-medium text-ink"> partners@looga.ci</span>.
          Notre équipe revient vers vous rapidement.
        </p>
      </div>
    </InfoPage>
  );
}
