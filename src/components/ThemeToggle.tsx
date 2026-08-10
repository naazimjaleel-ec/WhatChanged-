'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else {
      // Default strictly to light mode
      setTheme('light');
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  if (!mounted) {
    return (
      <div className="w-8 h-8 border border-zinc-200 dark:border-zinc-800 bg-transparent animate-pulse" />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="w-8 h-8 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-350 dark:hover:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all flex items-center justify-center cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
    >
      {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
    </button>
  );
}
