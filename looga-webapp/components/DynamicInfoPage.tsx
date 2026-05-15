'use client';

import { type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { InfoPage, type InfoSection } from '@/components/InfoPage';
import { usePageContent } from '@/hooks/usePageContent';

interface DynamicInfoPageProps {
  pageKey: string;
  fallbackTitle: string;
  fallbackIntro?: string;
  fallbackSections?: InfoSection[];
  fallbackExtra?: ReactNode;
  accordion?: boolean;
}

// Rendu basique d'un body texte : paragraphes (séparés par double \n) +
// listes (lignes commençant par "- ").
function renderBody(body: string): ReactNode {
  const blocks = body.split(/\n\s*\n/);
  return blocks.map((block, i) => {
    const lines = block.split('\n');
    const isList = lines.every((l) => l.trim().startsWith('- '));
    if (isList) {
      return (
        <ul key={i} className="list-disc pl-5 space-y-1.5">
          {lines.map((line, j) => (
            <li key={j}>{line.replace(/^-\s*/, '')}</li>
          ))}
        </ul>
      );
    }
    return <p key={i}>{block}</p>;
  });
}

export function DynamicInfoPage({
  pageKey,
  fallbackTitle,
  fallbackIntro,
  fallbackSections,
  fallbackExtra,
  accordion = false,
}: DynamicInfoPageProps) {
  const { data, isLoading } = usePageContent(pageKey);

  // Tant qu'on charge OU si pas de contenu en DB OU sections vides, on affiche le fallback hardcodé
  const useFallback = isLoading || !data || (data.sections?.length ?? 0) === 0;

  if (useFallback) {
    if (accordion) {
      // Mode accordéon (utilisé par /aide) — render fallback sections en <details>
      return (
        <InfoPage title={fallbackTitle} intro={fallbackIntro}>
          <div className="space-y-3">
            {fallbackSections?.map((section) => (
              <details
                key={section.heading}
                className="group bg-white rounded-xl border border-cream-2 overflow-hidden"
              >
                <summary className="flex items-center justify-between cursor-pointer list-none p-5 font-medium text-ink hover:bg-cream-2 transition-colors">
                  <span className="text-sm md:text-base">{section.heading}</span>
                  <ChevronDown className="w-4 h-4 text-ink-muted shrink-0 transition-transform group-open:rotate-180" />
                </summary>
                <div className="px-5 pb-5 text-sm text-ink-muted leading-relaxed">
                  {section.body}
                </div>
              </details>
            ))}
          </div>
          {fallbackExtra}
        </InfoPage>
      );
    }
    return (
      <InfoPage title={fallbackTitle} intro={fallbackIntro} sections={fallbackSections}>
        {fallbackExtra}
      </InfoPage>
    );
  }

  // Contenu venant de la DB
  const sections: InfoSection[] = data.sections.map((s) => ({
    heading: s.heading,
    body: renderBody(s.body),
  }));

  if (accordion) {
    return (
      <InfoPage title={data.title} intro={data.intro ?? undefined}>
        <div className="space-y-3">
          {sections.map((section) => (
            <details
              key={section.heading}
              className="group bg-white rounded-xl border border-cream-2 overflow-hidden"
            >
              <summary className="flex items-center justify-between cursor-pointer list-none p-5 font-medium text-ink hover:bg-cream-2 transition-colors">
                <span className="text-sm md:text-base">{section.heading}</span>
                <ChevronDown className="w-4 h-4 text-ink-muted shrink-0 transition-transform group-open:rotate-180" />
              </summary>
              <div className="px-5 pb-5 text-sm text-ink-muted leading-relaxed">
                {section.body}
              </div>
            </details>
          ))}
        </div>
        {fallbackExtra}
      </InfoPage>
    );
  }

  return (
    <InfoPage title={data.title} intro={data.intro ?? undefined} sections={sections}>
      {fallbackExtra}
    </InfoPage>
  );
}
