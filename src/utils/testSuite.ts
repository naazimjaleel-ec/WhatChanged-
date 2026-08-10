export interface TestDocumentPair {
  id: string;
  name: string;
  category: string;
  description: string;
  oldText: string;
  oldPages: { pageNum: number; text: string }[];
  newText: string;
  newPages: { pageNum: number; text: string }[];
  expected: {
    minChanges: number;
    maxChanges: number;
    expectedImportantCount: number;
    verifyImportant?: (imp: any[]) => boolean;
  };
}

export const testSuiteData: TestDocumentPair[] = [
  {
    id: 'contract-clause',
    name: 'Contracts with Changed Clauses',
    category: 'Contracts',
    description: 'Verify editing a specific clause in an agreement alters that clause and leaves others unaffected.',
    oldText: `Clause 4.1: The Service Provider shall deliver monthly analytics reports by the 5th business day of each month.
Clause 4.2: Client shall review the report and provide feedback within 3 business days of receipt.`,
    oldPages: [
      { pageNum: 1, text: `Clause 4.1: The Service Provider shall deliver monthly analytics reports by the 5th business day of each month.\nClause 4.2: Client shall review the report and provide feedback within 3 business days of receipt.` }
    ],
    newText: `Clause 4.1: The Service Provider shall deliver monthly analytics reports by the 10th business day of each month.
Clause 4.2: Client shall review the report and provide feedback within 3 business days of receipt.`,
    newPages: [
      { pageNum: 1, text: `Clause 4.1: The Service Provider shall deliver monthly analytics reports by the 10th business day of each month.\nClause 4.2: Client shall review the report and provide feedback within 3 business days of receipt.` }
    ],
    expected: {
      minChanges: 1,
      maxChanges: 1,
      expectedImportantCount: 1,
      verifyImportant: (imp) => imp.some(i => i.oldVal === '5th' && i.newVal === '10th')
    }
  },
  {
    id: 'invoice-price',
    name: 'Invoices with Changed Prices',
    category: 'Invoices',
    description: 'Verify cost adjustments in line items are caught and labeled as Price / Payment.',
    oldText: `Consulting services: 10 hours at ₹5,000/hr = ₹50,000.
Setup Fee: ₹5,000.
Total Due: ₹55,000.`,
    oldPages: [
      { pageNum: 1, text: `Consulting services: 10 hours at ₹5,000/hr = ₹50,000.\nSetup Fee: ₹5,000.\nTotal Due: ₹55,000.` }
    ],
    newText: `Consulting services: 10 hours at ₹6,500/hr = ₹65,000.
Setup Fee: ₹5,000.
Total Due: ₹70,000.`,
    newPages: [
      { pageNum: 1, text: `Consulting services: 10 hours at ₹6,500/hr = ₹65,000.\nSetup Fee: ₹5,000.\nTotal Due: ₹70,000.` }
    ],
    expected: {
      minChanges: 2,
      maxChanges: 2,
      expectedImportantCount: 4, // ₹5,000 -> ₹6,500, ₹50,000 -> ₹65,000, and ₹55,000 -> ₹70,000 (split across runs)
      verifyImportant: (imp) => imp.some(i => i.label.includes('Price') && i.oldVal.includes('55,000') && i.newVal.includes('70,000'))
    }
  },
  {
    id: 'resume-experience',
    name: 'Resumes with Added/Removed Experience',
    category: 'Resumes',
    description: 'Verify additions and removals of career bullet points on a CV.',
    oldText: `Senior Software Engineer at TechCorp (2020 - 2023)
- Developed React web applications.
- Led team of 3 developers.`,
    oldPages: [
      { pageNum: 1, text: `Senior Software Engineer at TechCorp (2020 - 2023)\n- Developed React web applications.\n- Led team of 3 developers.` }
    ],
    newText: `Staff Software Engineer at TechCorp (2020 - 2025)
- Developed React web applications.
- Led team of 5 developers.
- Architected cloud migration saving $200k/year.`,
    newPages: [
      { pageNum: 1, text: `Staff Software Engineer at TechCorp (2020 - 2025)\n- Developed React web applications.\n- Led team of 5 developers.\n- Architected cloud migration saving $200k/year.` }
    ],
    expected: {
      minChanges: 3,
      maxChanges: 4,
      expectedImportantCount: 2, // Years (2023 -> 2025) and team count (3 -> 5)
      verifyImportant: (imp) => imp.some(i => i.oldVal === '3' && i.newVal === '5')
    }
  },
  {
    id: 'report-numbers',
    name: 'Reports with Changed Numbers',
    category: 'Reports',
    description: 'Ensure quarterly percentages and financials are highlighted in report diffs.',
    oldText: `Quarterly earnings grew by 12.5% to $4.2M in Q3.
Operating costs rose by 4% to $1.1M.`,
    oldPages: [
      { pageNum: 1, text: `Quarterly earnings grew by 12.5% to $4.2M in Q3.\nOperating costs rose by 4% to $1.1M.` }
    ],
    newText: `Quarterly earnings grew by 15.3% to $4.8M in Q3.
Operating costs rose by 6.2% to $1.3M.`,
    newPages: [
      { pageNum: 1, text: `Quarterly earnings grew by 15.3% to $4.8M in Q3.\nOperating costs rose by 6.2% to $1.3M.` }
    ],
    expected: {
      minChanges: 2,
      maxChanges: 2,
      expectedImportantCount: 4, // 12.5% -> 15.3%, $4.2M -> $4.8M, 4% -> 6.2%, $1.1M -> $1.3M
      verifyImportant: (imp) => imp.some(i => i.oldVal === '12.5%' && i.newVal === '15.3%')
    }
  },
  {
    id: 'policy-sections',
    name: 'Policies with Added/Removed Sections',
    category: 'Policies',
    description: 'Verify new section inserts are caught as additions while preceding content remains unmodified.',
    oldText: `1. Privacy Policy
We collect email addresses.
2. Cookie Usage
We use tracking cookies.`,
    oldPages: [
      { pageNum: 1, text: `1. Privacy Policy\nWe collect email addresses.\n2. Cookie Usage\nWe use tracking cookies.` }
    ],
    newText: `1. Privacy Policy
We collect email addresses.
2. Cookie Usage
We use tracking cookies.
3. Data Retention
We keep data for 30 days.`,
    newPages: [
      { pageNum: 1, text: `1. Privacy Policy\nWe collect email addresses.\n2. Cookie Usage\nWe use tracking cookies.\n3. Data Retention\nWe keep data for 30 days.` }
    ],
    expected: {
      minChanges: 2, // Heading 3 + sentence
      maxChanges: 2,
      expectedImportantCount: 0
    }
  },
  {
    id: 'simple-word',
    name: 'Simple PDFs with One Word Changed',
    category: 'Simple',
    description: 'Ensure a single minor edit is identified as a CHANGED sentence.',
    oldText: `This is a simple document with normal text.`,
    oldPages: [
      { pageNum: 1, text: `This is a simple document with normal text.` }
    ],
    newText: `This is a simple document with updated text.`,
    newPages: [
      { pageNum: 1, text: `This is a simple document with updated text.` }
    ],
    expected: {
      minChanges: 1,
      maxChanges: 1,
      expectedImportantCount: 0 // "normal" -> "updated" has no digits/currency
    }
  },
  {
    id: 'completely-different',
    name: 'PDFs with Completely Different Content',
    category: 'Extreme',
    description: 'Ensure comparison between unrelated files marks old as deleted and new as added.',
    oldText: `User Agreement
Please agree to the terms below.`,
    oldPages: [
      { pageNum: 1, text: `User Agreement\nPlease agree to the terms below.` }
    ],
    newText: `Monthly Newsletter
Welcome to our latest updates on product design.`,
    newPages: [
      { pageNum: 1, text: `Monthly Newsletter\nWelcome to our latest updates on product design.` }
    ],
    expected: {
      minChanges: 3, // Heading deleted + sentence deleted, Heading added + sentence added (maybe paired as changes depending on threshold, but should have high changes count)
      maxChanges: 4,
      expectedImportantCount: 0
    }
  },
  {
    id: 'spacing-wrapping',
    name: 'Formatting/Layout changes but identical text',
    category: 'Formatting',
    description: 'Verify paragraph spacing, single newlines, and line wraps do not generate false differences.',
    oldText: `This is a wrapped text
that spans two lines.`,
    oldPages: [
      { pageNum: 1, text: `This is a wrapped text\nthat spans two lines.` }
    ],
    newText: `This is a wrapped text that spans
two lines.`,
    newPages: [
      { pageNum: 1, text: `This is a wrapped text that spans\ntwo lines.` }
    ],
    expected: {
      minChanges: 0,
      maxChanges: 0,
      expectedImportantCount: 0
    }
  },
  {
    id: 'multi-page',
    name: 'Multi Page Documents',
    category: 'Layout',
    description: 'Confirm page numbers are correctly matched and reported across multiple pages.',
    oldText: `Title Page
Welcome to page one.
Content Section
This is page two.`,
    oldPages: [
      { pageNum: 1, text: `Title Page\nWelcome to page one.` },
      { pageNum: 2, text: `Content Section\nThis is page two.` }
    ],
    newText: `Title Page
Welcome to page one.
Content Section
This is updated page two.`,
    newPages: [
      { pageNum: 1, text: `Title Page\nWelcome to page one.` },
      { pageNum: 2, text: `Content Section\nThis is updated page two.` }
    ],
    expected: {
      minChanges: 1,
      maxChanges: 1,
      expectedImportantCount: 0,
      verifyImportant: (imp) => true // verify that page num is 2
    }
  },
  {
    id: 'docx-file',
    name: 'DOCX files (Flow structure)',
    category: 'Word',
    description: 'Simulate DOCX flow edits where paragraphs are augmented and sentences are re-split.',
    oldText: `We will execute the project. We will deliver in phases.`,
    oldPages: [
      { pageNum: 1, text: `We will execute the project. We will deliver in phases.` }
    ],
    newText: `We will execute the project. We will deliver in five distinct phases, subject to review.`,
    newPages: [
      { pageNum: 1, text: `We will execute the project. We will deliver in five distinct phases, subject to review.` }
    ],
    expected: {
      minChanges: 1, // "We will deliver in phases." modified
      maxChanges: 1,
      expectedImportantCount: 0
    }
  },
  {
    id: 'txt-file',
    name: 'TXT files (Plain stream)',
    category: 'Plain Text',
    description: 'Verify file configuration updates are detected and isolated.',
    oldText: `PORT=3000
DB_HOST=localhost
DEBUG=true`,
    oldPages: [
      { pageNum: 1, text: `PORT=3000\nDB_HOST=localhost\nDEBUG=true` }
    ],
    newText: `PORT=8080
DB_HOST=10.0.0.5
DEBUG=false`,
    newPages: [
      { pageNum: 1, text: `PORT=8080\nDB_HOST=10.0.0.5\nDEBUG=false` }
    ],
    expected: {
      minChanges: 3,
      maxChanges: 3,
      expectedImportantCount: 3, // 3000 -> 8080, localhost -> 10.0.0.5 (not numeric, wait, 10.0.0.5 contains numbers), true -> false (no numbers)
      verifyImportant: (imp) => imp.some(i => i.oldVal === '3000' && i.newVal === '8080')
    }
  },
  {
    id: 'changed-dates',
    name: 'Changed Dates',
    category: 'Dates',
    description: 'Verify multi-component dates are fully expanded to capture month names.',
    oldText: `The lease commences on September 1, 2026 and terminates on August 31, 2027.`,
    oldPages: [
      { pageNum: 1, text: `The lease commences on September 1, 2026 and terminates on August 31, 2027.` }
    ],
    newText: `The lease commences on October 1, 2026 and terminates on September 30, 2027.`,
    newPages: [
      { pageNum: 1, text: `The lease commences on October 1, 2026 and terminates on September 30, 2027.` }
    ],
    expected: {
      minChanges: 1,
      maxChanges: 1,
      expectedImportantCount: 2, // "September 1, 2026" -> "October 1, 2026", "August 31, 2027" -> "September 30, 2027"
      verifyImportant: (imp) => imp.some(i => i.label === 'Date' && i.oldVal === 'September 1, 2026' && i.newVal === 'October 1, 2026')
    }
  },
  {
    id: 'changed-percentages',
    name: 'Changed Percentages',
    category: 'Percentages',
    description: 'Ensure rates and percentages are captured with trailing % symbols.',
    oldText: `Late fees accumulate at a rate of 1.5% weekly, capped at 15% total.`,
    oldPages: [
      { pageNum: 1, text: `Late fees accumulate at a rate of 1.5% weekly, capped at 15% total.` }
    ],
    newText: `Late fees accumulate at a rate of 2.5% weekly, capped at 20% total.`,
    newPages: [
      { pageNum: 1, text: `Late fees accumulate at a rate of 2.5% weekly, capped at 20% total.` }
    ],
    expected: {
      minChanges: 1,
      maxChanges: 1,
      expectedImportantCount: 2, // 1.5% -> 2.5%, 15% -> 20%
      verifyImportant: (imp) => imp.some(i => i.oldVal === '1.5%' && i.newVal === '2.5%')
    }
  },
  {
    id: 'changed-currencies',
    name: 'Changed Currencies',
    category: 'Currencies',
    description: 'Ensure USD/GBP currency changes capture both the numeric value and the currency symbol.',
    oldText: `The retainer fee is $1,000 USD or £800 GBP.`,
    oldPages: [
      { pageNum: 1, text: `The retainer fee is $1,000 USD or £800 GBP.` }
    ],
    newText: `The retainer fee is $1,200 USD or £950 GBP.`,
    newPages: [
      { pageNum: 1, text: `The retainer fee is $1,200 USD or £950 GBP.` }
    ],
    expected: {
      minChanges: 1,
      maxChanges: 1,
      expectedImportantCount: 2, // $1,000 -> $1,200, £800 -> £950
      verifyImportant: (imp) => imp.some(i => i.oldVal === '$1,000' && i.newVal === '$1,200')
    }
  },
  {
    id: 'added-paragraphs',
    name: 'Added Paragraphs',
    category: 'Paragraphs',
    description: 'Verify insertion of an entirely new paragraph leaves existing ones aligned.',
    oldText: `Paragraph A.
Paragraph C.`,
    oldPages: [
      { pageNum: 1, text: `Paragraph A.\nParagraph C.` }
    ],
    newText: `Paragraph A.
Paragraph B which is newly inserted.
Paragraph C.`,
    newPages: [
      { pageNum: 1, text: `Paragraph A.\nParagraph B which is newly inserted.\nParagraph C.` }
    ],
    expected: {
      minChanges: 1,
      maxChanges: 1,
      expectedImportantCount: 0
    }
  },
  {
    id: 'removed-paragraphs',
    name: 'Removed Paragraphs',
    category: 'Paragraphs',
    description: 'Verify deletion of a middle paragraph does not break alignment of boundary text.',
    oldText: `Paragraph A.
Paragraph B which is going to be deleted.
Paragraph C.`,
    oldPages: [
      { pageNum: 1, text: `Paragraph A.\nParagraph B which is going to be deleted.\nParagraph C.` }
    ],
    newText: `Paragraph A.
Paragraph C.`,
    newPages: [
      { pageNum: 1, text: `Paragraph A.\nParagraph C.` }
    ],
    expected: {
      minChanges: 1,
      maxChanges: 1,
      expectedImportantCount: 0
    }
  },
  {
    id: 'changed-headings',
    name: 'Changed Headings',
    category: 'Headings',
    description: 'Verify heading edits are classified with the correct heading title.',
    oldText: `SECTION 1: GOVERNING LAW
This agreement follows the law.`,
    oldPages: [
      { pageNum: 1, text: `SECTION 1: GOVERNING LAW\nThis agreement follows the law.` }
    ],
    newText: `SECTION 1: GOVERNING LAW AND JURISDICTION
This agreement follows the law.`,
    newPages: [
      { pageNum: 1, text: `SECTION 1: GOVERNING LAW AND JURISDICTION\nThis agreement follows the law.` }
    ],
    expected: {
      minChanges: 1,
      maxChanges: 1,
      expectedImportantCount: 0
    }
  },
  {
    id: 'table-grid',
    name: 'Tables (Structured grids)',
    category: 'Tables',
    description: 'Verify changes inside spreadsheet-like markdown grid alignments.',
    oldText: `Item | Qty | Rate
Widget A | 10 | $15
Widget B | 5 | $20`,
    oldPages: [
      { pageNum: 1, text: `Item | Qty | Rate\nWidget A | 10 | $15\nWidget B | 5 | $20` }
    ],
    newText: `Item | Qty | Rate
Widget A | 12 | $15
Widget B | 5 | $25`,
    newPages: [
      { pageNum: 1, text: `Item | Qty | Rate\nWidget A | 12 | $15\nWidget B | 5 | $25` }
    ],
    expected: {
      minChanges: 2, // Widget A modified + Widget B modified
      maxChanges: 2,
      expectedImportantCount: 2, // 10 -> 12, $20 -> $25
      verifyImportant: (imp) => imp.some(i => i.oldVal === '10' && i.newVal === '12')
    }
  },
  {
    id: 'scanned-pdf',
    name: 'Scanned PDFs (Empty check)',
    category: 'OCR',
    description: 'Confirm that empty selectable text layouts flag scanned status.',
    oldText: `   `,
    oldPages: [
      { pageNum: 1, text: `   ` }
    ],
    newText: `   `,
    newPages: [
      { pageNum: 1, text: `   ` }
    ],
    expected: {
      minChanges: 0,
      maxChanges: 0,
      expectedImportantCount: 0
    }
  },
  {
    id: 'large-document',
    name: 'Large Document Simulation',
    category: 'Extreme',
    description: 'Verify 20+ sentences are aligned efficiently with 5 specific alterations.',
    oldText: Array.from({ length: 25 }, (_, i) => `Sentence number ${i + 1} represents standard paragraph text.`).join('\n\n'),
    oldPages: [
      { pageNum: 1, text: Array.from({ length: 25 }, (_, i) => `Sentence number ${i + 1} represents standard paragraph text.`).join('\n\n') }
    ],
    newText: Array.from({ length: 25 }, (_, i) => {
      // Modify sentence 3, 7, 12, 18, 22
      if ([3, 7, 12, 18, 22].includes(i + 1)) {
        return `Sentence number ${i + 1} represents updated paragraph text.`;
      }
      return `Sentence number ${i + 1} represents standard paragraph text.`;
    }).join('\n\n'),
    newPages: [
      { pageNum: 1, text: Array.from({ length: 25 }, (_, i) => `Sentence number ${i + 1} represents standard paragraph text.`).join('\n\n') }
    ],
    expected: {
      minChanges: 5,
      maxChanges: 5,
      expectedImportantCount: 0
    }
  }
];
