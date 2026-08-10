export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-16 bg-white dark:bg-black w-full">
      <div className="space-y-4 max-w-md">
        <p className="font-mono text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
          404 - Page Not Found
        </p>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white font-mono uppercase">
          We can't find that page
        </h1>
        <p className="text-xs sm:text-sm text-zinc-450 dark:text-zinc-400 leading-relaxed font-sans">
          The page you are looking for might have been moved, deleted, or does not exist. Try returning home to compare your documents.
        </p>
        <div className="pt-4 flex flex-col sm:flex-row gap-2 justify-center">
          <a
            href="/"
            className="text-[10px] px-4 py-2 font-mono font-bold uppercase tracking-wider bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors border border-zinc-950 dark:border-white shadow-sm"
          >
            Go to Homepage
          </a>
          <a
            href="/compare-pdf"
            className="text-[10px] px-4 py-2 font-mono font-bold uppercase tracking-wider border border-zinc-250 dark:border-zinc-800 text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900 transition-colors"
          >
            Compare PDF Files
          </a>
        </div>
      </div>
    </div>
  );
}
