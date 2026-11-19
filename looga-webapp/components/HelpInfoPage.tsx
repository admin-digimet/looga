'use client';

import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { PublicHeader } from '@/components/PublicHeader';
import { AboutFooter } from '@/components/AboutFooter';
import { usePageContent } from '@/hooks/usePageContent';
import type { InfoSection } from '@/components/InfoPage';

interface HelpInfoPageProps {
  pageKey: string;
  fallbackTitle: string;
  fallbackIntro?: string;
  fallbackSections: InfoSection[];
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

export function HelpInfoPage({ pageKey, fallbackTitle, fallbackIntro, fallbackSections }: HelpInfoPageProps) {
  const { data, isLoading } = usePageContent(pageKey);
  const useFallback = isLoading || !data || (data.sections?.length ?? 0) === 0;
  const title = useFallback ? fallbackTitle : data.title;
  const intro = useFallback ? fallbackIntro : (data.intro ?? undefined);
  const sections: InfoSection[] = useFallback
    ? fallbackSections
    : data.sections.map(section => ({ heading: section.heading, body: renderBody(section.body) }));

  return (
    <div className="flex min-h-screen flex-col bg-[#13091e] font-sans text-white">
      <PublicHeader />
      <section className="relative isolate overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_12%_30%,#74351f_0%,#311c3d_45%,#12091d_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#13091e]/35 to-transparent" />
        <div className="relative mx-auto max-w-[1100px] px-5 py-16 sm:px-8 md:py-24">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-white/85">CENTRE D’AIDE LOOGA</p>
          <h1 className="max-w-[950px] font-heading text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl md:text-6xl">{title}</h1>
          {intro && <p className="mt-6 max-w-[700px] text-base leading-relaxed text-white/90 md:text-lg">{intro}</p>}
        </div>
      </section>
      <main className="mx-auto w-full max-w-[1100px] flex-1 px-5 py-12 sm:px-8 md:py-16">
        <div className="space-y-4">
          {sections.map((section, index) => (
            <details key={`${section.heading}-${index}`} className="group overflow-hidden rounded-2xl border border-white/10 bg-[#24152f] open:border-[#ff791f]/40">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-5 font-heading font-bold text-white marker:hidden sm:px-7 [&::-webkit-details-marker]:hidden">
                <span className="flex items-center gap-3"><span className="text-sm font-black text-[#ff791f]">{String(index + 1).padStart(2, '0')}</span>{section.heading}</span>
                <ChevronDown aria-hidden="true" className="h-5 w-5 shrink-0 text-[#ff791f] transition-transform group-open:rotate-180" />
              </summary>
              <div className="space-y-4 border-t border-white/10 px-5 py-5 text-sm leading-7 text-[#d3c7dc] sm:px-7 sm:text-base [&_.text-ink]:!text-white [&_.text-ink-muted]:!text-[#d3c7dc] [&_a]:!text-[#ff963f] [&_a]:underline-offset-4 [&_a:hover]:underline [&_strong]:text-white [&_li]:mb-1">
                {section.body}
              </div>
            </details>
          ))}
        </div>
      </main>
      <AboutFooter />
    </div>
  );
}
