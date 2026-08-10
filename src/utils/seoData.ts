export interface SeoPageConfig {
  slug: string;
  title: string;
  metaDescription: string;
  h1: string;
  intro: string;
  toolHeading: string;
  defaultFormat: 'pdf' | 'docx' | 'txt';
  howItWorks: string[];
  useCases: { title: string; text: string }[];
  faq: { q: string; a: string }[];
}

export const seoPagesData: Record<string, SeoPageConfig> = {
  'compare-pdf': {
    slug: 'compare-pdf',
    title: 'Compare PDF Files Online — Free & 100% Private | What Changed?',
    metaDescription: 'Instantly compare two PDF documents side-by-side. Highlight text additions, deletions, and modifications. Zero server uploads - 100% local browser comparison.',
    h1: 'Compare PDF Files',
    intro: 'Need to find the differences between two versions of a PDF? Our free, privacy-first PDF difference checker extracts text and analyzes modifications directly in your browser. Perfect for comparing reports, drafts, and receipts without uploading sensitive documents to external servers.',
    toolHeading: 'Compare Two PDFs',
    defaultFormat: 'pdf',
    howItWorks: [
      'Upload the "Original PDF" (old version) into the first upload zone.',
      'Upload the "Revised PDF" (new version) into the second upload zone.',
      'Click "Compare" to run our deterministic text diffing algorithm.',
      'Review the results, jump directly to page references, and inspect changed numbers, dates, or prices.'
    ],
    useCases: [
      { title: 'Academic Drafts', text: 'Track revisions between drafts of research papers, manuscripts, or homework submissions without sharing your intellectual property.' },
      { title: 'Corporate Financials', text: 'Audit monthly or quarterly PDF reports side-by-side to highlight updated balances, changed percentages, and numeric adjustments.' },
      { title: 'Receipts & Orders', text: 'Confirm details between an original purchase order PDF and the final invoice PDF to detect unauthorized line item changes.' }
    ],
    faq: [
      { q: 'How do I compare two PDF files side-by-side for free?', a: 'Simply upload both PDF versions to the What Changed? uploader. Our tool reads the files client-side, extracts the text layout, runs a differences comparison, and displays the additions, deletions, and modified sentences in a clean visual layout.' },
      { q: 'Are my PDF documents kept secure and private?', a: 'Yes. Unlike typical online PDF tools, What Changed? performs all processing within your browser. Your files never leave your computer, eliminating security leaks and data sharing entirely.' },
      { q: 'Can I compare scanned PDFs?', a: 'If your PDF is scanned or lacks extractable text, our tool will notify you. We offer built-in, local browser-based OCR to visually render pages and extract text for comparison.' }
    ]
  },
  'compare-two-pdfs': {
    slug: 'compare-two-pdfs',
    title: 'Compare Two PDF Documents — Side-by-Side Text Diff | What Changed?',
    metaDescription: 'Find what changed between two versions of a PDF document. High-speed, local browser-based visual differences checker. Free, private, and no signup.',
    h1: 'Compare Two PDFs',
    intro: 'Quickly align two versions of a PDF document to find deleted clauses, corrected sentences, and numeric adjustments. No subscription, no payment, and no email registration required.',
    toolHeading: 'Upload Two PDFs to Compare',
    defaultFormat: 'pdf',
    howItWorks: [
      'Select or drag-and-drop the original PDF file.',
      'Select or drag-and-drop the updated PDF file.',
      'Hit the Compare button.',
      'Review the differences organized by Addition, Deletion, and Modification.'
    ],
    useCases: [
      { title: 'Comparing PDF Manuals', text: 'Verify changes between different versions of product documentation, operating manuals, or software release notes.' },
      { title: 'Legal Briefs', text: 'Inspect modified sentences or references in legal briefs or petitions prior to filing.' },
      { title: 'Content Editing', text: 'Proofread revised layout files from graphic designers to ensure no paragraphs were accidentally cut.' }
    ],
    faq: [
      { q: 'How is this tool different from Adobe Acrobat diff?', a: 'Adobe Acrobat comparison requires a paid Creative Cloud subscription and runs on desktop. What Changed? is completely free, runs instantly in any web browser, and runs 100% locally to protect your document privacy.' },
      { q: 'Is there a limit on the number of pages I can compare?', a: 'Since files are processed on your local device, the tool can handle large documents depending on your device memory. For massive PDFs (e.g., hundreds of pages), parsing might take a few seconds.' }
    ]
  },
  'pdf-difference-checker': {
    slug: 'pdf-difference-checker',
    title: 'PDF Difference Checker — Highlight Changes Online | What Changed?',
    metaDescription: 'Detect altered text, dates, numbers, and currencies in your PDFs. Private client-side comparison tool. No signup required, free forever.',
    h1: 'PDF Difference Checker',
    intro: 'Our PDF difference checker isolates every text addition, deletion, and edit. It automatically highlights changed quantities, pricing details, and date modifications, presenting them in a structured, actionable format.',
    toolHeading: 'Run PDF Diff Check',
    defaultFormat: 'pdf',
    howItWorks: [
      'Drop your base PDF in the "Old Version" slot.',
      'Drop your revised PDF in the "New Version" slot.',
      'Click Compare.',
      'Review the "Important Changes" list for modified values and numbers.'
    ],
    useCases: [
      { title: 'Auditing Bills & Invoices', text: 'Easily match vendor invoice revisions to see exactly where cost adjustments or tax modifications occurred.' },
      { title: 'Comparing Bid Proposals', text: 'Detect subtle updates in subcontractor bids, vendor quotes, or proposals to identify hidden cost hikes.' },
      { title: 'Analyzing Policy Updates', text: 'Verify changes in insurance policies, terms of service, or user agreements.' }
    ],
    faq: [
      { q: 'Can this tool highlight specific numbers that changed?', a: 'Yes! Our difference checker extracts numeric variations (such as currency values or deadlines) and displays them as structured pairs, like "₹50,000 → ₹65,000", to save you from scanning raw text.' },
      { q: 'Does this tool save a copy of my documents?', a: 'No. All parsing, processing, and diff checks happen dynamically in your web browser. No data is stored, and no files are uploaded to any server.' }
    ]
  },
  'compare-documents': {
    slug: 'compare-documents',
    title: 'Compare Documents Online — PDF, DOCX, and TXT | What Changed?',
    metaDescription: 'Compare Word documents, PDFs, and text files side-by-side. Free online difference tool with no signup. Completely private.',
    h1: 'Compare Documents Online',
    intro: 'A multi-format document comparison tool designed to show you exactly what changed. Whether you are dealing with Word files, PDFs, or raw plain text, get a visual side-by-side diff in seconds.',
    toolHeading: 'Select Documents to Compare',
    defaultFormat: 'pdf',
    howItWorks: [
      'Choose your files (PDF, DOCX, or TXT formats).',
      'Assign the original version to the left slot and the new version to the right slot.',
      'Perform the comparison.',
      'Easily navigate findings categorized under added, removed, or changed blocks.'
    ],
    useCases: [
      { title: 'Multi-Format Audits', text: 'Compare an original plain text draft (.txt) against a final PDF report (.pdf) to ensure the wording matches.' },
      { title: 'Academic Grading', text: 'Help teachers compare draft documents to final essays to see exactly how students integrated feedback.' },
      { title: 'General Text Auditing', text: 'Inspect any two blocks of text to locate edits, corrections, typo fixes, or paragraph restructuring.' }
    ],
    faq: [
      { q: 'Which file formats are supported?', a: 'We currently support PDF (.pdf), Microsoft Word (.docx), and plain text (.txt) files. You can also mix-and-match if you need to compare raw text content across formats.' },
      { q: 'Is my document text analyzed by AI models?', a: 'No. The core comparison engine is completely deterministic and operates in your local browser sandbox. We do not use your documents to train AI models, ensuring absolute corporate privacy.' }
    ]
  },
  'compare-word-documents': {
    slug: 'compare-word-documents',
    title: 'Compare Word Documents (DOCX) Online Free | What Changed?',
    metaDescription: 'Find differences between two DOCX files. Side-by-side Microsoft Word document comparison tool. Free, private, and client-side.',
    h1: 'Compare Word Documents',
    intro: 'Forget Microsoft Word Track Changes. If you have two separate .docx files and need to know the differences instantly, upload them here. We extract the raw structure and present a visual comparison of modifications.',
    toolHeading: 'Compare Word (DOCX) Files',
    defaultFormat: 'docx',
    howItWorks: [
      'Select the original Word (.docx) document.',
      'Select the updated Word (.docx) document.',
      'Run the comparison.',
      'See additions and removals cleanly highlighted without MS Word track-change clutter.'
    ],
    useCases: [
      { title: 'Contract Negotiations', text: 'Compare contract revisions received via email when tracking changes was disabled or forgotten.' },
      { title: 'Creative Writing', text: 'Evaluate progress between different chapters of books, scripts, or articles to review edits.' },
      { title: 'PR & Press Releases', text: 'Verify changes made by stakeholders on official press releases or statements prior to distribution.' }
    ],
    faq: [
      { q: 'Do I need Microsoft Office installed to use this tool?', a: 'No. This utility processes DOCX files entirely inside your web browser. It does not require MS Word, Microsoft Office 365, or any desktop software.' },
      { q: 'How does it handle formatting like bold, italics, or tables?', a: 'We extract the underlying text flow and paragraphs to perform a text-based diff. While styled tables are parsed as structured lines, the tool focuses on showing content and wording changes.' }
    ]
  },
  'compare-text-files': {
    slug: 'compare-text-files',
    title: 'Compare Text Files (TXT) Online — Instant Diff | What Changed?',
    metaDescription: 'Compare two text files (.txt) online and instantly spot differences. Fast, free, line-by-line diff checker. Secure local execution.',
    h1: 'Compare Text Files',
    intro: 'A fast, lightweight plain text comparison utility. Drag and drop two .txt files to perform an instant line-by-line and word-by-word diff. 100% private, browser-based, and zero server logging.',
    toolHeading: 'Compare Plain Text (TXT) Files',
    defaultFormat: 'txt',
    howItWorks: [
      'Load the old TXT file.',
      'Load the new TXT file.',
      'Compare.',
      'Examine matched line insertions, deletions, and precise word-level changes.'
    ],
    useCases: [
      { title: 'Code & Script Comparison', text: 'Quickly compare config files, CSV rows, SQL script exports, or HTML snippets to find discrepancies.' },
      { title: 'Log File Auditing', text: 'Compare short log snippets to locate error codes or configuration differences.' },
      { title: 'Notes Comparison', text: 'Identify updates or additions between two versions of text notes, todo lists, or copy drafts.' }
    ],
    faq: [
      { q: 'How fast is the text comparison?', a: 'It is practically instantaneous. Since TXT files require no complex rendering layers, text extraction and diffing are completed in a few milliseconds.' },
      { q: 'Can I copy-paste text instead of uploading files?', a: 'For the MVP, you can create a simple TXT file with your text, or drop the files directly. The homepage uploader handles file streams directly.' }
    ]
  },
  'compare-contracts': {
    slug: 'compare-contracts',
    title: 'Compare Two Contracts (PDF/Word) — Spot Edits | What Changed?',
    metaDescription: 'Find changes in contracts, agreements, and legal clauses. Detect modified prices, deadlines, and terms. 100% private.',
    h1: 'Compare Contract Agreements',
    intro: 'Contract revisions can hide critical changes in liability, deadlines, and monetary terms. Our specialized agreement comparator isolates modifications in contracts, highlighting changed values, dates, and clauses.',
    toolHeading: 'Compare Contracts',
    defaultFormat: 'pdf',
    howItWorks: [
      'Upload the draft or original agreement.',
      'Upload the revised contract version.',
      'Run comparison.',
      'Identify changed percentages, payment timelines, and liability clauses instantly.'
    ],
    useCases: [
      { title: 'Vendor Agreements', text: 'Audit service level agreements (SLAs) or vendor contracts to ensure clauses match verbal negotiations.' },
      { title: 'Real Estate Leases', text: 'Double-check lease renewals to verify that rents, deposit fees, or terms have not been altered.' },
      { title: 'Employment Offers', text: 'Ensure benefits, starting salary figures, and vacation policies align with original offer letters.' }
    ],
    faq: [
      { q: 'Can this tool detect changes in payment deadlines or lease prices?', a: 'Yes! The tool automatically isolates numeric changes and maps them to a summary section showing adjustments (e.g. "30 days → 15 days" or "₹1,500 → ₹1,750").' },
      { q: 'Is it safe to upload confidential legal contracts?', a: 'Your contracts are never uploaded. All calculations and text extraction occur locally within your browser sandbox, keeping your trade secrets and confidential terms 100% private.' }
    ]
  },
  'compare-invoices': {
    slug: 'compare-invoices',
    title: 'Compare Invoices — Spot Pricing & Tax Differences | What Changed?',
    metaDescription: 'Compare purchase orders and invoices to detect differences. Locate changes in prices, line items, and quantities instantly. Free and private.',
    h1: 'Compare Invoices and Bills',
    intro: 'Ensure billing accuracy by comparing an original quote, purchase order, or prior month invoice with your new bill. Instantly detect adjusted unit rates, additional fees, or altered discount values.',
    toolHeading: 'Compare Invoices & Quotes',
    defaultFormat: 'pdf',
    howItWorks: [
      'Load the original invoice or quote.',
      'Load the new bill or updated invoice.',
      'Compare.',
      'Examine "Important Changes" for any price adjustments, tax increases, or date changes.'
    ],
    useCases: [
      { title: 'Procurement Audits', text: 'Compare vendor billing statements against initial quotes to prevent overpayments or billing errors.' },
      { title: 'Utility Bill Tracking', text: 'Compare electricity, water, or cloud hosting invoices month-over-month to spot altered rate items.' },
      { title: 'Expense Reports', text: 'Verify employee expense receipts against booking confirmations to avoid reimbursement fraud.' }
    ],
    faq: [
      { q: 'How does it handle PDF invoices with tables?', a: 'Invoice tables are parsed row-by-row. Wording changes, extra fees, or numeric adjustments inside cells are extracted and highlighted.' },
      { q: 'Do you store billing information?', a: 'No. We do not store, log, or track invoice details. The files are processed on your computer and vanish as soon as you close the tab.' }
    ]
  },
  'compare-resumes': {
    slug: 'compare-resumes',
    title: 'Compare Resumes — Track CV Revisions | What Changed?',
    metaDescription: 'Find what changed between two versions of a resume or CV. Compare achievements, job descriptions, and skills. Free & private.',
    h1: 'Compare Resumes & CVs',
    intro: 'Reviewing job candidates or updating your own resume? Upload two versions of a CV to see exactly what achievements were added, which roles were removed, or how job descriptions were rephrased.',
    toolHeading: 'Compare Resumes',
    defaultFormat: 'pdf',
    howItWorks: [
      'Select the initial CV version.',
      'Select the updated resume version.',
      'Click Compare.',
      'Review changes in experience descriptions, skill keywords, and dates.'
    ],
    useCases: [
      { title: 'Candidate Screening', text: 'Verify changes a job candidate made to their resume after being requested to provide more detail.' },
      { title: 'Career Advising', text: 'Help job applicants track CV refinements and edits suggested during coaching sessions.' },
      { title: 'Personal Updates', text: 'Track version histories of your own CV drafts to avoid losing key metrics or phrasing.' }
    ],
    faq: [
      { q: 'Can I compare a PDF resume with a Word resume?', a: 'Yes. Our tool is format-agnostic, allowing you to load a PDF CV on one side and a Word (.docx) CV on the other, comparing the text streams seamlessly.' },
      { q: 'Is candidate data protected?', a: 'Completely. In compliance with strict hiring privacy rules, no candidate resumes or metadata are transmitted to any server.' }
    ]
  },
  'compare-policies': {
    slug: 'compare-policies',
    title: 'Compare Insurance Policies & Terms — Spot Edits | What Changed?',
    metaDescription: 'Track updates in policy agreements, terms of service, and privacy policies. Free online policy diff checker. Private and local.',
    h1: 'Compare Insurance Policies & Terms',
    intro: 'Policy documents, terms of service, and privacy agreements are notoriously long. Our document comparator extracts policy clauses and flags added exemptions, modified premiums, and altered coverage limits.',
    toolHeading: 'Compare Policy Documents',
    defaultFormat: 'pdf',
    howItWorks: [
      'Load the old terms of service or insurance policy.',
      'Load the revised terms or policy document.',
      'Perform comparison.',
      'Quickly scan modified coverage values, premiums, and exclusion lists.'
    ],
    useCases: [
      { title: 'Insurance Policies', text: 'Spot increases in deductibles, changes to coverage limits, or new exclusions when renewing policies.' },
      { title: 'Terms of Service Updates', text: 'Compare website term updates to check for new data collection permissions or binding arbitration clauses.' },
      { title: 'Compliance Policies', text: 'Verify updates in corporate compliance policies, HR manuals, or code of conduct drafts.' }
    ],
    faq: [
      { q: 'Why shouldn\'t I use online converters for policies?', a: 'Policy documents often contain highly personal demographic or corporate compliance details. Free online tools that process files on their servers pose data leaks. Our 100% browser-based diff runs safely locally.' },
      { q: 'How does it highlight deleted clauses?', a: 'Deleted sections or lines are listed under the "Removed" filter and marked in red, showing you the exact words that were subtracted from the old version.' }
    ]
  },
  'compare-reports': {
    slug: 'compare-reports',
    title: 'Compare PDF Reports & Analytics — Find Changes | What Changed?',
    metaDescription: 'Align quarterly reports, research papers, and audits side-by-side. Spot altered metrics, revised dates, and modified text. Free and private.',
    h1: 'Compare PDF Reports & Audits',
    intro: 'Compare monthly metrics, research papers, or quarterly business audits. Detect changes in data tables, summary paragraphs, and financial totals between revisions.',
    toolHeading: 'Compare Reports',
    defaultFormat: 'pdf',
    howItWorks: [
      'Upload the initial report draft.',
      'Upload the revised report draft.',
      'Click Compare.',
      'Filter findings to analyze key content adjustments and numeric trends.'
    ],
    useCases: [
      { title: 'Quarterly Audits', text: 'Compare preliminary financial reports with audited reports to isolate changes made by accountants.' },
      { title: 'Research Manuscripts', text: 'Compare thesis drafts to ensure professor edits were properly implemented.' },
      { title: 'Consulting Slides/Reports', text: 'Audit deliverables for client reviews to guarantee the latest statistics are updated.' }
    ],
    faq: [
      { q: 'How are report headings mapped?', a: 'The engine parses titles and structured headers to map changes under specific sections, e.g., "Executive Summary" or "Financial Highlights".' },
      { q: 'Can I print or save the differences?', a: 'Yes! The comparison results are displayed in a clean format that you can print or copy-paste directly into your own report summary documents.' }
    ]
  }
};
export const allSlugs = Object.keys(seoPagesData);
