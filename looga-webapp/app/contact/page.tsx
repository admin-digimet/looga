import type { Metadata } from 'next';
import { Mail, MessageSquare, Phone } from 'lucide-react';
import { PublicHeader } from '@/components/PublicHeader';
import { AboutFooter } from '@/components/AboutFooter';
import { ContactForm } from '@/components/ContactForm';

export const metadata: Metadata = {
  title: 'Contactez-nous — Looga',
  description: 'Une question, une suggestion ? L’équipe Looga est à votre écoute.',
};

const channels = [
  { icon: Mail, title: 'Email', value: 'contact@looga-ci.com', description: 'Réponse sous 24 à 48 h ouvrées.' },
  { icon: Phone, title: 'Téléphone', value: '+225 00 00 00 00', description: 'Lun – Ven · 9 h – 18 h (GMT).' },
  { icon: MessageSquare, title: 'Réseaux sociaux', value: '@looga.exp', description: 'Instagram, Twitter / X, LinkedIn, TikTok.' },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#13091e] font-sans text-white flex flex-col">
      <PublicHeader />
      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-white/10" style={{ background: 'radial-gradient(ellipse at 12% 30%, #74351f 0%, #311c3d 45%, #12091d 100%)' }}>
          <div className="relative max-w-5xl mx-auto px-5 md:px-8 py-20 md:py-28">
            <p className="text-xs md:text-sm font-bold uppercase tracking-[0.2em] text-orange-200 mb-6">CONTACTER LOOGA</p>
            <h1 className="font-heading font-extrabold text-4xl md:text-6xl tracking-tight leading-[1.1] mb-7 max-w-4xl">
              Une question, un partenariat ou une suggestion ?
            </h1>
            <p className="text-white/85 text-base md:text-lg leading-relaxed max-w-2xl">
              Notre équipe est disponible pour répondre à vos questions et vous accompagner sur Looga.
            </p>
          </div>
        </section>

        <div className="max-w-5xl mx-auto px-5 md:px-8 py-16 md:py-20">
          <section aria-label="Nos coordonnées" className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
            {channels.map((channel) => {
              const Icon = channel.icon;
              return (
                <div key={channel.title} className="rounded-3xl bg-[#25152f] border border-white/10 p-7">
                  <div className="w-12 h-12 rounded-2xl bg-[#ff761e]/15 flex items-center justify-center mb-5">
                    <Icon className="w-6 h-6 text-[#ff761e]" />
                  </div>
                  <h2 className="font-heading font-bold text-xl mb-2">{channel.title}</h2>
                  <p className="text-white font-medium text-sm break-words">{channel.value}</p>
                  <p className="text-white/60 text-sm mt-2 leading-relaxed">{channel.description}</p>
                </div>
              );
            })}
          </section>

          <section className="rounded-3xl bg-[#25152f] border border-white/10 p-6 md:p-10 mb-8">
            <h2 className="font-heading font-bold text-2xl md:text-3xl mb-2">Écrivez-nous</h2>
            <p className="text-white/70 text-sm md:text-base mb-8">
              Remplissez le formulaire ci-dessous et notre équipe reviendra vers vous sous 24 à 48 h ouvrées.
            </p>
            {/* Le formulaire d'origine est conservé : champs, validation et envoi inchangés. */}
            <div className="[&_label]:!text-white/85 [&_input]:!bg-[#180e23] [&_input]:!text-white [&_input]:!border-white/20 [&_textarea]:!bg-[#180e23] [&_textarea]:!text-white [&_textarea]:!border-white/20 [&_select]:!bg-[#180e23] [&_select]:!text-white [&_select]:!border-white/20 [&_input]:placeholder:!text-white/40 [&_textarea]:placeholder:!text-white/40">
              <ContactForm />
            </div>
          </section>

          <section className="rounded-3xl bg-[#25152f] border border-white/10 p-7 md:p-10">
            <h2 className="font-heading font-bold text-2xl mb-3">Vous êtes organisateur ?</h2>
            <p className="text-white/70 text-sm md:text-base leading-relaxed mb-3">
              Pour toute demande commerciale, partenariat ou accompagnement organisateur, contactez directement notre équipe dédiée.
            </p>
            <p className="text-white/70 text-sm md:text-base leading-relaxed">
              Contact : <span className="font-semibold text-white">partenariat@looga-ci.com</span> — notre équipe reviendra rapidement vers vous afin d’échanger sur votre projet ou vos événements.
            </p>
          </section>
        </div>
      </main>
      <AboutFooter />
    </div>
  );
}
