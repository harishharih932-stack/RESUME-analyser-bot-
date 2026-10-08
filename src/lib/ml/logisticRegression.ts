/**
 * TalentRank AI - In-Browser Logistic Regression
 * Learns feature importance from recruiter feedback (Shortlist vs. Reject).
 * Solved via mini-batch / full-batch Gradient Descent with L2 regularization.
 */

import { LogisticRegressionModelWeights } from '../../types';

export const FEATURE_NAMES = [
  'TF-IDF Lexical',
  'BM25 Score',
  'Skill Coverage',
  'Experience Fit',
  'Education Fit',
  'LLM Semantic'
];

export interface FeedbackSample {
  features: number[]; // [tfidf, bm25, skills, exp, edu, llm] normalized in [0, 1]
  label: number;     // 1 for Shortlisted, 0 for Rejected
}

export class InBrowserLogisticRegression {
  private weights: number[];
  private bias: number;
  private learningRate: number;
  private lambda: number; // L2 regularization
  private epochs: number;

  constructor(learningRate: number = 0.15, lambda: number = 0.01, epochs: number = 250) {
    // Initialized with equal sensible prior weights
    this.weights = [0.2, 0.2, 0.3, 0.2, 0.1, 0.2];
    this.bias = -0.5;
    this.learningRate = learningRate;
    this.lambda = lambda;
    this.epochs = epochs;
  }

  /**
   * Sigmoid activation function
   */
  private sigmoid(z: number): number {
    return 1 / (1 + Math.exp(-Math.max(-20, Math.min(20, z))));
  }

  /**
   * Train model on recruiter feedback data
   */
  public train(samples: FeedbackSample[]): LogisticRegressionModelWeights {
    const m = samples.length;
    const numFeatures = FEATURE_NAMES.length;

    // Reset weights with warm start around prior
    let w = [...this.weights];
    let b = this.bias;

    if (m < 2) {
      return {
        featureNames: FEATURE_NAMES,
        weights: w,
        bias: b,
        accuracy: 0,
        loss: 0,
        sampleCount: m,
        trained: false
      };
    }

    // Gradient descent optimization
    for (let epoch = 0; epoch < this.epochs; epoch++) {
      const gradW = new Array(numFeatures).fill(0);
      let gradB = 0;

      for (let i = 0; i < m; i++) {
        const x = samples[i].features;
        const y = samples[i].label;

        let z = b;
        for (let j = 0; j < numFeatures; j++) {
          z += w[j] * (x[j] ?? 0);
        }

        const yHat = this.sigmoid(z);
        const error = yHat - y;

        for (let j = 0; j < numFeatures; j++) {
          gradW[j] += error * (x[j] ?? 0);
        }
        gradB += error;
      }

      // Update weights with L2 regularization
      for (let j = 0; j < numFeatures; j++) {
        const reg = (this.lambda / m) * w[j];
        w[j] -= this.learningRate * ((gradW[j] / m) + reg);
      }
      b -= this.learningRate * (gradB / m);
    }

    this.weights = w;
    this.bias = b;

    // Compute training accuracy & log loss
    let correct = 0;
    let totalLoss = 0;

    for (let i = 0; i < m; i++) {
      const x = samples[i].features;
      const y = samples[i].label;

      let z = b;
      for (let j = 0; j < numFeatures; j++) {
        z += w[j] * (x[j] ?? 0);
      }
      const yHat = this.sigmoid(z);

      const predLabel = yHat >= 0.5 ? 1 : 0;
      if (predLabel === y) correct++;

      // Binary cross-entropy with epsilon clipping
      const eps = 1e-7;
      const clipped = Math.max(eps, Math.min(1 - eps, yHat));
      totalLoss += -(y * Math.log(clipped) + (1 - y) * Math.log(1 - clipped));
    }

    const accuracy = Math.round((correct / m) * 100);
    const loss = Math.round((totalLoss / m) * 1000) / 1000;

    return {
      featureNames: FEATURE_NAMES,
      weights: w.map((weight) => Math.round(weight * 100) / 100),
      bias: Math.round(b * 100) / 100,
      accuracy,
      loss,
      sampleCount: m,
      trained: m >= 6 // Show full statistical validity once at least 6 samples exist
    };
  }

  /**
   * Predict probability of shortlisting for a feature vector
   */
  public predict(features: number[]): number {
    let z = this.bias;
    for (let j = 0; j < this.weights.length; j++) {
      z += this.weights[j] * (features[j] ?? 0);
    }
    return Math.round(this.sigmoid(z) * 100);
  }
}
