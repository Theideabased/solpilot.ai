import { NextResponse } from 'next/server';
import { mastra } from '@/mastra';

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { message, agent = 'solpilot', walletAddress, chatHistory = [] } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Get the specified agent
    const selectedAgent = mastra.getAgent(agent);

    if (!selectedAgent) {
      return NextResponse.json({ error: `Agent '${agent}' not found` }, { status: 404 });
    }

    // Build context from chat history
    const contextMessages = chatHistory
      .slice(-5) // Last 5 messages for context
      .map((msg: any) => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text,
      }));

    // Add wallet address to context if available
    const enhancedMessage = walletAddress
      ? `[Wallet: ${walletAddress}]\n${message}`
      : message;

    // Generate response with streaming
    const result = await selectedAgent.generate(enhancedMessage, {
      maxSteps: 5,
      onStepFinish: (step: any) => {
        console.log(`Step ${step.stepNumber}:`, step.text);
      },
    });

    // Extract tool results if any
    const toolResults = result.steps
      ?.filter((step: any) => step.toolCalls && step.toolCalls.length > 0)
      .map((step: any) => ({
        tool: step.toolCalls![0].toolName,
        result: step.toolResults?.[0],
      }));

    return NextResponse.json({
      success: true,
      agent,
      response: result.text,
      toolResults,
      steps: result.steps?.length || 0,
    });
  } catch (error: any) {
    console.error('Mastra Agent Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process request',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
