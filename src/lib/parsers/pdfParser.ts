/**
 * TalentRank AI - PDF Parser with Annotation Link Extraction
 * Extracts text and real embedded hyperlinks from PDF files.
 */

import * as pdfjsLib from 'pdfjs-dist';

// Configure pdfjs worker to reliable CDN version
if (typeof window !== 'undefined') {
  try {
    const version = (pdfjsLib as any).version || '3.11.174';
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.js`;
  } catch (err) {
    console.warn('Could not set pdfjs workerSrc:', err);
  }
}

export interface PDFParseResult {
  text: string;
  links: string[];
}

/**
 * Parse PDF file extracting full text and all real hyperlinked URLs from page annotations
 */
export async function parsePDFFile(file: File): Promise<PDFParseResult> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    useSystemFonts: true,
  });

  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;

  let fullText = '';
  const extractedUrls: Set<string> = new Set();

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);

    // 1. Extract text content
    const textContent = await page.getTextContent();
    const pageStrings = textContent.items
      .map((item: any) => ('str' in item ? item.str : ''))
      .filter(Boolean);
    fullText += pageStrings.join(' ') + '\n';

    // 2. Extract real PDF annotations (hyperlinks)
    try {
      const annotations = await page.getAnnotations();
      for (const annot of annotations) {
        if (annot.subtype === 'Link') {
          const url = annot.url || annot.unsafeUrl;
          if (url && typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('mailto:'))) {
            extractedUrls.add(url);
          }
        }
      }
    } catch (e) {
      console.warn(`Could not read annotations for page ${pageNum}:`, e);
    }
  }

  return {
    text: fullText.trim(),
    links: Array.from(extractedUrls)
  };
}
