'use client';

import type { ReactNode } from 'react';
import { PublicHeader } from '@/components/PublicHeader';
import { PublicFooter } from '@/components/PublicFooter';
import { usePageContent } from '@/hooks/usePageContent';
import type { InfoSection } from '@/components/InfoPage';

interface LegalInfoPageProps {
  pageKey: string;
  fallbackTitle: string;
  fallbackIntro?: string;
  fallbackSections?: InfoSection[];
  fallbackExtra?: ReactNode;
}

// Conserve le format texte existant du CMS : paragraphes et listes à tirets.
function renderBody(body: string): ReactNode {
  return body.split(/\n\s*\n/).map((block, index) => {
    const lines = block.split('\n');
    if (lines.every((line) => line.trim().startsWith('- '))) {
      return (
        <ul key={index} className="list-disc space-y-2 pl-5">
          {lines.map((line, i) => <li key={i}>{line.replace(/^-\s*/, '')}</li>)}
        </ul>
      );
    }
    return <p key={index}>{block}</p>;
  });
}

export function LegalInfoPage({
  pageKey,
  fallbackTitle,
  fallbackIntro,
  fallbackSections,
  fallbackExtra,
}: LegalInfoPageProps) {
  const { data, isLoading } = usePageContent(pageKey);
  const useFallback = isLoading || !data || (data.sections?.length ?? 0) === 0;
  const title = useFallback ? fallbackTitle : data.title;
  const intro = useFallback ? fallbackIntro : (data.intro ?? undefined);
  const sections: InfoSection[] = useFallback
    ? (fallbackSections ?? [])
    : data.sections.map((section) => ({
        heading: section.heading,
        body: renderBody(section.body),
      }));

  return (
    <div className="flex min-h-screen flex-col bg-[#13091e] font-sans text-white">
      <PublicHeader />
      <section className="relative isolate overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_12%_30%,#74351f_0%,#311c3d_45%,#12091d_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#13091e]/35 to-transparent" />
        <div className="relative mx-auto w-full max-w-[1100px] px-5 py-16 sm:px-8 md:py-24">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-white/85">
            INFORMATIONS LOOGA
          </p>
          <h1 className="max-w-[950px] font-heading text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl md:text-6xl">
            {title}
          </h1>
          {intro && (
            <p className="mt-6 max-w-[750px] text-base leading-relaxed text-white/90 md:text-lg">
              {intro}
            </p>
          )}
        </div>
      </section>
      <main className="mx-auto w-full max-w-[1100px] flex-1 px-5 py-12 sm:px-8 md:py-16">
        <div className="space-y-5 md:space-y-7">
          {sections.map((section, index) => (
            <section
              key={`${section.heading}-${index}`}
              className="rounded-[24px] border border-white/10 bg-[#24152f] px-6 py-7 shadow-[0_14px_35px_rgba(0,0,0,0.12)] sm:px-9 sm:py-9"
            >
              <div className="mb-4 flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#ff701f]/15 text-sm font-black text-[#ff791f]">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h2 className="font-heading text-xl font-bold leading-snug text-white sm:text-2xl">
                  {section.heading}
                </h2>
              </div>
              <div className="space-y-3 text-sm leading-7 text-[#d3c7dc] sm:text-base [&_.text-ink]:!text-white [&_.text-ink-muted]:!text-[#d3c7dc] [&_a]:!text-[#ff963f] [&_a]:underline-offset-4 [&_a:hover]:underline [&_strong]:text-white [&_li]:mb-1">
                {section.body}
              </div>
            </section>
          ))}
          {fallbackExtra}
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
