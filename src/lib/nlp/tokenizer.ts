/**
 * TalentRank AI - NLP Tokenizer & Preprocessing
 * Provides text cleaning, tokenization, stopword removal, and rule-based stemming.
 */

// Standard English stopwords list
export const ENGLISH_STOPWORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t',
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', 'can\'t', 'cannot', 'could', 'couldn\'t', 'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing',
  'don\'t', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'hadn\'t', 'has', 'hasn\'t',
  'have', 'haven\'t', 'having', 'he', 'he\'d', 'he\'ll', 'he\'s', 'her', 'here', 'here\'s', 'hers',
  'herself', 'him', 'himself', 'his', 'how', 'how\'s', 'i', 'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if', 'in',
  'into', 'is', 'isn\'t', 'it', 'it\'s', 'its', 'itself', 'let\'s', 'me', 'more', 'most', 'mustn\'t',
  'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our',
  'ours', 'ourselves', 'out', 'over', 'own', 'same', 'shan\'t', 'she', 'she\'d', 'she\'ll', 'she\'s',
  'should', 'shouldn\'t', 'so', 'some', 'such', 'than', 'that', 'that\'s', 'the', 'their', 'theirs',
  'them', 'themselves', 'then', 'there', 'there\'s', 'these', 'they', 'they\'d', 'they\'ll', 'they\'re',
  'they\'ve', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasn\'t',
  'we', 'we\'d', 'we\'ll', 'we\'re', 'we\'ve', 'were', 'weren\'t', 'what', 'what\'s', 'when', 'when\'s',
  'where', 'where\'s', 'which', 'while', 'who', 'who\'s', 'whom', 'why', 'why\'s', 'with', 'won\'t',
  'would', 'wouldn\'t', 'you', 'you\'d', 'you\'ll', 'you\'re', 'you\'ve', 'your', 'yours', 'yourself',
  'yourselves', 'etc', 'also', 'eg', 'ie', 'per', 'via'
]);

/**
 * Clean raw text by lowercasing, standardizing whitespace, and trimming
 */
export function cleanText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^\w\s\+\#\.\-]/g, ' ') // Keep +, # (C++, C#) and dots/hyphens for tech terms
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Lightweight rule-based stemmer (suffix-stripping heuristic based on Porter Stemmer subset)
 */
export function simpleStem(word: string): string {
  if (word.length <= 3) return word;

  let w = word.toLowerCase();

  // Step 1: Plurals and past tense
  if (w.endsWith('sses')) w = w.slice(0, -2);
  else if (w.endsWith('ies') && w.length > 4) w = w.slice(0, -3) + 'i';
  else if (w.endsWith('ss')) { /* keep */ }
  else if (w.endsWith('s') && !w.endsWith('us') && !w.endsWith('is')) w = w.slice(0, -1);

  if (w.endsWith('eed') && w.length > 4) w = w.slice(0, -1);
  else if ((w.endsWith('ed') || w.endsWith('ing')) && w.length > 5) {
    if (w.endsWith('ing')) w = w.slice(0, -3);
    else w = w.slice(0, -2);

    // clean double consonant
    if (/(bb|dd|ff|gg|mm|nn|pp|rr|tt)$/.test(w)) {
      w = w.slice(0, -1);
    }
  }

  // Common suffixes
  if (w.endsWith('ational')) w = w.slice(0, -7) + 'ate';
  else if (w.endsWith('tional')) w = w.slice(0, -6) + 'tion';
  else if (w.endsWith('izer')) w = w.slice(0, -4) + 'ize';
  else if (w.endsWith('ator')) w = w.slice(0, -4) + 'ate';
  else if (w.endsWith('al') && w.length > 4) w = w.slice(0, -2);
  else if (w.endsWith('ful') && w.length > 5) w = w.slice(0, -3);
  else if (w.endsWith('ness') && w.length > 6) w = w.slice(0, -4);
  else if (w.endsWith('ment') && w.length > 6) w = w.slice(0, -4);
  else if (w.endsWith('able') && w.length > 6) w = w.slice(0, -4);

  return w;
}

/**
 * Tokenize string into tokens, filter stopwords, and stem
 */
export function tokenizeAndStem(text: string, stem: boolean = true): string[] {
  const cleaned = cleanText(text);
  if (!cleaned) return [];

  // Match words, handles c++, c#, .net, node.js
  const rawTokens = cleaned.match(/[a-z0-9\+#\.\-]+/g) || [];

  const tokens: string[] = [];
  for (const token of rawTokens) {
    const stripped = token.replace(/^\.+|\.+$/g, ''); // strip leading/trailing dots
    if (!stripped || stripped.length < 2) continue;
    if (ENGLISH_STOPWORDS.has(stripped)) continue;

    tokens.push(stem ? simpleStem(stripped) : stripped);
  }

  return tokens;
}

/**
 * Generate bigrams from tokens
 */
export function generateBigrams(tokens: string[]): string[] {
  const bigrams: string[] = [];
  for (let i = 0; i < tokens.length - 1; i++) {
    bigrams.push(`${tokens[i]}_${tokens[i + 1]}`);
  }
  return bigrams;
}
