"use server";
import { mastra } from '@/mastra';

/**
 * Process user message using Mastra agents
 * This replaces the old OpenRouter implementation with Mastra's multi-agent system
 */
export async function processMastraMessage(
  userMessage: string,
  chatHistory: any[],
  walletAddress: string | null,
  retryCount: number = 0
) {
  const MAX_RETRIES = 2;
  const TIMEOUT_MS = 30000; // 30 seconds
  
  try {
    // Determine which agent to use based on message content
    let agentName: 'solpilot' | 'sonia' | 'zerion' | 'venice' = 'solpilot';
    
    const lowerMessage = userMessage.toLowerCase();
    
    // Route Pump.fun and new token queries to Sonia (token analyst)
    if (lowerMessage.includes('pump.fun') || 
        lowerMessage.includes('pumpfun') ||
        lowerMessage.includes('pump fun') ||
        (lowerMessage.includes('new') && lowerMessage.includes('token')) ||
        (lowerMessage.includes('latest') && lowerMessage.includes('token')) ||
        (lowerMessage.includes('trending') && lowerMessage.includes('token')) ||
        lowerMessage.includes('buy pressure') ||
        lowerMessage.includes('sell pressure') ||
        lowerMessage.includes('buy/sell')) {
      agentName = 'sonia';
    }
    
    // Route to Sonia for token analysis
    if (lowerMessage.includes('token') && (lowerMessage.includes('analyze') || lowerMessage.includes('analysis'))) {
      agentName = 'sonia';
    }
    
    // Route to Venice for news and research (but NOT for auction/price/swap/token queries)
    if (!lowerMessage.includes('auction') && 
        !lowerMessage.includes('price') &&
        !lowerMessage.includes('swap') &&
        !lowerMessage.includes('buy') &&
        !lowerMessage.includes('sell') &&
        !lowerMessage.includes('token') &&
        !lowerMessage.includes('pump') &&
        (lowerMessage.includes('news') || 
         lowerMessage.includes('research') || 
         lowerMessage.includes('latest update') || 
         lowerMessage.includes('what happened') ||
         lowerMessage.includes('partnership') ||
         lowerMessage.includes('announcement'))) {
      agentName = 'venice';
    }

    // Route to Zerion for portfolio and wallet analytics
    if (lowerMessage.includes('portfolio') ||
        lowerMessage.includes('my balance') ||
        lowerMessage.includes('my wallet') ||
        lowerMessage.includes('transaction history') ||
        lowerMessage.includes('pnl') ||
        lowerMessage.includes('profit') ||
        lowerMessage.includes('loss') ||
        lowerMessage.includes('defi position') ||
        lowerMessage.includes('my nft')) {
      agentName = 'zerion';
    }

    const agent = mastra.getAgent(agentName);

    // Build context from chat history
    const recentHistory = chatHistory.slice(-5).map((msg: any) => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text,
    }));

    // Add wallet context if available
    const contextualMessage = walletAddress
      ? `[User Wallet: ${walletAddress}]\n\n${userMessage}`
      : userMessage;

    console.log(`🤖 Using agent: ${agentName}`);
    console.log(`📝 Message: ${contextualMessage.substring(0, 100)}...`);

    // Generate response using Mastra
    // Set toolChoice to 'auto' to ensure tools are automatically called when appropriate
    const result = await agent.generate(contextualMessage, {
      maxSteps: 5,
      toolChoice: 'auto', // Enable automatic tool calling
      onStepFinish: (step: any) => {
        console.log(`✅ Step completed:`, step.text?.substring(0, 100));
        if (step.toolCalls) {
          console.log(`🔧 Tools called:`, step.toolCalls.map((t: any) => t.toolName).join(', '));
        }
      },
    });

    // Process tool results if any
    const toolResults: any[] = [];
    if (result.steps) {
      for (const step of result.steps as any[]) {
        if (step.toolCalls && step.toolCalls.length > 0) {
          for (let i = 0; i < step.toolCalls.length; i++) {
            const toolCall = step.toolCalls[i];
            const toolResult = step.toolResults?.[i];
            
            toolResults.push({
              tool: toolCall.toolName || 'unknown',
              args: toolCall.args,
              result: toolResult,
            });
          }
        }
      }
    }

    return {
      success: true,
      agent: agentName,
      response: result.text,
      toolResults,
      steps: result.steps?.length || 0,
    };
  } catch (error: any) {
    console.error('❌ Mastra Error:', error);
    return {
      success: false,
      error: error.message,
      response: 'Sorry, I encountered an error processing your request. Please try again.',
    };
  }
}

/**
 * Get specific agent for direct interaction
 */
export async function getAgent(agentName: 'solpilot' | 'sonia' | 'zerion' | 'venice') {
  return mastra.getAgent(agentName);
}

/**
 * Process user message using Mastra agents with streaming support
 */
export async function processMastraMessageStream(
  userMessage: string,
  chatHistory: any[],
  walletAddress: string | null
) {
  try {
    // Determine which agent to use based on message content
    let agentName: 'solpilot' | 'sonia' | 'zerion' | 'venice' = 'solpilot';
    
    const lowerMessage = userMessage.toLowerCase();
    
    // Route Pump.fun and new token queries to Sonia (token analyst)
    if (lowerMessage.includes('pump.fun') || 
        lowerMessage.includes('pumpfun') ||
        lowerMessage.includes('pump fun') ||
        (lowerMessage.includes('new') && lowerMessage.includes('token')) ||
        (lowerMessage.includes('latest') && lowerMessage.includes('token')) ||
        (lowerMessage.includes('trending') && lowerMessage.includes('token')) ||
        lowerMessage.includes('buy pressure') ||
        lowerMessage.includes('sell pressure') ||
        lowerMessage.includes('buy/sell')) {
      agentName = 'sonia';
    }
    
    // Route to Sonia for token analysis
    if (lowerMessage.includes('token') && (lowerMessage.includes('analyze') || lowerMessage.includes('analysis'))) {
      agentName = 'sonia';
    }
    
    // Route to Venice for news and research
    if (!lowerMessage.includes('auction') && 
        !lowerMessage.includes('price') &&
        !lowerMessage.includes('swap') &&
        !lowerMessage.includes('buy') &&
        !lowerMessage.includes('sell') &&
        !lowerMessage.includes('token') &&
        !lowerMessage.includes('pump') &&
        (lowerMessage.includes('news') || 
         lowerMessage.includes('research') || 
         lowerMessage.includes('latest update') || 
         lowerMessage.includes('what happened') ||
         lowerMessage.includes('partnership') ||
         lowerMessage.includes('announcement'))) {
      agentName = 'venice';
    }

    // Route to Zerion for portfolio and wallet analytics
    if (lowerMessage.includes('portfolio') ||
        lowerMessage.includes('my balance') ||
        lowerMessage.includes('my wallet') ||
        lowerMessage.includes('transaction history') ||
        lowerMessage.includes('pnl') ||
        lowerMessage.includes('profit') ||
        lowerMessage.includes('loss') ||
        lowerMessage.includes('defi position') ||
        lowerMessage.includes('my nft')) {
      agentName = 'zerion';
    }

    const agent = mastra.getAgent(agentName);

    // Add wallet context if available
    const contextualMessage = walletAddress
      ? `[User Wallet: ${walletAddress}]\n\n${userMessage}`
      : userMessage;

    console.log(`🤖 Using agent: ${agentName} (streaming mode)`);

    // Stream response using Mastra
    const streamResult = await agent.stream(contextualMessage, {
      maxSteps: 5,
      toolChoice: 'auto',
    });

    return {
      success: true,
      agent: agentName,
      stream: streamResult.textStream,
      fullStream: streamResult.fullStream,
    };
  } catch (error: any) {
    console.error('❌ Mastra Stream Error:', error);
    throw error;
  }
}
