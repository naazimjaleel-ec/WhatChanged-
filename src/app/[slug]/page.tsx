import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { seoPagesData, allSlugs } from '@/utils/seoData';
import DocumentComparer from '@/components/DocumentComparer';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return allSlugs.map((slug) => ({
    slug: slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const config = seoPagesData[slug];

  if (!config) {
    return {};
  }

  return {
    title: config.title,
    description: config.metaDescription,
    alternates: {
      canonical: `/${slug}`,
    },
    openGraph: {
      title: config.title,
      description: config.metaDescription,
      url: `/${slug}`,
      type: 'website',
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const config = seoPagesData[slug];

  if (!config) {
    notFound();
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': config.faq.map((item) => ({
      '@type': 'Question',
      'name': item.q,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': item.a,
      },
    })),
  };

  const appSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'What Changed?',
    'operatingSystem': 'All',
    'applicationCategory': 'BusinessApplication',
    'browserRequirements': 'Requires JavaScript. Requires HTML5.',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appSchema) }}
      />

      <div className="flex flex-col w-full bg-white dark:bg-black">
        {/* Tool Section: Welcoming hero spacing */}
        <section className="bg-zinc-50/30 dark:bg-zinc-950/20 border-b border-zinc-200 dark:border-zinc-900 py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white font-mono uppercase">
              {config.h1}
            </h1>
            <p className="mt-2.5 text-sm text-zinc-650 dark:text-zinc-400 font-sans leading-relaxed max-w-2xl mx-auto">
              {config.intro}
            </p>
          </div>
          
          {/* Main comparative workspace */}
          <div className="max-w-5xl mx-auto">
            <DocumentComparer defaultFormat={config.defaultFormat} />
          </div>
        </section>

        {/* Structured Informational Copy Below the fold */}
        <section className="bg-white dark:bg-black py-20 sm:py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto space-y-12">
            
            {/* How It Works */}
            <div>
              <h2 className="text-xs font-mono font-extrabold text-zinc-450 uppercase tracking-widest mb-4">
                How to Compare Files Using This Tool
              </h2>
              <ol className="list-decimal pl-5 space-y-2 text-sm text-zinc-600 dark:text-zinc-450">
                {config.howItWorks.map((step, idx) => (
                  <li key={idx} className="pl-1">
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            <hr className="border-zinc-200 dark:border-zinc-900" />

            {/* Common Use Cases */}
            <div>
              <h2 className="text-xs font-mono font-extrabold text-zinc-450 uppercase tracking-widest mb-4">
                Common Use Cases
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {config.useCases.map((uc, idx) => (
                  <div key={idx} className="border border-zinc-200 dark:border-zinc-800 p-4 rounded-none bg-zinc-50/20 dark:bg-zinc-950/20">
                    <h3 className="text-xs font-mono font-bold text-zinc-850 dark:text-zinc-200 uppercase tracking-wider mb-1.5">
                      {uc.title}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-450 leading-relaxed font-sans">
                      {uc.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <hr className="border-zinc-200 dark:border-zinc-900" />

            {/* Collapsible FAQ section */}
            <div className="space-y-3">
              <h2 className="text-xs font-mono font-extrabold text-zinc-455 uppercase tracking-widest mb-4">
                Frequently Asked Questions
              </h2>
              
              <div className="divide-y divide-zinc-200 dark:divide-zinc-900 border-y border-zinc-200 dark:border-zinc-900">
                {config.faq.map((item, idx) => (
                  <details 
                    key={idx} 
                    className="group py-5 [&_summary::-webkit-details-marker]:hidden"
                  >
                    <summary className="flex items-center justify-between cursor-pointer focus:outline-none">
                      <span className="text-xs font-mono font-extrabold uppercase tracking-wide text-zinc-800 dark:text-zinc-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {item.q}
                      </span>
                      <span className="text-indigo-600 dark:text-indigo-400 transition-colors text-xs font-mono select-none font-bold">
                        +
                      </span>
                    </summary>
                    <div className="mt-3 pb-2 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-sans transition-all pl-1">
                      {item.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>

            {/* Alternative comparison options sitemap */}
            <div className="pt-6 border-t border-zinc-200 dark:border-zinc-900 text-center">
              <p className="text-[10px] font-mono font-extrabold text-zinc-400 uppercase tracking-widest mb-3">
                Alternative Comparison Utilities
              </p>
              <div className="inline-flex flex-wrap justify-center gap-x-3 gap-y-1.5 text-xs text-zinc-500">
                {allSlugs
                  .filter((s) => s !== slug)
                  .map((s, idx) => (
                    <React.Fragment key={s}>
                      {idx > 0 && <span className="text-zinc-350 dark:text-zinc-800 select-none">•</span>}
                      <a
                        href={`/${s}`}
                        className="text-zinc-550 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 underline decoration-zinc-250 dark:decoration-zinc-800 underline-offset-4 transition-all"
                      >
                        {seoPagesData[s].h1.toLowerCase()}
                      </a>
                    </React.Fragment>
                  ))}
              </div>
            </div>

          </div>
        </section>
      </div>
    </>
  );
}
