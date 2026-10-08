/**
 * TalentRank AI - TF-IDF Vectorizer & Cosine Similarity
 * Mathematical implementation of Term Frequency - Inverse Document Frequency.
 * Used to compute lexical and contextual similarity between resume and Job Description.
 */

import { tokenizeAndStem } from './tokenizer';

export interface TFIDFVector {
  [term: string]: number;
}

export class TFIDFModel {
  private idfMap: Map<string, number> = new Map();
  private vocabulary: Set<string> = new Set();
  private totalDocs: number = 0;

  /**
   * Fit the model with a corpus of documents (e.g. JD + all candidate resumes)
   */
  public fit(documents: string[]): void {
    this.totalDocs = documents.length;
    this.vocabulary.clear();
    this.idfMap.clear();

    const docFreq: Map<string, number> = new Map();

    // Calculate document frequencies (df)
    for (const doc of documents) {
      const tokens = tokenizeAndStem(doc);
      const uniqueTokensInDoc = new Set(tokens);

      for (const token of uniqueTokensInDoc) {
        this.vocabulary.add(token);
        docFreq.set(token, (docFreq.get(token) || 0) + 1);
      }
    }

    // Compute Smooth Inverse Document Frequency:
    // IDF(t) = log((N + 1) / (DF(t) + 1)) + 1
    for (const [term, df] of docFreq.entries()) {
      const idf = Math.log((this.totalDocs + 1) / (df + 1)) + 1.0;
      this.idfMap.set(term, idf);
    }
  }

  /**
   * Transform document into TF-IDF vector with L2 normalization
   */
  public transform(document: string): TFIDFVector {
    const tokens = tokenizeAndStem(document);
    const termFreq: Map<string, number> = new Map();

    for (const token of tokens) {
      termFreq.set(token, (termFreq.get(token) || 0) + 1);
    }

    const vector: TFIDFVector = {};
    let sumSquared = 0;

    for (const [term, count] of termFreq.entries()) {
      const tf = Math.log(count + 1); // Log-augmented term frequency
      const idf = this.idfMap.get(term) || Math.log(this.totalDocs + 1) + 1.0;
      const weight = tf * idf;
      vector[term] = weight;
      sumSquared += weight * weight;
    }

    // L2 Normalization (Euclidean norm)
    const norm = Math.sqrt(sumSquared) || 1.0;
    for (const term in vector) {
      vector[term] = vector[term] / norm;
    }

    return vector;
  }

  /**
   * Compute Cosine Similarity between two L2-normalized TF-IDF vectors
   * Cosine Similarity = A . B / (||A|| * ||B||)
   * Since vectors are L2-normalized, Cosine Similarity is simply the dot product!
   */
  public static cosineSimilarity(vecA: TFIDFVector, vecB: TFIDFVector): number {
    let dotProduct = 0;
    for (const term in vecA) {
      if (vecB[term] !== undefined) {
        dotProduct += vecA[term] * vecB[term];
      }
    }
    // Bound score strictly between 0 and 1
    return Math.max(0, Math.min(1, dotProduct));
  }
}
