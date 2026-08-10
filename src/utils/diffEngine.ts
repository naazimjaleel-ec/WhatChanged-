import { diffArrays, diffWordsWithSpace } from 'diff';

export interface SentenceItem {
  text: string;
  pageNum: number;
  heading: string;
}

export interface DiffChange {
  id: string;
  type: 'ADDED' | 'REMOVED' | 'CHANGED';
  label: string;
  oldText: string;
  newText: string;
  diffHtml: string;
  pageNum: number;
  section: string;
  contextBefore: string[];
  contextAfter: string[];
}

export interface ImportantChange {
  id: string;
  label: string;
  oldVal: string;
  newVal: string;
  pageNum: number;
  section: string;
  changeId: string; // references the parent DiffChange id
}

export interface ComparisonResult {
  totalChanges: number;
  addedCount: number;
  removedCount: number;
  changedCount: number;
  changes: DiffChange[];
  importantChanges: ImportantChange[];
}

/**
 * Segments a paragraph into sentences, filtering out common abbreviations
 */
function splitIntoSentences(text: string): string[] {
  const abbrevRegex = /\b(e\.g\.|i\.e\.|vs\.|mr\.|mrs\.|ms\.|dr\.|prof\.|etc\.|co\.|corp\.|inc\.)\s*$/i;
  const rawParts = text.split(/([.!?]\s+)(?=[A-Z])/);
  const sentences: string[] = [];
  let currentSentence = '';

  for (let i = 0; i < rawParts.length; i++) {
    const part = rawParts[i];
    if (!part) continue;
    
    currentSentence += part;
    
    const isSpacer = /[.!?]\s+$/.test(part);
    if (isSpacer || i === rawParts.length - 1) {
      const textBeforePunc = isSpacer 
        ? currentSentence.substring(0, currentSentence.length - part.length).trim()
        : currentSentence.trim();
        
      if (abbrevRegex.test(textBeforePunc)) {
        continue;
      }
      
      const completed = currentSentence.trim();
      if (completed) {
        sentences.push(completed);
      }
      currentSentence = '';
    }
  }
  
  if (currentSentence.trim()) {
    sentences.push(currentSentence.trim());
  }

  return sentences;
}

/**
 * Normalizes spacing inside text blocks
 */
function normalizeTextSpacing(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Splits a paragraph block into separate sub-blocks based on structural boundaries:
 * - Bullet list items (starting with -, *, •)
 * - Numbered items (starting with 1. )
 * - Code / config lines (containing =)
 * - Table rows (containing |)
 * - Headings
 * - Respects normal paragraph line wraps
 */
function splitParagraphIntoBlocks(para: string): string[] {
  const lines = para.split('\n');
  const blocks: string[] = [];
  let currentBlock = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const prevLine = i > 0 ? lines[i - 1].trim() : '';
    
    const isBullet = /^[-\*•]\s+/.test(line) || /^\d+\.\s+/.test(line);
    const isLineHeading = isHeading(line);
    const isConfigLine = line.includes('=') || /^[A-Z_]+:/.test(line);
    const isTableLine = line.includes('|');
    const prevEndedSentence = prevLine === '' || /[.!?:]$/.test(prevLine);
    const prevWasHeading = prevLine !== '' && isHeading(prevLine);
    
    if (isBullet || isLineHeading || isConfigLine || isTableLine || prevEndedSentence || prevWasHeading || !currentBlock) {
      if (currentBlock) {
        blocks.push(currentBlock.trim());
      }
      currentBlock = line;
    } else {
      // Merge lines to handle normal paragraph wrapping
      currentBlock += ' ' + line;
    }
  }
  
  if (currentBlock) {
    blocks.push(currentBlock.trim());
  }

  const finalBlocks: string[] = [];
  for (const block of blocks) {
    if (isHeading(block) || block.includes('=') || block.includes('|')) {
      finalBlocks.push(normalizeTextSpacing(block));
    } else {
      const sentences = splitIntoSentences(block);
      for (const sent of sentences) {
        finalBlocks.push(normalizeTextSpacing(sent));
      }
    }
  }
  
  return finalBlocks;
}

/**
 * Splits document text into structured sentences/blocks with metadata (page number, section headings)
 */
export function preprocessDocument(
  text: string,
  pages: { pageNum: number; text: string }[]
): SentenceItem[] {
  const sentences: SentenceItem[] = [];
  
  const pageLookup = pages.map(p => ({
    pageNum: p.pageNum,
    normalizedText: p.text.replace(/\s+/g, ' ').toLowerCase()
  }));

  // Split text by double newlines to get paragraphs
  const paragraphs = text.split(/\n\s*\n/);
  let currentHeading = 'General';
  let currentPage = 1;

  for (let para of paragraphs) {
    const trimmedPara = para.trim();
    if (!trimmedPara) continue;

    // Check if the entire paragraph is a single heading (like SECTION 1: GOVERNING LAW)
    if (isHeading(trimmedPara)) {
      currentHeading = trimmedPara.replace(/\s+/g, ' ');
      const pageNum = findPageNumberForText(trimmedPara, pageLookup, currentPage);
      currentPage = pageNum;
      
      sentences.push({
        text: currentHeading,
        pageNum,
        heading: currentHeading
      });
      continue;
    }

    const pageNum = findPageNumberForText(trimmedPara, pageLookup, currentPage);
    currentPage = pageNum;

    // Segment paragraphs into structured blocks
    const blocks = splitParagraphIntoBlocks(trimmedPara);
    for (const block of blocks) {
      if (!block) continue;
      
      sentences.push({
        text: block,
        pageNum,
        heading: currentHeading
      });
    }
  }

  return sentences;
}

function findPageNumberForText(
  text: string,
  pages: { pageNum: number; normalizedText: string }[],
  fallbackPage: number
): number {
  const normalizedSnippet = text.substring(0, Math.min(40, text.length)).replace(/\s+/g, ' ').toLowerCase();
  if (!normalizedSnippet) return fallbackPage;

  for (const page of pages) {
    if (page.normalizedText.includes(normalizedSnippet)) {
      return page.pageNum;
    }
  }
  return fallbackPage;
}

function isHeading(text: string): boolean {
  if (text.length > 80) return false;
  
  // A heading cannot contain newlines, assignments, or table cell dividers
  if (text.includes('\n') || text.includes('=') || text.includes('|')) return false;

  const headingPatterns = [
    /^(section|clause|article|chapter|paragraph)\s+\d+/i,
    /^(section|clause|article|chapter|paragraph)\s+[ivxldcm]+/i,
    /^\d+(\.\d+)*\.?\s+[A-Z]/,
    /^[A-Z\s\d.,;:-]{4,}$/
  ];

  if (headingPatterns.some(pattern => pattern.test(text))) {
    return true;
  }

  // Fallback: short mixed-case line without terminal punctuation
  const trimmed = text.trim();
  if (trimmed.length < 3 || trimmed.length > 50 || /[.!?]$/.test(trimmed)) {
    return false;
  }

  // If a line starts with a lowercase letter, it cannot be a heading fallback
  if (/^[a-z]/.test(trimmed)) {
    return false;
  }

  // Check if it follows Title Case rules
  const words = trimmed.split(/\s+/);
  const isTitle = words.every(w => {
    if (/^(and|or|of|to|in|for|with|a|an|the|at|by|from|on)$/i.test(w)) return true;
    return /^[A-Z0-9$₹€£¥("']/.test(w);
  });

  return isTitle;
}

function getJaccardSimilarity(str1: string, str2: string): number {
  if (str1.includes('=') && str2.includes('=')) {
    const k1 = str1.split('=')[0].trim().toLowerCase();
    const k2 = str2.split('=')[0].trim().toLowerCase();
    if (k1 === k2) return 1.0;
  }
  if (str1.includes(':') && str2.includes(':')) {
    const k1 = str1.split(':')[0].trim().toLowerCase();
    const k2 = str2.split(':')[0].trim().toLowerCase();
    if (k1.length < 30 && k2.length < 30 && k1 === k2) return 1.0;
  }

  const normalize = (s: string) => s.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean);
  const words1 = new Set(normalize(str1));
  const words2 = new Set(normalize(str2));
  
  if (words1.size === 0 && words2.size === 0) return 1;
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  if (union.size === 0) return 0;
  return intersection.size / union.size;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function generateWordDiffHtml(oldText: string, newText: string): string {
  const diffParts = diffWordsWithSpace(oldText, newText);
  let html = '';

  for (const part of diffParts) {
    const escaped = escapeHtml(part.value);
    if (part.removed) {
      html += `<del class="bg-red-100 dark:bg-red-950/40 text-red-800 dark:text-red-400 line-through px-0.5 rounded" title="Removed">${escaped}</del>`;
    } else if (part.added) {
      html += `<ins class="bg-green-100 dark:bg-green-950/40 text-green-800 dark:text-green-400 no-underline px-0.5 rounded font-semibold" title="Added">${escaped}</ins>`;
    } else {
      html += escaped;
    }
  }

  return html;
}

/**
 * Extracts friendly label for numeric changes from context words in a line
 */
function getFriendlyLabel(lineText: string, changedValue: string): string {
  const cleanLine = textNormalize(lineText);
  const cleanValue = textNormalize(changedValue);

  // 1. Direct value-based overrides
  const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december', 'jan', 'feb', 'mar', 'apr', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  const hasMonth = months.some(m => cleanValue.includes(m));
  const hasYear = /\b\d{4}\b/.test(cleanValue);
  if (hasMonth && (hasYear || /\d+/.test(cleanValue))) {
    return 'Date';
  }

  // 2. Keyword rules
  const rules = [
    { keywords: ['interest', 'apr', 'yield'], label: 'Interest Rate' },
    { keywords: ['price', 'fee', 'cost', 'rent', 'salary', 'compensation', 'amount', 'rate', 'payment', 'paid', 'payout', 'total'], label: 'Price / Payment' },
    { keywords: ['deadline', 'due', 'within', 'days', 'months', 'weeks', 'period', 'duration', 'time'], label: 'Timeline / Deadline' },
    { keywords: ['delivery', 'shipment', 'delivery date', 'completion'], label: 'Delivery' },
    { keywords: ['limit', 'cap', 'maximum', 'minimum', 'threshold'], label: 'Limit / Cap' },
    { keywords: ['effective', 'dated', 'signed', 'expiry', 'termination', 'expiration'], label: 'Date' }
  ];

  for (const rule of rules) {
    if (rule.keywords.some(k => cleanLine.includes(k))) {
      return rule.label;
    }
  }

  const regex = new RegExp(`(?:\\b\\w+\\s+){0,3}${escapeRegExp(changedValue)}`, 'i');
  const match = lineText.match(regex);
  if (match && match[0]) {
    const labelText = match[0].replace(changedValue, '').trim();
    if (labelText.length > 2) {
      return labelText.charAt(0).toUpperCase() + labelText.slice(1);
    }
  }

  return 'Document Detail';
}

function textNormalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, ' ');
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Expands numeric/currency token to include adjacent signs, commas, decimals, currencies, and dates.
 */
function expandValue(text: string, matchedVal: string): string {
  const index = text.indexOf(matchedVal);
  if (index === -1) return matchedVal;

  let start = index;
  while (start > 0 && /[₹$€£¥\d+-,.%\s]/.test(text[start - 1])) {
    if (text[start - 1] === ' ') {
      if (start - 1 > 0 && /[₹$€£¥]/.test(text[start - 2])) {
        start -= 2;
      } else {
        break;
      }
    } else if (text[start - 1] === '.' && (start - 1 === 0 || !/\d/.test(text[start - 2]))) {
      break;
    } else {
      start--;
    }
  }

  const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december', 'jan', 'feb', 'mar', 'apr', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  const leftText = text.substring(0, start).trim();
  const lastWordMatch = leftText.match(/\b[a-zA-Z]+$/);
  if (lastWordMatch) {
    const lastWord = lastWordMatch[0].toLowerCase();
    if (months.includes(lastWord)) {
      start = leftText.lastIndexOf(lastWordMatch[0]);
    }
  }

  let end = index + matchedVal.length;
  // Look right for decimals, commas, percentages, and numeric components, crossing spaces if next word is digit
  while (end < text.length) {
    const nextChar = text[end];
    if (/[0-9,.\-%kKmM]/.test(nextChar)) {
      end++;
    } else if (nextChar === ' ') {
      const rightText = text.substring(end).trim();
      const nextWordMatch = rightText.match(/^\b\d+\b/);
      if (nextWordMatch) {
        end += text.substring(end).indexOf(nextWordMatch[0]) + nextWordMatch[0].length;
      } else {
        break;
      }
    } else {
      break;
    }
  }

  const rightText = text.substring(end);
  const yearMatch = rightText.match(/^\s*,?\s*\b\d{4}\b/);
  if (yearMatch) {
    end += yearMatch[0].length;
  }

  return text.substring(start, end).trim();
}

function containsNumbersOrCurrencyOrMonth(text: string): boolean {
  const hasDigit = /\d+/.test(text);
  const hasCurrency = /[₹$$€£¥%]/.test(text);
  const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december', 'jan', 'feb', 'mar', 'apr', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  const hasMonth = months.some(m => text.toLowerCase().includes(m));
  const hasBoolean = /\b(true|false|yes|no)\b/i.test(text);
  return hasDigit || hasCurrency || hasMonth || hasBoolean;
}

function extractNumericChanges(
  oldText: string,
  newText: string,
  changeId: string,
  pageNum: number,
  section: string,
  importantChanges: ImportantChange[],
  getNewId: () => string
) {
  const wordDiff = diffWordsWithSpace(oldText, newText);

  for (let i = 0; i < wordDiff.length; i++) {
    const part = wordDiff[i];
    const nextPart = wordDiff[i + 1];

    if (part.removed && nextPart && nextPart.added) {
      const oldVal = part.value.trim();
      const newVal = nextPart.value.trim();

      if (oldVal !== newVal && (containsNumbersOrCurrencyOrMonth(oldVal) || containsNumbersOrCurrencyOrMonth(newVal))) {
        if (oldVal.length > 0 && newVal.length > 0) {
          const expandedOld = expandValue(oldText, oldVal);
          const expandedNew = expandValue(newText, newVal);

          const label = getFriendlyLabel(newText, expandedNew);
          importantChanges.push({
            id: getNewId(),
            label,
            oldVal: expandedOld,
            newVal: expandedNew,
            pageNum,
            section,
            changeId
          });
        }
      }
      i++;
    } else if (part.removed && wordDiff[i + 1]?.value.trim() === '' && wordDiff[i + 2]?.added) {
      const nextAdded = wordDiff[i + 2];
      const oldVal = part.value.trim();
      const newVal = nextAdded.value.trim();

      if (oldVal !== newVal && (containsNumbersOrCurrencyOrMonth(oldVal) || containsNumbersOrCurrencyOrMonth(newVal))) {
        if (oldVal.length > 0 && newVal.length > 0) {
          const expandedOld = expandValue(oldText, oldVal);
          const expandedNew = expandValue(newText, newVal);

          const label = getFriendlyLabel(newText, expandedNew);
          importantChanges.push({
            id: getNewId(),
            label,
            oldVal: expandedOld,
            newVal: expandedNew,
            pageNum,
            section,
            changeId
          });
        }
      }
      i += 2;
    }
  }
}

export function compareDocuments(
  oldSentences: SentenceItem[],
  newSentences: SentenceItem[]
): ComparisonResult {
  const diffParts = diffArrays(oldSentences, newSentences, {
    comparator: (a, b) => a.text === b.text
  });

  const changes: DiffChange[] = [];
  const importantChanges: ImportantChange[] = [];
  
  let addedCount = 0;
  let removedCount = 0;
  let changedCount = 0;
  let changeIdCounter = 1;
  let importantIdCounter = 1;

  const getContext = (sentencesList: SentenceItem[], index: number, count = 2) => {
    const before: string[] = [];
    const after: string[] = [];
    
    for (let i = Math.max(0, index - count); i < index; i++) {
      before.push(sentencesList[i].text);
    }
    for (let i = index + 1; i < Math.min(sentencesList.length, index + count + 1); i++) {
      after.push(sentencesList[i].text);
    }
    return { before, after };
  };

  for (let idx = 0; idx < diffParts.length; idx++) {
    const part = diffParts[idx];
    const nextPart = diffParts[idx + 1];

    if (part.removed && nextPart && nextPart.added) {
      const removedItems = part.value;
      const addedItems = nextPart.value;

      const pairedRemoved = new Set<number>();
      const pairedAdded = new Set<number>();

      for (let r = 0; r < removedItems.length; r++) {
        let bestMatchIdx = -1;
        let highestSim = 0.35;

        for (let a = 0; a < addedItems.length; a++) {
          if (pairedAdded.has(a)) continue;
          
          const sim = getJaccardSimilarity(removedItems[r].text, addedItems[a].text);
          if (sim > highestSim) {
            highestSim = sim;
            bestMatchIdx = a;
          }
        }

        if (bestMatchIdx !== -1) {
          pairedRemoved.add(r);
          pairedAdded.add(bestMatchIdx);

          const rItem = removedItems[r];
          const aItem = addedItems[bestMatchIdx];
          const cid = `c_${changeIdCounter++}`;
          
          const newIndex = newSentences.findIndex(l => l === aItem);
          const context = getContext(newSentences, newIndex !== -1 ? newIndex : 0);

          const diffHtml = generateWordDiffHtml(rItem.text, aItem.text);

          changes.push({
            id: cid,
            type: 'CHANGED',
            label: 'Modified sentence',
            oldText: rItem.text,
            newText: aItem.text,
            diffHtml,
            pageNum: aItem.pageNum,
            section: aItem.heading,
            contextBefore: context.before,
            contextAfter: context.after
          });
          changedCount++;

          extractNumericChanges(rItem.text, aItem.text, cid, aItem.pageNum, aItem.heading, importantChanges, () => `imp_${importantIdCounter++}`);
        }
      }

      for (let r = 0; r < removedItems.length; r++) {
        if (pairedRemoved.has(r)) continue;
        const rItem = removedItems[r];
        const cid = `c_${changeIdCounter++}`;
        const oldIndex = oldSentences.findIndex(l => l === rItem);
        const context = getContext(oldSentences, oldIndex !== -1 ? oldIndex : 0);

        changes.push({
          id: cid,
          type: 'REMOVED',
          label: 'Removed sentence',
          oldText: rItem.text,
          newText: '',
          diffHtml: `<del class="bg-red-100 dark:bg-red-950/40 text-red-800 dark:text-red-400 line-through px-0.5 rounded">${escapeHtml(rItem.text)}</del>`,
          pageNum: rItem.pageNum,
          section: rItem.heading,
          contextBefore: context.before,
          contextAfter: context.after
        });
        removedCount++;
      }

      for (let a = 0; a < addedItems.length; a++) {
        if (pairedAdded.has(a)) continue;
        const aItem = addedItems[a];
        const cid = `c_${changeIdCounter++}`;
        const newIndex = newSentences.findIndex(l => l === aItem);
        const context = getContext(newSentences, newIndex !== -1 ? newIndex : 0);

        changes.push({
          id: cid,
          type: 'ADDED',
          label: 'Added sentence',
          oldText: '',
          newText: aItem.text,
          diffHtml: `<ins class="bg-green-100 dark:bg-green-950/40 text-green-800 dark:text-green-400 no-underline px-0.5 rounded font-semibold">${escapeHtml(aItem.text)}</ins>`,
          pageNum: aItem.pageNum,
          section: aItem.heading,
          contextBefore: context.before,
          contextAfter: context.after
        });
        addedCount++;
      }

      idx++;
    } else if (part.removed) {
      for (const rItem of part.value) {
        const cid = `c_${changeIdCounter++}`;
        const oldIndex = oldSentences.findIndex(l => l === rItem);
        const context = getContext(oldSentences, oldIndex !== -1 ? oldIndex : 0);

        changes.push({
          id: cid,
          type: 'REMOVED',
          label: 'Removed sentence',
          oldText: rItem.text,
          newText: '',
          diffHtml: `<del class="bg-red-100 dark:bg-red-950/40 text-red-800 dark:text-red-400 line-through px-0.5 rounded">${escapeHtml(rItem.text)}</del>`,
          pageNum: rItem.pageNum,
          section: rItem.heading,
          contextBefore: context.before,
          contextAfter: context.after
        });
        removedCount++;
      }
    } else if (part.added) {
      for (const aItem of part.value) {
        const cid = `c_${changeIdCounter++}`;
        const newIndex = newSentences.findIndex(l => l === aItem);
        const context = getContext(newSentences, newIndex !== -1 ? newIndex : 0);

        changes.push({
          id: cid,
          type: 'ADDED',
          label: 'Added sentence',
          oldText: '',
          newText: aItem.text,
          diffHtml: `<ins class="bg-green-100 dark:bg-green-950/40 text-green-800 dark:text-green-400 no-underline px-0.5 rounded font-semibold">${escapeHtml(aItem.text)}</ins>`,
          pageNum: aItem.pageNum,
          section: aItem.heading,
          contextBefore: context.before,
          contextAfter: context.after
        });
        addedCount++;
      }
    }
  }

  return {
    totalChanges: addedCount + removedCount + changedCount,
    addedCount,
    removedCount,
    changedCount,
    changes,
    importantChanges
  };
}
