/**
 * Venice AI Tools for SOLPILOT
 * 
 * Provides real-time web search capabilities for Solana research
 * Uses Venice AI API with web search enabled
 */

import { createTool } from '@mastra/core';
import { z } from 'zod';

const VENICE_API_KEY = process.env.VENICE_API;
const VENICE_BASE_URL = 'https://api.venice.ai/api/v1';

/**
 * Search for latest Solana news and updates
 * Uses Venice AI with web search enabled to find real-time information
 */
export const searchSolanaNews = createTool({
  id: 'venice-search-news',
  description: 'Search for latest Solana news, updates, and developments from trusted crypto sources using web search',
  inputSchema: z.object({
    query: z.string().describe('Search query (e.g., "latest Solana news", "Solana DeFi updates", "Solana partnerships")'),
    focusArea: z.enum(['news', 'defi', 'nft', 'governance', 'partnerships', 'technical']).optional().describe('Specific area to focus search on'),
  }),
  execute: async ({ context }) => {
    try {
      const { query, focusArea } = context;

      if (!VENICE_API_KEY) {
        return {
          success: false,
          error: 'VENICE_API key is not configured',
          message: 'Venice API key is missing. Please add VENICE_API to environment variables.',
        };
      }

      // Build system prompt based on focus area
      const focusContext = focusArea ? `Focus specifically on ${focusArea}-related updates.` : '';
      
      const systemPrompt = `
You are Venice, a highly intelligent crypto research assistant focused on real-time updates for the Solana Blockchain (SOL).

Your mission:
- Search ONLY trusted sources in real-time:
  - https://cointelegraph.com/tags/solana
  - https://coindesk.com/tag/Solana
  - https://medium.com/solana-labs
  - https://www.solanalabs.com/blog
  - https://decrypt.co
  - https://theblock.co
  - https://crypto.news/?s=solana
  - https://solana.com/news

${focusContext}

Instructions:
- Provide the latest Solana-related updates in **bullet-point format**
- For **each update**, include:
  - A short, clear summary of the news
  - The **original source URL** (no redirects or summaries)
  - Date of publication (if available)
- Focus on:
  - Product upgrades or releases
  - Official announcements
  - 🤝 Ecosystem partnerships or collaborations
  - Market trends, integrations, or listing events
  - Governance proposals and voting
  - NFT launches and collections
- Be highly factual. Never invent news.
- If **no new updates** are found, say: "No recent updates found in the last 72 hours from official sources."

You are trusted for your accuracy, timeliness, and transparency.
`.trim();

      const response = await fetch(`${VENICE_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${VENICE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b',
          messages: [
            {
              role: 'system',
              content: systemPrompt,
            },
            {
              role: 'user',
              content: query,
            },
          ],
          venice_parameters: {
            include_venice_system_prompt: false,
            enable_web_search: 'on',
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Venice API error: ${response.status}`);
      }

      const data = await response.json();
      const searchResults = data.choices[0]?.message?.content || 'No results found';

      return {
        success: true,
        data: {
          query,
          results: searchResults,
          timestamp: new Date().toISOString(),
          source: 'Venice AI with Web Search',
        },
        message: 'Successfully fetched latest Solana updates',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to search for Solana news',
      };
    }
  },
});

/**
 * Research specific Solana topics with deep analysis
 */
export const researchSolanaTopic = createTool({
  id: 'venice-research-topic',
  description: 'Deep research on specific Solana topics like protocols, projects, or technical features',
  inputSchema: z.object({
    topic: z.string().describe('Topic to research (e.g., "Jupiter DEX", "Solana validator economics", "Metaplex NFT standard")'),
    depth: z.enum(['summary', 'detailed', 'comprehensive']).optional().default('detailed').describe('How detailed the research should be'),
  }),
  execute: async ({ context }) => {
    try {
      const { topic, depth } = context;

      if (!VENICE_API_KEY) {
        return {
          success: false,
          error: 'VENICE_API key is not configured',
          message: 'Venice API key is missing. Please add VENICE_API to environment variables.',
        };
      }

      const depthInstructions = {
        summary: 'Provide a concise 3-5 sentence summary with key facts.',
        detailed: 'Provide detailed explanation with background, current status, and implications.',
        comprehensive: 'Provide comprehensive analysis including history, technical details, ecosystem impact, and future outlook.',
      };

      const systemPrompt = `
You are Venice, an expert Solana blockchain researcher.

Research the following topic: "${topic}"

Level of detail: ${depthInstructions[depth]}

Guidelines:
- Search trusted sources for accurate, up-to-date information
- Explain technical concepts in accessible language
- Include relevant metrics, statistics, or data points
- Cite sources where possible
- Distinguish facts from speculation
- Highlight practical implications for users

Structure your response with clear sections:
1. **Overview**: What it is and why it matters
2. **Key Details**: Important facts, features, or developments
3. **Ecosystem Impact**: How it affects Solana and users
4. **Current Status**: Latest updates or developments
5. **Resources**: Links to official docs, websites, or announcements

Be thorough, accurate, and insightful.
`.trim();

      const response = await fetch(`${VENICE_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${VENICE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b',
          messages: [
            {
              role: 'system',
              content: systemPrompt,
            },
            {
              role: 'user',
              content: `Research topic: ${topic}`,
            },
          ],
          venice_parameters: {
            include_venice_system_prompt: false,
            enable_web_search: 'on',
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Venice API error: ${response.status}`);
      }

      const data = await response.json();
      const research = data.choices[0]?.message?.content || 'No research results found';

      return {
        success: true,
        data: {
          topic,
          depth,
          research,
          timestamp: new Date().toISOString(),
          source: 'Venice AI with Web Search',
        },
        message: `Successfully researched: ${topic}`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to research topic',
      };
    }
  },
});

// Export all Venice tools
export const veniceTools = [searchSolanaNews, researchSolanaTopic];

// Export as record object for Mastra Agent configuration
export const createVeniceTools = () => ({
  searchNews: searchSolanaNews,
  researchTopic: researchSolanaTopic,
});
