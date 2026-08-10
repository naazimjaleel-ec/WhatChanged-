import mammoth from 'mammoth';

// Initialize PDF.js worker
let pdfjsLib: any = null;

async function loadPdfJS() {
  if (pdfjsLib) return pdfjsLib;
  
  if (typeof window !== 'undefined') {
    // Dynamic import to prevent SSR issues
    const pdfjs = await import('pdfjs-dist');
    // Set worker source
    const version = pdfjs.version || '4.4.168'; // Fallback to a stable version if undefined
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.mjs`;
    pdfjsLib = pdfjs;
    return pdfjsLib;
  }
  
  throw new Error('PDF.js can only be loaded in the browser.');
}

export interface ParsedDocument {
  text: string;
  pages: { pageNum: number; text: string }[];
  isScanned: boolean;
  format: 'pdf' | 'docx' | 'txt';
}

/**
 * Parses plain text files
 */
export async function parseTxt(file: File): Promise<ParsedDocument> {
  const text = await file.text();
  return {
    text,
    pages: [{ pageNum: 1, text }],
    isScanned: false,
    format: 'txt'
  };
}

/**
 * Parses Word (DOCX) files using mammoth
 */
export async function parseDocx(file: File): Promise<ParsedDocument> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  const text = result.value;
  
  // Divide text into pages based on typical line counts or paragraphs if needed,
  // but for DOCX we treat it as a single flow. We can segment by double newlines.
  const paragraphs = text.split(/\n\s*\n/);
  const pages = paragraphs.map((p, index) => ({
    pageNum: Math.floor(index / 10) + 1, // rough pagination heuristic for UI jumping
    text: p.trim()
  }));

  return {
    text,
    pages,
    isScanned: false,
    format: 'docx'
  };
}

/**
 * Parses PDF files using pdfjs-dist
 */
export async function parsePdf(
  file: File,
  onProgress?: (percent: number) => void
): Promise<ParsedDocument> {
  const pdfjs = await loadPdfJS();
  const arrayBuffer = await file.arrayBuffer();
  
  const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
  
  if (onProgress) {
    loadingTask.onProgress = (progressData: { loaded: number; total: number }) => {
      if (progressData.total > 0) {
        onProgress(Math.round((progressData.loaded / progressData.total) * 50)); // First 50% for loading file
      }
    };
  }

  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;
  const pages: { pageNum: number; text: string }[] = [];
  let fullText = '';
  let emptyPagesCount = 0;

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    
    // Heuristic reconstruction of layout to preserve lines and spacing
    let lastY = -1;
    let pageText = '';
    
    for (const item of textContent.items as any[]) {
      const y = item.transform[5]; // Y-coordinate of text run
      
      // If Y-coordinate is significantly different, insert newline
      if (lastY !== -1 && Math.abs(y - lastY) > 6) {
        pageText += '\n';
      } else if (pageText.length > 0 && !pageText.endsWith(' ') && !item.str.startsWith(' ')) {
        pageText += ' ';
      }
      
      pageText += item.str;
      lastY = y;
    }
    
    const trimmedText = pageText.trim();
    if (trimmedText === '') {
      emptyPagesCount++;
    }
    
    pages.push({ pageNum: i, text: trimmedText });
    fullText += trimmedText + '\n\n';

    if (onProgress) {
      // Scale from 50% to 100% for page text extraction
      onProgress(50 + Math.round((i / numPages) * 50));
    }
  }

  // If more than 80% of pages are empty, or it's empty overall, classify as scanned PDF
  const isScanned = numPages > 0 && (emptyPagesCount / numPages) > 0.8;

  return {
    text: fullText.trim(),
    pages,
    isScanned,
    format: 'pdf'
  };
}

/**
 * Performs client-side OCR on a scanned PDF file
 */
export async function runOcrOnPdf(
  file: File,
  onProgress?: (message: string, percent: number) => void
): Promise<{ text: string; pages: { pageNum: number; text: string }[] }> {
  const pdfjs = await loadPdfJS();
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;
  
  // Dynamically import tesseract.js in the browser
  const { createWorker } = await import('tesseract.js');
  
  if (onProgress) onProgress('Initializing OCR engine...', 5);
  const worker = await createWorker('eng');
  
  const pages: { pageNum: number; text: string }[] = [];
  let fullText = '';

  for (let i = 1; i <= numPages; i++) {
    if (onProgress) onProgress(`Rendering Page ${i} for OCR...`, Math.round(5 + ((i - 1) / numPages) * 90));
    
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2.0 }); // 2.0x scale for better OCR accuracy
    
    // Create canvas to render PDF page visually
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const context = canvas.getContext('2d');
    
    if (!context) {
      throw new Error(`Failed to create canvas context for page ${i}`);
    }
    
    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise;
    
    // Convert canvas to blob / image data URL
    const dataUrl = canvas.toDataURL('image/png');
    
    if (onProgress) onProgress(`Running OCR on Page ${i}...`, Math.round(5 + ((i - 0.5) / numPages) * 90));
    
    const ocrResult = await worker.recognize(dataUrl);
    const pageText = ocrResult.data.text.trim();
    
    pages.push({ pageNum: i, text: pageText });
    fullText += pageText + '\n\n';
  }
  
  await worker.terminate();
  if (onProgress) onProgress('OCR completed!', 100);

  return {
    text: fullText.trim(),
    pages
  };
}
