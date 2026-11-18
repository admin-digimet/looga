'use client';

import type { ReactNode } from 'react';
import { PublicHeader } from '@/components/PublicHeader';
import { AboutFooter } from '@/components/AboutFooter';
import { usePageContent } from '@/hooks/usePageContent';
import type { InfoSection } from '@/components/InfoPage';

interface AboutInfoPageProps {
  pageKey: string;
  fallbackTitle: string;
  fallbackIntro?: string;
  fallbackSections?: InfoSection[];
}

function renderBody(body: string): ReactNode {
  return body.split(/\n\s*\n/).map((block, index) => {
    const lines = block.split('\n');
    if (lines.every(line => line.trim().startsWith('- '))) {
      return <ul key={index} className="list-disc pl-5 space-y-2">{lines.map((line, j) => <li key={j}>{line.replace(/^-\s*/, '')}</li>)}</ul>;
    }
    return <p key={index}>{block}</p>;
  });
}

export function AboutInfoPage({ pageKey, fallbackTitle, fallbackIntro, fallbackSections }: AboutInfoPageProps) {
  const { data, isLoading } = usePageContent(pageKey);
  // Même logique de priorité que DynamicInfoPage : contenu back-office si disponible.
  const useFallback = isLoading || !data || (data.sections?.length ?? 0) === 0;
  const title = useFallback ? fallbackTitle : data.title;
  const intro = useFallback ? fallbackIntro : (data.intro ?? undefined);
  const sections: InfoSection[] = useFallback
    ? (fallbackSections ?? [])
    : data.sections.map(section => ({ heading: section.heading, body: renderBody(section.body) }));

  return (
    <div className="flex min-h-screen flex-col bg-[#13091e] font-sans text-white">
      <PublicHeader />
      <section className="relative isolate overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_12%_30%,#74351f_0%,#311c3d_45%,#12091d_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#13091e]/35 to-transparent" />
        <div className="relative mx-auto max-w-[1100px] px-5 py-16 sm:px-8 md:py-24">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-white/85">À propos de Looga</p>
          <h1 className="max-w-[950px] font-heading text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl md:text-6xl">{title}</h1>
          {intro && <p className="mt-6 max-w-[700px] text-base leading-relaxed text-white/90 md:text-lg">{intro}</p>}
        </div>
      </section>
      <main className="mx-auto w-full max-w-[1100px] flex-1 px-5 py-12 sm:px-8 md:py-16">
        <div className="grid gap-5 md:gap-7">
          {sections.map((section, index) => (
            <section key={`${section.heading}-${index}`} className="rounded-[24px] border border-white/10 bg-[#24152f] px-6 py-7 shadow-[0_14px_35px_rgba(0,0,0,0.12)] sm:px-9 sm:py-9">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#ff701f]/15 text-sm font-black text-[#ff791f]">{String(index + 1).padStart(2, '0')}</span>
                <h2 className="font-heading text-xl font-bold text-white sm:text-2xl">{section.heading}</h2>
              </div>
              <div className="space-y-3 text-sm leading-7 text-[#cfc2d8] sm:text-base [&_a]:text-[#ff791f] [&_a]:underline-offset-4 [&_a:hover]:underline [&_li]:mb-1">{section.body}</div>
            </section>
          ))}
        </div>
      </main>
      <AboutFooter />
    </div>
  );
}
