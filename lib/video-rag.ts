/**
 * Video RAG (Retrieval-Augmented Generation) Library
 * Handles video embeddings and semantic search using Ollama/Qwen
 */

import { Ollama } from '@langchain/ollama';

// Get Ollama base URL from environment variable or use localhost as fallback
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

// Initialize Ollama with Qwen model
const embeddings = new Ollama({
  model: 'qwen2.5:latest', // Using Qwen for embeddings
  baseUrl: OLLAMA_BASE_URL,
});

const llm = new Ollama({
  model: 'qwen2.5:latest',
  baseUrl: OLLAMA_BASE_URL,
  temperature: 0.7,
});

export interface VideoChunk {
  videoId: string;
  chunkIndex: number;
  text: string;
  startTime: number;
  endTime: number;
  embedding?: number[];
}

export interface VideoDocument {
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  channelTitle: string;
  transcript: Array<{
    text: string;
    offset: number;
    duration: number;
  }>;
  transcriptText: string;
  hasTranscript: boolean;
  chunks?: VideoChunk[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Split transcript into chunks for better embedding
 */
export function chunkTranscript(
  videoId: string,
  transcript: Array<{ text: string; offset: number; duration: number }>,
  chunkSize: number = 500 // characters per chunk
): VideoChunk[] {
  const chunks: VideoChunk[] = [];
  let currentChunk = '';
  let chunkStartTime = 0;
  let chunkIndex = 0;

  for (let i = 0; i < transcript.length; i++) {
    const item = transcript[i];
    
    if (currentChunk.length === 0) {
      chunkStartTime = item.offset;
    }
    
    currentChunk += item.text + ' ';
    
    // Create chunk when size is reached or at end
    if (currentChunk.length >= chunkSize || i === transcript.length - 1) {
      chunks.push({
        videoId,
        chunkIndex,
        text: currentChunk.trim(),
        startTime: chunkStartTime,
        endTime: item.offset + item.duration,
      });
      
      currentChunk = '';
      chunkIndex++;
    }
  }

  return chunks;
}

/**
 * Generate embedding for text using Ollama
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    // Use Ollama's embeddings API directly
    const response = await fetch(`${OLLAMA_BASE_URL}/api/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen2.5:latest',
        prompt: text,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Find most relevant chunks for a query
 */
export async function findRelevantChunks(
  query: string,
  chunks: VideoChunk[],
  topK: number = 3
): Promise<Array<VideoChunk & { similarity: number }>> {
  // Generate embedding for query
  const queryEmbedding = await generateEmbedding(query);

  // Calculate similarity for each chunk
  const chunksWithSimilarity = chunks
    .filter(chunk => chunk.embedding && chunk.embedding.length > 0)
    .map(chunk => ({
      ...chunk,
      similarity: cosineSimilarity(queryEmbedding, chunk.embedding!),
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);

  return chunksWithSimilarity;
}

/**
 * Generate answer using RAG
 */
export async function generateAnswer(
  question: string,
  relevantChunks: Array<VideoChunk & { similarity: number }>,
  videoTitle: string
): Promise<string> {
  const context = relevantChunks
    .map((chunk, i) => `[${i + 1}] (${formatTime(chunk.startTime)}): ${chunk.text}`)
    .join('\n\n');

  const prompt = `Bạn là trợ lý học tiếng Anh thông minh, đang giúp học sinh hiểu nội dung video "${videoTitle}".

Dựa trên các đoạn transcript sau từ video:

${context}

Câu hỏi của học sinh: ${question}

Hãy trả lời câu hỏi một cách rõ ràng, thân thiện và dễ hiểu. Nếu câu trả lời liên quan đến một phần cụ thể trong video, hãy đề cập đến thời điểm đó. Nếu thông tin không có trong transcript, hãy nói rõ điều đó.

Trả lời:`;

  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen2.5:latest',
        prompt: prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Error generating answer:', error);
    throw error;
  }
}

/**
 * Format time in seconds to MM:SS
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 1000 / 60);
  const secs = Math.floor((seconds / 1000) % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Check if Ollama is running
 */
export async function checkOllamaStatus(): Promise<boolean> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      method: 'GET',
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}
