import Groq from 'groq-sdk';

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

// Model configuration
const GROQ_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';

// Rate limiting: Similar to Gemini, add delay between requests
const RATE_LIMIT_DELAY = 2000; // 2 seconds (Groq has higher rate limits)
let lastRequestTime = 0;

/**
 * Wait for rate limit delay if needed
 */
async function waitForRateLimit(): Promise<void> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
    const waitTime = RATE_LIMIT_DELAY - timeSinceLastRequest;
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }

  lastRequestTime = Date.now();
}

/**
 * Generate chat completion using Groq
 */
export async function generateGroqCompletion(
  prompt: string,
  options?: {
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
  }
): Promise<string> {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not configured');
  }

  await waitForRateLimit();

  try {
    const messages: Array<{role: 'system' | 'user' | 'assistant', content: string}> = [];

    if (options?.systemPrompt) {
      messages.push({
        role: 'system',
        content: options.systemPrompt,
      });
    }

    messages.push({
      role: 'user',
      content: prompt,
    });

    const completion = await groq.chat.completions.create({
      messages,
      model: GROQ_MODEL,
      temperature: options?.temperature ?? 0.7,
      max_completion_tokens: options?.maxTokens ?? 2048,
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No response from Groq');
    }

    return content;
  } catch (error) {
    if (error instanceof Groq.APIError) {
      throw new Error(`Groq API error: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Generate chat completion with multimodal support (images)
 * Note: Groq's llama-4-scout model may not support images directly.
 * This is a placeholder for text-only generation with image descriptions.
 */
export async function generateGroqCompletionWithContext(
  prompt: string,
  imageDescriptions?: string[],
  options?: {
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
  }
): Promise<string> {
  let enhancedPrompt = prompt;

  // If image descriptions are provided, include them in the prompt
  if (imageDescriptions && imageDescriptions.length > 0) {
    const imagesContext = imageDescriptions
      .map((desc, idx) => `Image ${idx + 1}: ${desc}`)
      .join('\n');
    enhancedPrompt = `${prompt}\n\nContext from images:\n${imagesContext}`;
  }

  return generateGroqCompletion(enhancedPrompt, options);
}

/**
 * Parse JSON response from Groq
 * Handles both JSON code blocks and raw JSON
 */
export function parseGroqJsonResponse<T>(text: string): T {
  // Try to extract JSON from markdown code blocks
  const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/) || text.match(/\[[\s\S]*\]/);

  if (jsonMatch) {
    const jsonText = jsonMatch[1] || jsonMatch[0];
    return JSON.parse(jsonText);
  }

  throw new Error('Failed to parse JSON from Groq response');
}

/**
 * Check if Groq client is configured
 */
export function isGroqConfigured(): boolean {
  return Boolean(process.env.GROQ_API_KEY);
}
