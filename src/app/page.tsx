import React from 'react';
import { Metadata } from 'next';
import DocumentComparer from '@/components/DocumentComparer';
import { allSlugs, seoPagesData } from '@/utils/seoData';

export const metadata: Metadata = {
  title: 'What Changed? — Compare Documents & See What Changed',
  description: 'Compare two PDFs, Word documents, or text files and instantly see what changed. Free, simple, private, and no signup required.',
  alternates: {
    canonical: '/',
  },
};

export default function HomePage() {
  const faqs = [
    {
      q: 'How do I compare two PDF files?',
      a: 'Drag and drop your original PDF file into the left upload slot, then drop the revised PDF into the right slot. Click "Compare" to immediately highlight text additions, removals, and modifications side-by-side.'
    },
    {
      q: 'Can I compare two PDFs for free?',
      a: 'Yes, What Changed? is a 100% free internet utility. There are no subscriptions, payment popups, credit systems, usage caps, or accounts required to perform document audits.'
    },
    {
      q: 'How can I find differences between two documents?',
      a: 'Our deterministic algorithm segments document text into paragraphs and lines, aligns matching clauses, runs a Jaccard text similarity calculation to identify edited lines, and highlights word-level changes (e.g. number adjustments or modified terms) without clutter.'
    },
    {
      q: 'Can I compare Word documents?',
      a: 'Yes, you can upload Microsoft Word (.docx) documents in either slot. You can also mix-and-match files, comparing a DOCX file on one side to a PDF or TXT file on the other.'
    },
    {
      q: 'Can I compare two versions of a contract?',
      a: 'Absolutely. Inspecting contract revisions is a major use case. The tool detects modified fee rates, payment deadlines (e.g., Net 30 → 15 days), and clause adjustments, displaying them in a dedicated "Important Changes" summary.'
    },
    {
      q: 'Can I compare scanned PDFs?',
      a: 'If your PDF is scanned or is an image document, our engine detects the absence of selectable text and prompts you to run local browser OCR. This visually reads characters in your browser without data leaks.'
    },
    {
      q: 'Are my files uploaded to a server?',
      a: 'No. Privacy is our core principle. Document text extraction and differences comparison are calculated 100% inside your local web browser. Your files never leave your device.'
    },
    {
      q: 'How long are uploaded files stored?',
      a: 'They are never stored at all. Because all processing is client-side in your browser sandbox, files exist temporarily in browser memory and are deleted immediately when you close the tab.'
    },
    {
      q: 'Can I compare large PDFs?',
      a: 'Yes. The tool runs locally using your computer resources, easily handling documents up to 20MB in size. Processing massive files (e.g. hundreds of pages) may require a few seconds of browser computing time.'
    },
    {
      q: 'Does this work on mobile?',
      a: 'Yes. What Changed? is fully responsive and optimized for mobile screens. You can select files from your mobile storage, compare them, and tap to read differences easily without zooming.'
    }
  ];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': faqs.map((f) => ({
      '@type': 'Question',
      'name': f.q,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': f.a,
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
        {/* HERO SECTION: Human and welcoming tone, lifting uploader */}
        <section className="bg-zinc-50/30 dark:bg-zinc-950/20 border-b border-zinc-200 dark:border-zinc-900 py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white uppercase">
              Compare documents
            </h1>
            <p className="mt-2.5 text-sm text-zinc-650 dark:text-zinc-400 font-sans leading-relaxed max-w-2xl mx-auto">
              Upload two versions of a document to see exactly what changed. It’s completely free, runs entirely in your browser, and your files never touch a server.
            </p>
          </div>

          {/* Core comparative dropzone */}
          <div className="max-w-5xl mx-auto">
            <DocumentComparer defaultFormat="pdf" />
          </div>
        </section>

        {/* FAQ & Quick Links Matrix */}
        <section className="bg-white dark:bg-black py-20 sm:py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto space-y-12">
            
            {/* Short Introduction */}
            <div className="text-center sm:text-left">
              <h2 className="text-xs font-mono font-extrabold text-zinc-450 uppercase tracking-widest mb-2">
                Document Comparison Utility
              </h2>
              <p className="text-sm text-zinc-555 dark:text-zinc-400 leading-relaxed font-sans">
                what changed? extracts, aligns, and highlights text differences from <strong className="font-bold text-indigo-600 dark:text-indigo-400">PDF</strong>, <strong className="font-bold text-indigo-600 dark:text-indigo-400">DOCX</strong>, and <strong className="font-bold text-indigo-600 dark:text-indigo-400">TXT</strong> files. Computations occur dynamically in your local browser sandbox—keeping files entirely private.
              </p>
            </div>

            {/* Collapsible Accordion FAQs */}
            <div className="space-y-3">
              <h2 className="text-xs font-mono font-extrabold text-zinc-450 uppercase tracking-widest mb-4 text-center sm:text-left">
                Frequently Asked Questions
              </h2>
              
              <div className="divide-y divide-zinc-200 dark:divide-zinc-900 border-y border-zinc-200 dark:divide-zinc-900">
                {faqs.map((faq, idx) => (
                  <details 
                    key={idx} 
                    className="group py-5 [&_summary::-webkit-details-marker]:hidden"
                  >
                    <summary className="flex items-center justify-between cursor-pointer focus:outline-none">
                      <span className="text-xs font-mono font-bold uppercase tracking-wide text-zinc-800 dark:text-zinc-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {faq.q}
                      </span>
                      <span className="text-indigo-600 dark:text-indigo-400 transition-colors text-xs font-mono select-none font-bold">
                        +
                      </span>
                    </summary>
                    <div className="mt-3 pb-2 text-xs sm:text-sm text-zinc-555 dark:text-zinc-400 leading-relaxed font-sans transition-all pl-1">
                      {faq.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>

            {/* Quick Links Matrix to Landing Pages (Polished as a natural footer list) */}
            <div className="pt-6 border-t border-zinc-200 dark:border-zinc-900 text-center">
              <p className="text-[10px] font-mono font-extrabold text-zinc-400 uppercase tracking-widest mb-3">
                Other Comparison Tools
              </p>
              <div className="inline-flex flex-wrap justify-center gap-x-3 gap-y-1.5 text-xs text-zinc-500">
                {allSlugs.map((s, idx) => (
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
