import { NextResponse } from "next/server";
import { processMastraMessage, processMastraMessageStream } from "@/app/services/mastraService";
import { createChatMessage } from "@/app/utils";
import { extractTransactionData } from "@/ai/tools/transferTool";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const chatHistory = body.chatHistory || [];
    const walletAddress = body.address || null;
    const useStreaming = body.stream !== false; // Enable streaming by default

    // Check if this is a transfer request (before calling Mastra)
    const lowerMessage = body.message.toLowerCase();
    if ((lowerMessage.includes('send') || lowerMessage.includes('transfer')) && 
        (lowerMessage.includes('sol') || lowerMessage.includes('to'))) {
      
      if (!walletAddress) {
        return NextResponse.json({
          messages: [
            createChatMessage({
              sender: "ai",
              text: "Please connect your wallet first before making transfers.",
              type: "text",
              intent: "transfer",
            }),
          ],
        });
      }

      // Extract transaction data
      const transactionData = await extractTransactionData(body.message);
      
      if (transactionData.status === "success") {
        if (walletAddress === transactionData.receiver) {
          return NextResponse.json({
            messages: [
              createChatMessage({
                sender: "ai",
                text: "❌ You can't send tokens to yourself.",
                type: "error",
                intent: "transfer",
              }),
            ],
          });
        }

        return NextResponse.json({
          messages: [
            createChatMessage({
              sender: "ai",
              text: `You want to send ${transactionData.amount} ${transactionData.token.symbol} to ${transactionData.receiver}. Please confirm this transaction.`,
              type: "send_token",
              intent: "transfer",
              send: transactionData,
            }),
          ],
        });
      } else if (transactionData.status === "fail_address") {
        return NextResponse.json({
          messages: [
            createChatMessage({
              sender: "ai",
              text: "❌ Invalid receiver address. Please provide a valid Solana wallet address.",
              type: "error",
              intent: "transfer",
            }),
          ],
        });
      } else if (transactionData.status === "fail_token") {
        return NextResponse.json({
          messages: [
            createChatMessage({
              sender: "ai",
              text: "❌ Token not found. Please use a valid token symbol (e.g., SOL, USDC, BONK).",
              type: "error",
              intent: "transfer",
            }),
          ],
        });
      } else {
        return NextResponse.json({
          messages: [
            createChatMessage({
              sender: "ai",
              text: "❌ Could not understand transfer request. Please use format: 'Send 0.1 SOL to [address]' or 'Transfer 0.1 SOL to [address]'",
              type: "error",
              intent: "transfer",
            }),
          ],
        });
      }
    }

    // Use streaming if enabled
    if (useStreaming) {
      const streamResult = await processMastraMessageStream(body.message, chatHistory, walletAddress);

      // Create a ReadableStream for the response
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          try {
            // Send agent info
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'agent', agent: streamResult.agent })}\n\n`)
            );

            // Stream the text response
            for await (const chunk of streamResult.stream) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: 'text', content: chunk })}\n\n`)
              );
            }

            // Send completion signal
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`)
            );
            
            controller.close();
          } catch (error) {
            console.error('Stream error:', error);
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'error', error: 'Streaming failed' })}\n\n`)
            );
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // Fallback to non-streaming (original behavior)
    const result = await processMastraMessage(body.message, chatHistory, walletAddress);

    if (!result.success) {
      return NextResponse.json(
        {
          messages: [
            createChatMessage({
              sender: "ai",
              text: result.response,
              type: "error",
              intent: "error",
            }),
          ],
        },
        { status: 200 }
      );
    }

    // Build response messages
    const newMessages: any[] = [];

    // Add tool results as separate messages if any
    if (result.toolResults && result.toolResults.length > 0) {
      for (const toolResult of result.toolResults) {
        if (toolResult.result?.success) {
          // Determine message type based on tool
          let messageType = "text";
          if (toolResult.tool.includes("balance")) messageType = "balance";
          if (toolResult.tool.includes("swap")) messageType = "swap";
          if (toolResult.tool.includes("validator")) messageType = "validators";
          if (toolResult.tool.includes("metrics")) messageType = "metrics";

          newMessages.push(
            createChatMessage({
              sender: result.agent || "ai",
              text: JSON.stringify(toolResult.result.data || toolResult.result, null, 2),
              type: messageType,
              intent: toolResult.tool,
            })
          );
        }
      }
    }

    // Add main AI response
    newMessages.push(
      createChatMessage({
        sender: result.agent || "ai",
        text: result.response || "I've processed your request.",
        type: "text",
        intent: "general",
      })
    );

    return NextResponse.json({ messages: newMessages });
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        messages: [
          createChatMessage({
            sender: "ai",
            text: "Failed to process AI request. Please try again.",
            type: "error",
            intent: "error",
          }),
        ],
      },
      { status: 500 }
    );
  }
}
