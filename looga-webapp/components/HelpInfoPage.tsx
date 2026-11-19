'use client';

import { Children, isValidElement, type ReactNode } from 'react';
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

type Question = { title: string; answer: ReactNode };
type HelpCategory = { heading: string; questions: Question[] };

function plainText(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(plainText).join('');
  if (isValidElement<{ children?: ReactNode }>(node)) return plainText(node.props.children);
  return '';
}

// Le contenu de secours comporte des blocs <div><p>Question</p><p>Réponse</p></div>.
// On extrait ces blocs sans modifier les liens JSX et les autres éléments.
function fallbackQuestions(body: ReactNode, heading: string): Question[] {
  const root = isValidElement<{ children?: ReactNode }>(body) ? body.props.children : body;
  const children = Children.toArray(root);
  const questions: Question[] = [];
  const other: ReactNode[] = [];

  function visit(node: ReactNode) {
    if (!isValidElement<{ children?: ReactNode }>(node)) {
      if (node != null) other.push(node);
      return;
    }
    const nested = Children.toArray(node.props.children);
    // Bloc de Q/R : premier paragraphe avec une question, suivi d'une réponse.
    if (node.type === 'div' && nested.length >= 2 && isValidElement(nested[0]) && nested[0].type === 'p') {
      const title = plainText(nested[0]).trim();
      if (title.endsWith('?') || title === 'Problèmes de connexion') {
        questions.push({ title, answer: <div className="space-y-3">{nested.slice(1)}</div> });
        return;
      }
    }
    // Conteneurs qui regroupent plusieurs Q/R.
    if (node.type === 'div' && nested.some(child => isValidElement(child) && child.type === 'div')) {
      nested.forEach(visit);
      return;
    }
    other.push(node);
  }
  children.forEach(visit);
  if (other.length) questions.push({ title: questions.length ? 'Informations complémentaires' : heading, answer: <>{other}</> });
  return questions.length ? questions : [{ title: heading, answer: body }];
}

function renderText(body: string): ReactNode {
  return body.split(/\n\s*\n/).map((block, index) => {
    const lines = block.split('\n');
    if (lines.every(line => line.trim().startsWith('- '))) {
      return <ul key={index} className="list-disc space-y-2 pl-5">{lines.map((line, j) => <li key={j}>{line.replace(/^-\s*/, '')}</li>)}</ul>;
    }
    return <p key={index}>{block}</p>;
  });
}

// Convention compatible avec le champ `body` existant du back-office :
// Question ?\nRéponse\n\nQuestion suivante ?\nRéponse...
// Si le contenu ne suit pas cette convention, on le conserve intégralement.
function dynamicQuestions(body: string, heading: string): Question[] {
  const lines = body.split('\n');
  const items: { title: string; lines: string[] }[] = [];
  const preface: string[] = [];
  for (const line of lines) {
    const candidate = line.trim().replace(/^#{1,4}\s*/, '').replace(/^\*\*(.*?)\*\*$/, '$1');
    if (candidate.endsWith('?') && candidate.length < 180) {
      items.push({ title: candidate, lines: [] });
    } else if (items.length) {
      items[items.length - 1].lines.push(line);
    } else {
      preface.push(line);
    }
  }
  if (!items.length) return [{ title: heading, answer: renderText(body) }];
  const questions: Question[] = [];
  if (preface.join('').trim()) questions.push({ title: 'À savoir', answer: renderText(preface.join('\n').trim()) });
  for (const item of items) questions.push({ title: item.title, answer: renderText(item.lines.join('\n').trim()) });
  return questions;
}

export function HelpInfoPage({ pageKey, fallbackTitle, fallbackIntro, fallbackSections }: HelpInfoPageProps) {
  const { data, isLoading } = usePageContent(pageKey);
  const useFallback = isLoading || !data || (data.sections?.length ?? 0) === 0;
  // La rubrique d'introduction est déjà représentée par la bannière.
  // Filtrage appliqué aussi aux sections issues du back-office, sans toucher aux données enregistrées.
  const isIntroCategory = (heading: string) =>
    heading.trim().toLocaleLowerCase('fr').replace(/[’]/g, "'") === "comment pouvons-nous t'aider ?";
  const displayHeading = (heading: string) =>
    heading.trim().toLocaleLowerCase('fr') === 'utilisateurs' ? 'Participants' : heading;

  const categories: HelpCategory[] = (useFallback
    ? fallbackSections.map(section => ({ heading: section.heading, questions: fallbackQuestions(section.body, section.heading) }))
    : data.sections.map(section => ({ heading: section.heading, questions: dynamicQuestions(section.body, section.heading) })))
    .filter(category => !isIntroCategory(category.heading))
    .map(category => ({ ...category, heading: displayHeading(category.heading) }));

  return (
    <div className="flex min-h-screen flex-col bg-[#13091e] font-sans text-white">
      <PublicHeader />
      <section className="relative isolate overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_12%_30%,#74351f_0%,#311c3d_45%,#12091d_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#13091e]/35 to-transparent" />
        <div className="relative mx-auto max-w-[1100px] px-5 py-16 sm:px-8 md:py-24">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-white/85">CENTRE D’AIDE LOOGA</p>
          <h1 className="max-w-[950px] font-heading text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl md:text-6xl">Une question ? On est là.</h1>
          <p className="mt-6 max-w-[700px] text-base leading-relaxed text-white/90 md:text-lg">Trouve rapidement des réponses à tes questions et profite pleinement de Looga.</p>
        </div>
      </section>
      <main className="mx-auto w-full max-w-[1100px] flex-1 px-5 py-12 sm:px-8 md:py-16">
        <div className="space-y-5">
          {categories.map((category, index) => (
            <section key={`${category.heading}-${index}`} className="overflow-hidden rounded-2xl border border-white/10 bg-[#24152f]">
              <h2 className="flex items-center gap-3 border-b border-white/10 px-5 py-5 font-heading text-lg font-bold sm:px-7">
                <span className="text-sm font-black text-[#ff791f]">{String(index + 1).padStart(2, '0')}</span>
                {category.heading}
              </h2>
              <div className="space-y-2 p-3 sm:p-4">
                {category.questions.map((question, j) => (
                  <details key={`${question.title}-${j}`} className="group rounded-xl border border-white/10 bg-[#1b1026] open:border-[#ff791f]/50">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-4 font-semibold text-white marker:hidden sm:px-5 [&::-webkit-details-marker]:hidden">
                      <span>{question.title}</span>
                      <ChevronDown aria-hidden="true" className="h-5 w-5 shrink-0 text-[#ff791f] transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="space-y-4 border-t border-white/10 px-4 py-4 text-sm leading-7 text-[#d3c7dc] sm:px-5 sm:text-base [&_.text-ink]:!text-white [&_.text-ink-muted]:!text-[#d3c7dc] [&_a]:!text-[#ff963f] [&_a]:underline-offset-4 [&_a:hover]:underline [&_strong]:text-white [&_li]:mb-1">
                      {question.answer}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
      <AboutFooter />
    </div>
  );
}
