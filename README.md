# What Changed?

**What Changed?** is a production-ready, free, privacy-first internet utility for comparing documents and instantly understanding differences. 

Website URL Intent: compare two versions of a document, get the answer, and leave. 

No payment system. No subscription. No account requirement. No forced signup. No paywall. 100% private.

---

## 1. Core Architecture

The product is built to perform all core parsing and comparison computations **directly in the user's web browser**:
- **Text Extraction**: Uses `pdfjs-dist` to parse Text PDFs page-by-page, and `mammoth` to parse DOCX files.
- **Local Browser OCR**: Integrates `tesseract.js` using local WebAssembly workers. If a PDF has no selectable text, the app automatically prompts the user to run on-device OCR.
- **Deterministic Diff Engine**: Computes line-by-line alignments using LCS and matches modified sentences using Jaccard Similarity coefficients.
- **Numeric Variation Extractor**: Word-level diff blocks are scanned to isolate shifted numbers, currencies, dates, and deadlines (e.g., `₹50,000 → ₹65,000` or `30 days → 15 days`), displaying them as high-priority highlights.
- **Zero Server Footprint**: No documents, texts, or personal info are ever transmitted to a server. 

---

## 2. Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Dependencies**: `diff` (for token and array LCS diffing), `pdfjs-dist` (PDF parser), `mammoth` (Word parser), `tesseract.js` (Optical Character Recognition)

---

## 3. Getting Started & Development

### Installation

Install the required node modules:
```bash
npm install
```

### Local Dev Server

Start the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 4. Production Build

To build the application for production:
```bash
npm run build
```

This compiles static routing types and performs static site generation (SSG) for all 11 programmatic landing pages and the 13 blog guides.

To run the built production code locally:
```bash
npm run start
```

---

## 5. Deployment

The application is fully optimized for zero-configuration deployment on **Vercel** or other static/serverless hosting platforms:

### Vercel Deployment
1. Connect your GitHub repository to Vercel.
2. Select the repository and ensure framework settings are set to **Next.js**.
3. Click **Deploy**. Vercel will build and serve the application as static HTML and serverless routes.

---

## 6. SEO Verification Instructions

To ensure search indexing ranks our pages organically, check the following:
1. **XML Sitemap**: Verify that `https://whatchanged.com/sitemap.xml` serves a valid sitemap containing the home page, the 11 programmatic pages (e.g., `/compare-pdf`), and the 13 blog posts.
2. **Robots.txt**: Verify that `https://whatchanged.com/robots.txt` is accessible and disallows Next internal directories (`/_next/`) and query parameters to avoid duplicate content flags.
3. **Structured Data (JSON-LD)**: 
   - Inspect the source code of dynamic landing pages to check for `FAQPage` schema.
   - Verify that pages contain `SoftwareApplication` schema.
4. **Header Hierarchies**: Ensure there is only one `<h1>` tag per landing page (the page title) and that subheaders use `<h2>` and `<h3>` tags sequentially.
5. **Canonicalization**: Verify that `<link rel="canonical" href="..." />` tags are loaded dynamically and match the page URL to avoid crawler dilution.
