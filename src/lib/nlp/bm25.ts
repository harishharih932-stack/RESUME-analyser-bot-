/**
 * TalentRank AI - Okapi BM25 Scoring
 * Implements probabilistic Information Retrieval scoring between query (JD) and document (Resume).
 * Highly effective for keyword matching with document length normalization.
 */

import { tokenizeAndStem } from './tokenizer';

export class BM25Model {
  private k1: number; // Term frequency saturation parameter (standard 1.5)
  private b: number;  // Document length normalization parameter (standard 0.75)
  private docLengths: number[] = [];
  private avgDocLength: number = 0;
  private docFreqs: Map<string, number> = new Map();
  private docTermFreqs: Array<Map<string, number>> = [];
  private totalDocs: number = 0;

  constructor(k1: number = 1.5, b: number = 0.75) {
    this.k1 = k1;
    this.b = b;
  }

  /**
   * Fit BM25 with the corpus of resumes
   */
  public fit(documents: string[]): void {
    this.totalDocs = documents.length;
    this.docLengths = [];
    this.docFreqs.clear();
    this.docTermFreqs = [];

    let totalLength = 0;

    for (let i = 0; i < documents.length; i++) {
      const tokens = tokenizeAndStem(documents[i]);
      const len = tokens.length;
      this.docLengths.push(len);
      totalLength += len;

      const tf = new Map<string, number>();
      const seen = new Set<string>();

      for (const token of tokens) {
        tf.set(token, (tf.get(token) || 0) + 1);
        if (!seen.has(token)) {
          seen.add(token);
          this.docFreqs.set(token, (this.docFreqs.get(token) || 0) + 1);
        }
      }

      this.docTermFreqs.push(tf);
    }

    this.avgDocLength = this.totalDocs > 0 ? totalLength / this.totalDocs : 1;
  }

  /**
   * Calculate BM25 score of a single document against a query (e.g. JD text)
   * Returns score. We also provide max-normalization across documents.
   */
  public scoreDoc(docIndex: number, queryText: string): number {
    if (docIndex >= this.totalDocs || docIndex < 0) return 0;

    const queryTokens = tokenizeAndStem(queryText);
    const docLength = this.docLengths[docIndex];
    const termFreqs = this.docTermFreqs[docIndex];

    let score = 0;

    for (const q of queryTokens) {
      if (!termFreqs.has(q)) continue;

      const tf = termFreqs.get(q) || 0;
      const df = this.docFreqs.get(q) || 0;

      // Robertson-Spärck Jones IDF variant:
      // IDF = ln((N - df + 0.5) / (df + 0.5) + 1)
      const idf = Math.log((this.totalDocs - df + 0.5) / (df + 0.5) + 1.0);

      // BM25 term weighting component
      const numerator = tf * (this.k1 + 1);
      const denominator = tf + this.k1 * (1 - this.b + this.b * (docLength / (this.avgDocLength || 1)));

      score += idf * (numerator / denominator);
    }

    return Math.max(0, score);
  }

  /**
   * Score an arbitrary document text against queryText (without prior fitting)
   */
  public static directBM25(docText: string, queryText: string): number {
    const docTokens = tokenizeAndStem(docText);
    const queryTokens = tokenizeAndStem(queryText);

    if (docTokens.length === 0 || queryTokens.length === 0) return 0;

    const docTf = new Map<string, number>();
    for (const t of docTokens) {
      docTf.set(t, (docTf.get(t) || 0) + 1);
    }

    let rawScore = 0;
    const k1 = 1.5;
    const b = 0.75;
    const avgLen = 300; // estimated standard resume length
    const len = docTokens.length;

    for (const q of queryTokens) {
      if (docTf.has(q)) {
        const tf = docTf.get(q)!;
        const num = tf * (k1 + 1);
        const den = tf + k1 * (1 - b + b * (len / avgLen));
        rawScore += (num / den);
      }
    }

    // Sigmoidal scaling into 0-100 range
    const normalized = (1 / (1 + Math.exp(-0.08 * (rawScore - 15)))) * 100;
    return Math.min(100, Math.max(0, Math.round(normalized * 10) / 10));
  }
}
