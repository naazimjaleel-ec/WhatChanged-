import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import ThemeToggle from "@/components/ThemeToggle";
import { GoogleAnalytics } from "@next/third-parties/google";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "What Changed? — Compare Documents & See What Changed",
  description: "Compare two PDFs, Word documents, or text files and instantly see what changed. Free, simple, private, and no signup required.",
  metadataBase: new URL("https://whatchanged.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "What Changed? — Compare Documents & See What Changed",
    description: "Compare two PDFs, Word documents, or text files and instantly see what changed. Free, simple, private, and no signup required.",
    url: "/",
    siteName: "What Changed?",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "What Changed? — Compare Documents & See What Changed",
    description: "Compare two PDFs, Word documents, or text files and instantly see what changed. Free, simple, private, and no signup required.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme') || 'light';
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-white text-zinc-950 dark:bg-black dark:text-zinc-50 selection:bg-indigo-500 selection:text-white">
        <header className="border-b border-zinc-200 dark:border-zinc-900 bg-white dark:bg-black">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
            <a href="/" className="flex items-center gap-3 group">
              <svg 
                width="34" 
                height="34" 
                viewBox="0 0 36 36" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
              >
                {/* Background Document (Purple outline) */}
                <path 
                  d="M13 5H23L29 11V27H13V5Z" 
                  className="stroke-indigo-600 dark:stroke-indigo-400" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
                <path 
                  d="M23 5V11H29" 
                  className="stroke-indigo-600 dark:stroke-indigo-400" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
                
                {/* Foreground Document (Theme solid background + Outline) */}
                <path 
                  d="M7 11H17L23 17V33H7V11Z" 
                  className="fill-white dark:fill-black stroke-zinc-950 dark:stroke-white" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
                <path 
                  d="M17 11V17H23" 
                  className="stroke-zinc-950 dark:stroke-white" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
                
                {/* Content Lines inside foreground document */}
                <path 
                  d="M11 21H19" 
                  className="stroke-zinc-950 dark:stroke-white" 
                  strokeWidth="2.5" 
                  strokeLinecap="round"
                />
                <path 
                  d="M11 25H19" 
                  className="stroke-zinc-950 dark:stroke-white" 
                  strokeWidth="2.5" 
                  strokeLinecap="round"
                />
                <path 
                  d="M11 29H15" 
                  className="stroke-zinc-950 dark:stroke-white" 
                  strokeWidth="2.5" 
                  strokeLinecap="round"
                />
              </svg>

              <span className="font-sans font-extrabold text-[19px] tracking-tight text-zinc-950 dark:text-white leading-none">
                What Changed<span className="text-indigo-600 dark:text-indigo-400">?</span>
              </span>
            </a>
            <nav className="flex items-center gap-6">
              <a href="/blog" className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                Guides & Blog
              </a>
              <ThemeToggle />
            </nav>
          </div>
        </header>

        <main className="flex-1 flex flex-col bg-zinc-50/30 dark:bg-zinc-950/20">
          {children}
        </main>

        <footer className="border-t border-zinc-200 dark:border-zinc-900 bg-white dark:bg-black text-xs text-zinc-500 py-8">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <p className="font-mono font-extrabold text-[11px] uppercase tracking-widest text-zinc-900 dark:text-zinc-200 mb-2">What Changed?</p>
                <p className="leading-relaxed font-sans text-zinc-450">
                  A free, 100% private document comparison tool. Files are compared directly in your browser. Nothing is ever uploaded to a server.
                </p>
              </div>
              <div>
                <p className="font-mono font-extrabold text-[11px] uppercase tracking-widest text-zinc-900 dark:text-zinc-200 mb-2">Utilities</p>
                <ul className="space-y-1.5 font-sans">
                  <li><a href="/compare-pdf" className="hover:text-indigo-650 dark:hover:text-indigo-400 transition-colors">Compare PDFs</a></li>
                  <li><a href="/compare-word-documents" className="hover:text-indigo-650 dark:hover:text-indigo-400 transition-colors">Compare Word Docs</a></li>
                  <li><a href="/compare-text-files" className="hover:text-indigo-650 dark:hover:text-indigo-400 transition-colors">Compare Text Files</a></li>
                </ul>
              </div>
              <div>
                <p className="font-mono font-extrabold text-[11px] uppercase tracking-widest text-zinc-900 dark:text-zinc-200 mb-2">SEO Resources</p>
                <ul className="space-y-1.5 font-sans">
                  <li><a href="/compare-contracts" className="hover:text-indigo-650 dark:hover:text-indigo-400 transition-colors">Compare Contracts</a></li>
                  <li><a href="/compare-invoices" className="hover:text-indigo-650 dark:hover:text-indigo-400 transition-colors">Compare Invoices</a></li>
                  <li><a href="/compare-resumes" className="hover:text-indigo-650 dark:hover:text-indigo-400 transition-colors">Compare Resumes</a></li>
                </ul>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-zinc-100 dark:border-zinc-900 text-center flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[10px]">
              <p>&copy; {new Date().getFullYear()} What Changed? All rights reserved.</p>
              <div className="flex gap-4">
                <span className="inline-flex items-center gap-1.5 font-bold text-zinc-900 dark:text-zinc-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                  100% Local & Private
                </span>
              </div>
            </div>
          </div>
        </footer>
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
      </body>
    </html>
  );
}
