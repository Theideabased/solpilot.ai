import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

import OpenAI from "openai";

const OPENAI_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = process.env.OPENROUTER_BASE_URL;
const MODEL = process.env.MODEL;

const openai = new OpenAI({
  baseURL: OPENROUTER_BASE_URL,
  apiKey: OPENAI_API_KEY,
});

export const createTitleFromMessage = async (userMessage: string) => {
  try {
    const messages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: `
You are an AI assistant that generates concise and contextually relevant sentences based on the user's message. 
Your response should be short, clear, and aligned with the given input. Your goal is only summarizing the message.
Only respond the summarize as a title shortly.

Input : ${userMessage}

`,
      },
    ];
    
    // Check if model is configured
    if (!MODEL || !OPENAI_API_KEY) {
      console.log("⚠️ OpenRouter not configured, using fallback title generation");
      return generateFallbackTitle(userMessage);
    }

    // Set a timeout for the API call
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('OpenRouter API timeout')), 10000)
    );

    const completionPromise = openai.chat.completions.create({
      model: MODEL,
      messages,
    });

    const completion = await Promise.race([completionPromise, timeoutPromise]) as any;

    if (!completion.choices || completion.choices.length === 0) {
      return generateFallbackTitle(userMessage);
    }

    return completion.choices[0].message?.content || generateFallbackTitle(userMessage);
  } catch (error: any) {
    // Handle network errors (DNS, connection, timeout)
    if (error?.code === 'ENOTFOUND' || error?.code === 'EAI_AGAIN' || error?.code === 'ECONNREFUSED') {
      console.log("⚠️ OpenRouter connection failed (network issue), using fallback title generation");
    } else if (error?.status === 429) {
      console.log("⚠️ OpenRouter rate limit hit, using fallback title generation");
    } else if (error?.message?.includes('timeout')) {
      console.log("⚠️ OpenRouter API timeout, using fallback title generation");
    } else {
      console.error("❌ Error querying OpenRouter:", error?.message || error);
    }
    
    return generateFallbackTitle(userMessage);
  }
};

// Fallback function to generate titles without AI when API fails
function generateFallbackTitle(message: string): string {
  // Take first 50 characters and clean up
  const cleanMessage = message.trim().substring(0, 50);
  
  // If message is short enough, use it as is
  if (message.length <= 50) {
    return cleanMessage;
  }
  
  // Otherwise truncate and add ellipsis
  return cleanMessage + "...";
}
