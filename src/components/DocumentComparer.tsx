'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  parseTxt, 
  parseDocx, 
  parsePdf, 
  runOcrOnPdf 
} from '@/utils/documentParsers';
import { 
  preprocessDocument, 
  compareDocuments, 
  ComparisonResult, 
  DiffChange, 
  ImportantChange 
} from '@/utils/diffEngine';
import { 
  FileText, 
  Upload, 
  Trash2, 
  ArrowRight, 
  AlertTriangle, 
  Loader2, 
  Maximize2, 
  Minimize2
} from 'lucide-react';

interface DocumentComparerProps {
  defaultFormat?: 'pdf' | 'docx' | 'txt';
}

export default function DocumentComparer({ defaultFormat = 'pdf' }: DocumentComparerProps) {
  // File Upload State
  const [fileOld, setFileOld] = useState<File | null>(null);
  const [fileNew, setFileNew] = useState<File | null>(null);
  const [dragOverOld, setDragOverOld] = useState(false);
  const [dragOverNew, setDragOverNew] = useState(false);

  // Processing State
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Scanned PDF / OCR state
  const [scannedPdfDetect, setScannedPdfDetect] = useState<{
    fileOldScanned: boolean;
    fileNewScanned: boolean;
  } | null>(null);
  const [ocrConsent, setOcrConsent] = useState<'prompt' | 'accepted' | 'declined'>('prompt');

  // Results State
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'added' | 'removed' | 'changed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedChanges, setExpandedChanges] = useState<Set<string>>(new Set());

  // Input refs
  const fileInputOldRef = useRef<HTMLInputElement>(null);
  const fileInputNewRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Reset state
  const resetAll = () => {
    setFileOld(null);
    setFileNew(null);
    setResult(null);
    setError(null);
    setScannedPdfDetect(null);
    setOcrConsent('prompt');
    setProgressPercent(0);
    setProgressMessage('');
  };

  // Drag and Drop Handlers
  const handleDragOver = (e: React.DragEvent, setDrag: (val: boolean) => void) => {
    e.preventDefault();
    setDrag(true);
  };

  const handleDragLeave = (setDrag: (val: boolean) => void) => {
    setDrag(false);
  };

  const handleDrop = (
    e: React.DragEvent,
    setFile: (f: File) => void,
    setDrag: (val: boolean) => void
  ) => {
    e.preventDefault();
    setDrag(false);
    setError(null);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndSetFile(file, setFile);
    }
  };

  const validateAndSetFile = (file: File, setFile: (f: File) => void) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    const validExtensions = ['pdf', 'docx', 'txt'];
    
    if (!ext || !validExtensions.includes(ext)) {
      setError(`Unsupported file type. Please upload PDF, DOCX, or TXT files.`);
      return;
    }
    
    if (file.size > 20 * 1024 * 1024) {
      setError(`File is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Please upload files under 20MB.`);
      return;
    }

    setFile(file);
    setResult(null);
    setScannedPdfDetect(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, setFile: (f: File) => void) => {
    setError(null);
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0], setFile);
    }
  };

  // Trigger file inputs
  const triggerOldUpload = (e: React.MouseEvent | React.KeyboardEvent) => {
    fileInputOldRef.current?.click();
  };

  const triggerNewUpload = (e: React.MouseEvent | React.KeyboardEvent) => {
    fileInputNewRef.current?.click();
  };

  // Run Document Comparison
  const handleCompare = async (bypassOcrPrompt = false) => {
    if (!fileOld || !fileNew) return;

    setIsProcessing(true);
    setError(null);
    setProgressPercent(10);
    setProgressMessage('Extracting document contents...');

    try {
      let docOldText = '';
      let docOldPages: { pageNum: number; text: string }[] = [];
      let docNewText = '';
      let docNewPages: { pageNum: number; text: string }[] = [];
      
      let isOldScanned = false;
      let isNewScanned = false;

      // 1. Extract Old Version
      const oldExt = fileOld.name.split('.').pop()?.toLowerCase();
      if (oldExt === 'txt') {
        const parsed = await parseTxt(fileOld);
        docOldText = parsed.text;
        docOldPages = parsed.pages;
      } else if (oldExt === 'docx') {
        const parsed = await parseDocx(fileOld);
        docOldText = parsed.text;
        docOldPages = parsed.pages;
      } else if (oldExt === 'pdf') {
        const parsed = await parsePdf(fileOld, (p) => {
          setProgressPercent(Math.round(10 + p * 0.4));
        });
        docOldText = parsed.text;
        docOldPages = parsed.pages;
        isOldScanned = parsed.isScanned;
      }

      // 2. Extract New Version
      const newExt = fileNew.name.split('.').pop()?.toLowerCase();
      if (newExt === 'txt') {
        const parsed = await parseTxt(fileNew);
        docNewText = parsed.text;
        docNewPages = parsed.pages;
      } else if (newExt === 'docx') {
        const parsed = await parseDocx(fileNew);
        docNewText = parsed.text;
        docNewPages = parsed.pages;
      } else if (newExt === 'pdf') {
        const parsed = await parsePdf(fileNew, (p) => {
          setProgressPercent(Math.round(50 + p * 0.4));
        });
        docNewText = parsed.text;
        docNewPages = parsed.pages;
        isNewScanned = parsed.isScanned;
      }

      // 3. Detect Scanned PDFs
      if (!bypassOcrPrompt && (isOldScanned || isNewScanned)) {
        setScannedPdfDetect({
          fileOldScanned: isOldScanned,
          fileNewScanned: isNewScanned
        });
        setIsProcessing(false);
        setProgressPercent(0);
        return;
      }

      // 4. Perform OCR if requested and accepted
      if (scannedPdfDetect && ocrConsent === 'accepted') {
        if (scannedPdfDetect.fileOldScanned) {
          setProgressMessage('Running OCR on Original PDF (local processing)...');
          const ocrResult = await runOcrOnPdf(fileOld, (msg, pct) => {
            setProgressMessage(`Original PDF OCR: ${msg}`);
            setProgressPercent(Math.round(pct * 0.5));
          });
          docOldText = ocrResult.text;
          docOldPages = ocrResult.pages;
        }

        if (scannedPdfDetect.fileNewScanned) {
          setProgressMessage('Running OCR on Revised PDF (local processing)...');
          const ocrResult = await runOcrOnPdf(fileNew, (msg, pct) => {
            setProgressMessage(`Revised PDF OCR: ${msg}`);
            setProgressPercent(Math.round(50 + pct * 0.5));
          });
          docNewText = ocrResult.text;
          docNewPages = ocrResult.pages;
        }
      }

      setProgressMessage('Aligning documents and calculating differences...');
      setProgressPercent(95);

      if (!docOldText.trim() && !docNewText.trim()) {
        throw new Error('Both documents appear to be blank. Check your files or run OCR on scanned documents.');
      }

      // 5. Run diff engine
      const oldLines = preprocessDocument(docOldText, docOldPages);
      const newLines = preprocessDocument(docNewText, docNewPages);
      const diffResults = compareDocuments(oldLines, newLines);

      setResult(diffResults);
      setIsProcessing(false);
      setProgressPercent(100);

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

    } catch (err: any) {
      console.error(err);
      setError(
        err.message || 
        "We couldn't read these files. One of them may be damaged, password-protected, or in an unreadable format."
      );
      setIsProcessing(false);
      setProgressPercent(0);
    }
  };

  const handleStartOcr = () => {
    setOcrConsent('accepted');
  };

  const handleDeclineOcr = () => {
    setOcrConsent('declined');
  };

  useEffect(() => {
    if (scannedPdfDetect && ocrConsent !== 'prompt') {
      handleCompare(true);
    }
  }, [ocrConsent, scannedPdfDetect]);

  const toggleContext = (id: string) => {
    setExpandedChanges((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const jumpToChange = (id: string) => {
    const el = document.getElementById(`change-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-2', 'ring-indigo-650', 'dark:ring-indigo-400');
      setTimeout(() => {
        el.classList.remove('ring-2', 'ring-indigo-650', 'dark:ring-indigo-400');
      }, 2000);
      
      setExpandedChanges((prev) => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });
    }
  };

  const filteredChanges = result
    ? result.changes.filter((c) => {
        if (activeTab === 'added' && c.type !== 'ADDED') return false;
        if (activeTab === 'removed' && c.type !== 'REMOVED') return false;
        if (activeTab === 'changed' && c.type !== 'CHANGED') return false;
        
        if (searchTerm) {
          const s = searchTerm.toLowerCase();
          return (
            c.oldText.toLowerCase().includes(s) ||
            c.newText.toLowerCase().includes(s) ||
            c.section.toLowerCase().includes(s)
          );
        }
        return true;
      })
    : [];

  return (
    <div className="w-full space-y-8">
      {/* File Upload Workspace */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        
        {/* OLD VERSION SLOT */}
        <div className="flex flex-col space-y-2">
          <label className="text-[10px] font-mono font-bold tracking-widest text-zinc-400 uppercase">
            Old Version (Original)
          </label>
          <div
            onClick={triggerOldUpload}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                triggerOldUpload(e);
              }
            }}
            tabIndex={0}
            onDragOver={(e) => handleDragOver(e, setDragOverOld)}
            onDragLeave={() => handleDragLeave(setDragOverOld)}
            onDrop={(e) => handleDrop(e, setFileOld, setDragOverOld)}
            className={`relative border border-solid rounded-none h-56 flex flex-col items-center justify-center p-8 text-center transition-all group ${
              fileOld 
                ? 'border-indigo-600/30 dark:border-indigo-500/30 bg-indigo-50/5 dark:bg-indigo-950/5 cursor-pointer hover:border-indigo-650 dark:hover:border-indigo-400' 
                : dragOverOld
                ? 'border-indigo-600 dark:border-indigo-400 bg-indigo-50/10 cursor-pointer outline-none ring-1 ring-indigo-600 dark:ring-indigo-400'
                : 'border-zinc-200 dark:border-zinc-800 hover:border-indigo-650 dark:hover:border-indigo-400 bg-white dark:bg-zinc-950 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-650'
            }`}
          >
            {fileOld ? (
              <div className="space-y-3 w-full max-w-xs">
                <div className="mx-auto w-12 h-10 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 bg-zinc-50 dark:bg-zinc-900 font-mono text-[10px] font-bold uppercase tracking-wider">
                  {fileOld.name.split('.').pop()?.toUpperCase()}
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-zinc-900 dark:text-white truncate px-2" title={fileOld.name}>
                    {fileOld.name}
                  </p>
                  <p className="text-[10px] font-mono text-zinc-400">
                    {fileOld.size > 1024 * 1024 
                      ? `${(fileOld.size / 1024 / 1024).toFixed(2)} MB` 
                      : `${(fileOld.size / 1024).toFixed(1)} KB`
                    }
                  </p>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    Click to replace
                  </span>
                  <button
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setFileOld(null); 
                    }}
                    className="text-[10px] font-mono font-bold text-red-650 dark:text-red-400 uppercase tracking-wider hover:underline inline-flex items-center gap-1 mx-auto"
                  >
                    <Trash2 size={10} /> Remove
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 pointer-events-none">
                <div className="mx-auto w-12 h-12 rounded-full bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-900/50 flex items-center justify-center group-hover:scale-105 transition-all">
                  <Upload className="text-indigo-600 dark:text-indigo-400" size={18} />
                </div>
                <div>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    Select original document
                  </span>
                  <p className="text-[10px] font-mono text-zinc-455 uppercase tracking-widest mt-1">
                    or drag & drop file
                  </p>
                </div>
              </div>
            )}
            <input
              type="file"
              ref={fileInputOldRef}
              onChange={(e) => handleFileSelect(e, setFileOld)}
              accept=".pdf,.docx,.txt"
              className="hidden"
            />
          </div>
        </div>

        {/* NEW VERSION SLOT */}
        <div className="flex flex-col space-y-2">
          <label className="text-[10px] font-mono font-bold tracking-widest text-zinc-400 uppercase">
            New Version (Revised)
          </label>
          <div
            onClick={triggerNewUpload}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                triggerNewUpload(e);
              }
            }}
            tabIndex={0}
            onDragOver={(e) => handleDragOver(e, setDragOverNew)}
            onDragLeave={() => handleDragLeave(setDragOverNew)}
            onDrop={(e) => handleDrop(e, setFileNew, setDragOverNew)}
            className={`relative border border-solid rounded-none h-56 flex flex-col items-center justify-center p-8 text-center transition-all group ${
              fileNew 
                ? 'border-indigo-600/30 dark:border-indigo-500/30 bg-indigo-50/5 dark:bg-indigo-950/5 cursor-pointer hover:border-indigo-650 dark:hover:border-indigo-400' 
                : dragOverNew
                ? 'border-indigo-600 dark:border-indigo-400 bg-indigo-50/10 cursor-pointer outline-none ring-1 ring-indigo-600 dark:ring-indigo-400'
                : 'border-zinc-200 dark:border-zinc-800 hover:border-indigo-650 dark:hover:border-indigo-400 bg-white dark:bg-zinc-950 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-650'
            }`}
          >
            {fileNew ? (
              <div className="space-y-3 w-full max-w-xs">
                <div className="mx-auto w-12 h-10 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 bg-zinc-50 dark:bg-zinc-900 font-mono text-[10px] font-bold uppercase tracking-wider">
                  {fileNew.name.split('.').pop()?.toUpperCase()}
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-zinc-900 dark:text-white truncate px-2" title={fileNew.name}>
                    {fileNew.name}
                  </p>
                  <p className="text-[10px] font-mono text-zinc-400">
                    {fileNew.size > 1024 * 1024 
                      ? `${(fileNew.size / 1024 / 1024).toFixed(2)} MB` 
                      : `${(fileNew.size / 1024).toFixed(1)} KB`
                    }
                  </p>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    Click to replace
                  </span>
                  <button
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setFileNew(null); 
                    }}
                    className="text-[10px] font-mono font-bold text-red-655 dark:text-red-400 uppercase tracking-wider hover:underline inline-flex items-center gap-1 mx-auto"
                  >
                    <Trash2 size={10} /> Remove
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 pointer-events-none">
                <div className="mx-auto w-12 h-12 rounded-full bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-900/50 flex items-center justify-center group-hover:scale-105 transition-all">
                  <Upload className="text-indigo-600 dark:text-indigo-400" size={18} />
                </div>
                <div>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    Select revised document
                  </span>
                  <p className="text-[10px] font-mono text-zinc-450 uppercase tracking-widest mt-1">
                    or drag & drop file
                  </p>
                </div>
              </div>
            )}
            <input
              type="file"
              ref={fileInputNewRef}
              onChange={(e) => handleFileSelect(e, setFileNew)}
              accept=".pdf,.docx,.txt"
              className="hidden"
            />
          </div>
        </div>

      </div>

      {/* Action / Message / Privacy Prompts */}
      <div className="flex flex-col items-center justify-center space-y-6 pt-2">
        {error && (
          <div className="w-full max-w-2xl border border-red-200 dark:border-red-955 bg-red-50/30 dark:bg-red-950/10 p-4 rounded-none text-center">
            <p className="text-xs font-mono font-bold text-red-800 dark:text-red-450 uppercase tracking-wider">
              {error}
            </p>
          </div>
        )}

        {/* Scanned PDF OCR Prompter */}
        {scannedPdfDetect && ocrConsent === 'prompt' && (
          <div className="w-full max-w-2xl border border-amber-250 dark:border-amber-900 bg-amber-50/10 p-5 rounded-none text-left space-y-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" size={16} />
              <div className="space-y-1">
                <h4 className="text-xs font-mono font-extrabold text-amber-900 dark:text-amber-200 uppercase tracking-wider">
                  Scanned PDF Detected
                </h4>
                <p className="text-xs text-zinc-650 dark:text-zinc-400 leading-relaxed">
                  We detected that {scannedPdfDetect.fileOldScanned && scannedPdfDetect.fileNewScanned ? 'both PDFs appear' : 'one of the PDFs appears'} to be scanned images. Standard text extraction returned empty results. 
                  We can perform local browser OCR character recognition. This runs 100% locally and may take a few seconds.
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-1">
              <button
                onClick={handleDeclineOcr}
                className="text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-350 hover:bg-zinc-50 dark:hover:bg-zinc-900"
              >
                Skip OCR
              </button>
              <button
                onClick={handleStartOcr}
                className="text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white shadow-sm"
              >
                Run OCR
              </button>
            </div>
          </div>
        )}

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="w-full max-w-md space-y-3 text-center">
            <div className="flex items-center justify-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-250">
              <Loader2 size={12} className="animate-spin text-indigo-600 dark:text-indigo-400" />
              <span>{progressMessage}</span>
            </div>
            <div className="w-full h-1 bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
              <div 
                className="h-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-300 ease-out" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-zinc-400">{progressPercent}%</span>
          </div>
        )}

        {/* Privacy Promise Bar: Simplified, Friendly, and Accessible */}
        {!isProcessing && (
          <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-550 dark:text-zinc-400 font-sans px-4 text-center max-w-xl mx-auto w-full select-none">
            <span>🔒 Safe & Private: Your files stay on your computer and never touch our servers.</span>
          </div>
        )}

        {/* Actions */}
        {!isProcessing && (!scannedPdfDetect || ocrConsent !== 'prompt') && (
          <div className="flex gap-4">
            {(fileOld || fileNew) && (
              <button
                onClick={resetAll}
                className="px-4 py-2.5 border border-zinc-250 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-mono text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => handleCompare(false)}
              disabled={!fileOld || !fileNew}
              className={`px-8 py-3 font-mono font-bold text-xs uppercase tracking-wider transition-all transform active:scale-95 flex items-center gap-2 border ${
                fileOld && fileNew
                  ? 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white border-indigo-600 dark:border-indigo-500 cursor-pointer shadow-md shadow-indigo-600/10 hover:shadow-indigo-650/20 hover:scale-[1.02]'
                  : 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-400 dark:text-indigo-500 border-indigo-200/80 dark:border-indigo-900/80 cursor-not-allowed'
              }`}
            >
              Compare Documents
            </button>
          </div>
        )}
      </div>

      {/* Results workspace */}
      {result && (
        <div ref={resultsRef} className="pt-12 md:pt-16 border-t border-zinc-200 dark:border-zinc-900 space-y-10">
          
          {/* Unified Summary & Important Changes Card */}
          <div className="border border-zinc-950 dark:border-zinc-850 p-8 space-y-6 bg-zinc-50/50 dark:bg-zinc-950/30">
            <div className="space-y-1">
              <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-900 dark:text-white">
                Analysis Summary
              </h3>
              <p className="text-[10px] font-mono uppercase text-zinc-400">
                Processed 100% locally • Files never leave device
              </p>
            </div>
            
            <p className="text-sm text-zinc-650 dark:text-zinc-350 leading-relaxed font-sans">
              {result.totalChanges === 0 ? (
                "We analyzed both documents and found no differences. The text content is semantically identical, and there are no additions, deletions, or formatting edits."
              ) : (
                `We completed a text-flow analysis. We detected a total of ${result.totalChanges} modifications, consisting of ${result.addedCount} additions, ${result.removedCount} removals, and ${result.changedCount} edited sentences.`
              )}
            </p>
            
            {result.importantChanges.length > 0 && (
              <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
                <p className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                  Critical Value Updates:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {result.importantChanges.map((change) => (
                    <div
                      key={change.id}
                      onClick={() => jumpToChange(change.changeId)}
                      className="border border-zinc-200 dark:border-zinc-800 p-3 bg-white dark:bg-black hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors cursor-pointer flex items-center justify-between text-xs group"
                    >
                      <div className="space-y-1 max-w-[70%]">
                        <span className="text-[9px] font-mono text-zinc-400 uppercase block">{change.label}</span>
                        <div className="flex items-center gap-1.5 text-xs font-mono font-semibold flex-wrap">
                          <span className="line-through text-red-500">{change.oldVal}</span>
                          <ArrowRight size={8} className="text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
                          <span className="text-green-600 dark:text-green-500">{change.newVal}</span>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono text-zinc-400 uppercase bg-zinc-50 dark:bg-zinc-900 px-1.5 py-0.5 border border-zinc-200 dark:border-zinc-800">
                        Page {change.pageNum}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* All Changes Grid & Filters */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Category Filter Tabs */}
              <div className="flex bg-zinc-100 dark:bg-zinc-900 p-0.5 rounded-none text-[10px] font-mono uppercase tracking-wider w-fit">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1.5 font-bold ${
                    activeTab === 'all'
                      ? 'bg-indigo-600 text-white dark:bg-indigo-500 shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                  }`}
                >
                  All ({result.changes.length})
                </button>
                <button
                  onClick={() => setActiveTab('changed')}
                  className={`px-3 py-1.5 font-bold ${
                    activeTab === 'changed'
                      ? 'bg-indigo-600 text-white dark:bg-indigo-500 shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                  }`}
                >
                  Changed ({result.changedCount})
                </button>
                <button
                  onClick={() => setActiveTab('added')}
                  className={`px-3 py-1.5 font-bold ${
                    activeTab === 'added'
                      ? 'bg-indigo-600 text-white dark:bg-indigo-500 shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                  }`}
                >
                  Added ({result.addedCount})
                </button>
                <button
                  onClick={() => setActiveTab('removed')}
                  className={`px-3 py-1.5 font-bold ${
                    activeTab === 'removed'
                      ? 'bg-indigo-600 text-white dark:bg-indigo-500 shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                  }`}
                >
                  Removed ({result.removedCount})
                </button>
              </div>

              {/* Keyword Search */}
              <input
                type="text"
                placeholder="SEARCH CHANGES..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-1.5 text-[10px] font-mono border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black rounded-none focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-400 w-full sm:max-w-xs"
              />
            </div>

            {/* List of changes */}
            <div className="space-y-3">
              {filteredChanges.length > 0 ? (
                filteredChanges.map((change) => {
                  const isExpanded = expandedChanges.has(change.id);
                  return (
                    <div
                      key={change.id}
                      id={`change-${change.id}`}
                      className="border border-zinc-200 dark:border-zinc-900 rounded-none bg-white dark:bg-black overflow-hidden shadow-sm"
                    >
                      {/* Change header */}
                      <div className="bg-zinc-50 dark:bg-zinc-950 px-4 py-2 border-b border-zinc-200 dark:border-zinc-900 flex items-center justify-between text-[10px] font-mono text-zinc-550">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-1.5 py-0.5 font-mono font-bold text-[8px] tracking-wide uppercase ${
                              change.type === 'ADDED'
                                ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400'
                                : change.type === 'REMOVED'
                                ? 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400'
                                : 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-405'
                            }`}
                          >
                            {change.type}
                          </span>
                          <span className="truncate max-w-[200px] sm:max-w-xs font-semibold" title={change.section}>
                            {change.section}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span>Page {change.pageNum}</span>
                          <button
                            onClick={() => toggleContext(change.id)}
                            className="text-zinc-650 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 inline-flex items-center gap-1 font-bold uppercase"
                          >
                            {isExpanded ? (
                              <>
                                <Minimize2 size={9} /> Hide context
                              </>
                            ) : (
                              <>
                                <Maximize2 size={9} /> Show context
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Content panel */}
                      <div className="p-6 space-y-4">
                        {/* If expanded, show context before */}
                        {isExpanded && change.contextBefore.length > 0 && (
                          <div className="text-xs text-zinc-400 dark:text-zinc-500 border-l border-zinc-200 dark:border-zinc-800 pl-3 py-1 space-y-1 select-none font-sans italic">
                            {change.contextBefore.map((c, i) => (
                              <p key={i}>{c}</p>
                            ))}
                          </div>
                        )}

                        {/* Visual inline diff */}
                        <div 
                          className="text-sm font-sans leading-relaxed break-words"
                          dangerouslySetInnerHTML={{ __html: change.diffHtml }}
                        />

                        {/* If expanded, show context after */}
                        {isExpanded && change.contextAfter.length > 0 && (
                          <div className="text-xs text-zinc-400 dark:text-zinc-500 border-l border-zinc-200 dark:border-zinc-800 pl-3 py-1 space-y-1 select-none font-sans italic">
                            {change.contextAfter.map((c, i) => (
                              <p key={i}>{c}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="border border-zinc-200 dark:border-zinc-900 rounded-none bg-white dark:bg-black p-8 text-center text-xs font-mono text-zinc-550">
                  {searchTerm ? 'NO MATCHING CHANGES FOUND.' : 'NO CHANGES IN THIS CATEGORY.'}
                </div>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
