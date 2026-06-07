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
    value: 'contact@looga-ci.com',
    description: 'Réponse sous 24 à 48 h ouvrées.',
  },
  {
    icon: Phone,
    title: 'Téléphone',
    value: '+225 00 00 00 00',
    description: 'Lun – Ven · 9 h – 18 h (GMT).',
  },
  {
    icon: MessageSquare,
    title: 'Réseaux sociaux',
    value: '@looga.exp',
    description: 'Instagram, Twitter / X, LinkedIn, TikTok.',
  },
];

export default function ContactPage() {
  return (
    <InfoPage
      title="Une question, un partenariat ou une suggestion ?"
      intro="Notre équipe est disponible pour répondre à vos questions et vous accompagner sur Looga."
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
        <h2 className="font-heading font-bold text-ink text-xl mb-1">Écrivez-nous</h2>
        <p className="text-ink-muted text-sm mb-4">
          Remplissez le formulaire ci-dessous et notre équipe reviendra vers vous sous 24 à 48 h ouvrées.
        </p>
        <ContactForm />
      </div>

      <div className="bg-white rounded-2xl p-6 md:p-8 border border-cream-2">
        <h2 className="font-heading font-bold text-ink text-xl mb-2">
          Vous êtes organisateur ?
        </h2>
        <p className="text-ink-muted text-sm mb-2">
          Pour toute demande commerciale, partenariat ou accompagnement organisateur, contactez directement notre équipe dédiée.
        </p>
        <p className="text-ink-muted text-sm">
          Contact :{' '}
          <span className="font-medium text-ink">partenariat@looga-ci.com</span>
          {' '}— notre équipe reviendra rapidement vers vous afin d’échanger sur votre projet ou vos événements.
        </p>
      </div>
    </InfoPage>
  );
}
