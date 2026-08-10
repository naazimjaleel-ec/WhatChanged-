import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { blogPostsData, allBlogSlugs } from '@/utils/blogData';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return allBlogSlugs.map((slug) => ({
    slug: slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPostsData[slug];

  if (!post) {
    return {};
  }

  return {
    title: `${post.title} — Guide | What Changed?`,
    description: post.description,
    alternates: {
      canonical: `/blog/${slug}`,
    },
    openGraph: {
      title: `${post.title} — Guide`,
      description: post.description,
      url: `/blog/${slug}`,
      type: 'article',
      publishedTime: post.publishDate,
      authors: [post.author],
    },
  };
}

function parseInlineMarkdown(text: string): React.ReactNode[] {
  const boldOrLinkRegex = /(\*\*.*?\*\*|\[.*?\]\(.*?\))/g;
  const matches = text.split(boldOrLinkRegex);
  
  return matches.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-bold text-zinc-950 dark:text-white">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('[') && part.includes('](')) {
      const closingBracket = part.indexOf(']');
      const label = part.slice(1, closingBracket);
      const url = part.slice(closingBracket + 2, -1);
      return <a key={index} href={url} className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">{label}</a>;
    }
    return part;
  });
}

function renderMarkdown(markdown: string) {
  return markdown.split('\n\n').map((block, idx) => {
    const trimmed = block.trim();
    if (!trimmed) return null;

    if (trimmed.startsWith('### ')) {
      return (
        <h3 key={idx} className="text-sm font-mono font-bold uppercase tracking-wider text-zinc-900 dark:text-white mt-8 mb-4">
          {trimmed.replace('### ', '')}
        </h3>
      );
    }
    if (trimmed.startsWith('## ')) {
      return (
        <h2 key={idx} className="text-base font-mono font-extrabold uppercase tracking-widest text-zinc-900 dark:text-white mt-10 mb-5">
          {trimmed.replace('## ', '')}
        </h2>
      );
    }
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const items = trimmed.split('\n').map((item) => item.replace(/^[-*]\s+/, ''));
      return (
        <ul key={idx} className="list-disc pl-5 space-y-2 text-sm text-zinc-650 dark:text-zinc-400 my-6 font-sans">
          {items.map((it, i) => (
            <li key={i}>{parseInlineMarkdown(it)}</li>
          ))}
        </ul>
      );
    }
    if (trimmed.match(/^\d+\.\s+/)) {
      const items = trimmed.split('\n').map((item) => item.replace(/^\d+\.\s+/, ''));
      return (
        <ol key={idx} className="list-decimal pl-5 space-y-2 text-sm text-zinc-650 dark:text-zinc-400 my-6 font-sans">
          {items.map((it, i) => (
            <li key={i}>{parseInlineMarkdown(it)}</li>
          ))}
        </ol>
      );
    }
    return (
      <p key={idx} className="text-sm sm:text-base text-zinc-600 dark:text-zinc-350 leading-relaxed my-5 font-sans">
        {parseInlineMarkdown(trimmed)}
      </p>
    );
  });
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = blogPostsData[slug];

  if (!post) {
    notFound();
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': post.faq.map((item) => ({
      '@type': 'Question',
      'name': item.q,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': item.a,
      },
    })),
  };

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
      },
      {
        '@type': 'ListItem',
        'position': 3,
        'name': post.title,
        'item': `https://whatchanged.com/blog/${post.slug}`
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-white dark:bg-black w-full flex-1">
        {/* Navigation Breadcrumb */}
        <nav className="text-[10px] text-zinc-400 mb-6 flex items-center gap-1.5 font-mono uppercase tracking-wider">
          <a href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Home</a>
          <span>/</span>
          <a href="/blog" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Blog</a>
          <span>/</span>
          <span className="text-zinc-600 dark:text-zinc-350 truncate">{post.title}</span>
        </nav>

        {/* Heading */}
        <header className="mb-10 pb-8 border-b border-zinc-200 dark:border-zinc-900">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white font-mono leading-tight">
            {post.title}
          </h1>
          <div className="mt-4 flex items-center gap-4 text-[10px] text-zinc-400 font-mono uppercase tracking-wide">
            <span>Published: {post.publishDate}</span>
            <span>•</span>
            <span>By {post.author}</span>
          </div>
        </header>

        {/* Main Body */}
        <div className="article-body">
          {renderMarkdown(post.body)}
        </div>

        {/* Direct Call to Action Tool link */}
        {post.relatedTools.length > 0 && (
          <div className="my-10 p-6 border border-zinc-200 dark:border-zinc-900 rounded-none bg-zinc-50/20 dark:bg-zinc-950/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs font-mono font-extrabold text-zinc-900 dark:text-white uppercase tracking-wider">
                Need to compare your files now?
              </p>
              <p className="text-[11px] text-zinc-400 font-sans">
                100% private, free, and instantly processed in your browser.
              </p>
            </div>
            <div className="flex gap-2">
              {post.relatedTools.map((tool) => (
                <a
                  key={tool.href}
                  href={tool.href}
                  className="text-[10px] font-mono font-bold uppercase tracking-wider px-4 py-2 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all border border-zinc-950 dark:border-white shadow-sm"
                >
                  {tool.title} &rarr;
                </a>
              ))}
            </div>
          </div>
        )}

        {/* FAQs */}
        {post.faq.length > 0 && (
          <div className="mt-12 pt-10 border-t border-zinc-200 dark:border-zinc-900">
            <h2 className="text-sm font-mono font-bold uppercase tracking-widest text-zinc-900 dark:text-white mb-6">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {post.faq.map((item, idx) => (
                <div key={idx} className="space-y-1.5 font-sans">
                  <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-250">
                    {item.q}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </article>
    </>
  );
}
