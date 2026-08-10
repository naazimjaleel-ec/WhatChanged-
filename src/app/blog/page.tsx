import { Metadata } from 'next';
import { blogPostsList } from '@/utils/blogData';

export const metadata: Metadata = {
  title: 'Document Comparison & Auditing Guides — Blog | What Changed?',
  description: 'Genuinely useful tutorials on how to compare PDF files, Word documents, contracts, invoices, and resumes. 100% private, free, and simple.',
  alternates: {
    canonical: '/blog',
  },
};

export default function BlogListPage() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': 'https://whatchanged.com'
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': 'Blog',
        'item': 'https://whatchanged.com/blog'
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-white dark:bg-black w-full flex-1">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white font-mono">
            Document Comparison Guides
          </h1>
          <p className="mt-3 max-w-xl mx-auto text-xs font-mono uppercase tracking-wider text-zinc-400">
            Articles, tutorials, and deep-dives explaining document verification and OCR.
          </p>
        </div>

        <div className="space-y-6">
          {blogPostsList.map((post) => (
            <article
              key={post.slug}
              className="border border-zinc-200 dark:border-zinc-900 p-6 rounded-none bg-white dark:bg-black hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors"
            >
              <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400 mb-2 uppercase tracking-wide">
                <span>{post.publishDate}</span>
                <span>•</span>
                <span>By {post.author}</span>
              </div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white hover:text-indigo-650 dark:hover:text-indigo-400 transition-colors">
                <a href={`/blog/${post.slug}`}>{post.title}</a>
              </h2>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-sans">
                {post.description}
              </p>
              <div className="mt-4">
                <a
                  href={`/blog/${post.slug}`}
                  className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Read full guide &rarr;
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}
