import type { ReactNode } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export interface InfoSection {
  heading: string;
  body: ReactNode;
}

export interface InfoPageProps {
  title: string;
  intro?: ReactNode;
  sections?: InfoSection[];
  children?: ReactNode;
}

export function InfoPage({ title, intro, sections, children }: InfoPageProps) {
  return (
    <div className="min-h-screen bg-cream font-sans flex flex-col">
      <Navbar />

      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-90"
          style={{ background: 'linear-gradient(135deg, #FF5C1A 0%, #6B3FA0 100%)' }}
        />
        <div className="relative max-w-3xl mx-auto px-4 md:px-8 py-16 md:py-20">
          <h1 className="font-heading font-extrabold text-white text-3xl md:text-5xl tracking-tight leading-[1.1] mb-4">
            {title}
          </h1>
          {intro && <p className="text-white/90 text-base md:text-lg max-w-2xl">{intro}</p>}
        </div>
      </section>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 md:px-8 py-12 md:py-16">
        {sections?.map((section) => (
          <section key={section.heading} className="mb-10 last:mb-0">
            <h2 className="font-heading font-bold text-ink text-xl md:text-2xl mb-3">
              {section.heading}
            </h2>
            <div className="text-ink-muted text-sm md:text-base leading-relaxed space-y-3">
              {section.body}
            </div>
          </section>
        ))}
        {children}
      </main>

      <Footer />
    </div>
  );
}
