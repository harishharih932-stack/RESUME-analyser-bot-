/**
 * TalentRank AI - DOCX and TXT Parsers
 */

import mammoth from 'mammoth';

/**
 * Parse DOCX file using mammoth
 */
export async function parseDocxFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value.trim();
}

/**
 * Parse plain text or markdown file
 */
export async function parseTxtFile(file: File): Promise<string> {
  return (await file.text()).trim();
}
