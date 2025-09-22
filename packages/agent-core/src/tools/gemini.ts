import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  // Do not throw to allow offline dev; callers should handle missing key.
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function callJSON<T extends z.ZodTypeAny>(
  schema: T,
  systemPrompt: string,
  userPrompt: string,
  parts: Array<{ text?: string }>
): Promise<z.infer<T>> {
  if (!genAI) throw new Error('GEMINI_API_KEY not set');
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro', systemInstruction: systemPrompt });
  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: userPrompt }, ...parts ]}],
    generationConfig: { responseMimeType: 'application/json' }
  });
  const text = result.response.text();
  const parsed = schema.safeParse(JSON.parse(text));
  if (!parsed.success) throw new Error('Schema validation failed: ' + parsed.error.message);
  return parsed.data;
}


