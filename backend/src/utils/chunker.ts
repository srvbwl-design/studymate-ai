/**
 * Splits text into overlapping chunks of roughly maxChunkSize characters.
 */
export function chunkText(text: string, maxChunkSize = 2000, overlap = 200): string[] {
  if (!text || text.length <= maxChunkSize) {
    return [text || ''];
  }

  const chunks: string[] = [];
  let startIndex = 0;

  while (startIndex < text.length) {
    let endIndex = startIndex + maxChunkSize;
    if (endIndex < text.length) {
      // Try to break at a paragraph or sentence boundary
      const lastParagraph = text.lastIndexOf('\n\n', endIndex);
      if (lastParagraph > startIndex + maxChunkSize * 0.5) {
        endIndex = lastParagraph;
      } else {
        const lastPeriod = text.lastIndexOf('. ', endIndex);
        if (lastPeriod > startIndex + maxChunkSize * 0.5) {
          endIndex = lastPeriod + 1;
        }
      }
    } else {
      endIndex = text.length;
    }

    chunks.push(text.slice(startIndex, endIndex).trim());
    startIndex = Math.max(endIndex - overlap, startIndex + 1);
    if (startIndex >= text.length) break;
  }

  return chunks;
}

/**
 * Basic keyword-based context retriever that finds the top N relevant chunks for a question.
 */
export function retrieveRelevantContext(text: string, query: string, maxChunks = 4): string {
  if (!text) return '';
  if (text.length <= 4000) return text;

  const chunks = chunkText(text, 1500, 200);
  if (chunks.length <= maxChunks) return chunks.join('\n\n---\n\n');

  // Tokenize query words (ignoring short stopwords)
  const stopWords = new Set(['the', 'and', 'for', 'are', 'with', 'from', 'this', 'that', 'what', 'how', 'why', 'can', 'you', 'explain']);
  const queryTerms = query
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stopWords.has(word));

  if (queryTerms.length === 0) {
    // Return first chunks as overview
    return chunks.slice(0, maxChunks).join('\n\n---\n\n');
  }

  // Score each chunk
  const scoredChunks = chunks.map((chunk, index) => {
    const lower = chunk.toLowerCase();
    let score = 0;
    for (const term of queryTerms) {
      const matches = (lower.match(new RegExp(`\\b${term}`, 'g')) || []).length;
      score += matches * 2;
    }
    // slight bias for beginning of document
    if (index === 0) score += 1;
    return { chunk, score, index };
  });

  scoredChunks.sort((a, b) => b.score - a.score);

  // Take top chunks and sort by document appearance order
  const topChunks = scoredChunks
    .slice(0, maxChunks)
    .sort((a, b) => a.index - b.index)
    .map((c) => c.chunk);

  return topChunks.join('\n\n---\n\n');
}
