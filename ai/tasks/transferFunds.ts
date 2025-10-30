import { extractTransactionData } from "../tools/transferTool";
import { createChatMessage } from "@/app/utils";

export async function transferFunds(
  intent: string,
  message: string,
  chatHistory: any[],
  addToChat: (msg: any) => void,
  address: string | null
) {
  if (!address) {
    addToChat(
      createChatMessage({
        sender: "ai",
        text: "Please connect your wallet first.",
        type: "text",
        intent: intent,
      })
    );
    return;
  }

  const transactionData = await extractTransactionData(message);
  switch (transactionData.status) {
    case "success":
      if (address == transactionData.receiver) {
        addToChat(
          createChatMessage({
            sender: "ai",
            text: "❌ You can't send token to yourself.",
            type: "error",
            intent: intent,
          })
        );
        return;
      }
      // Type assertion is safe here because status is "success"
      const successData = transactionData as {
        amount: number;
        token: { symbol: any; name: any; address: any; decimals: any; tokenType: string; denom: any; };
        receiver: string;
        status: string;
      };
      addToChat(
        createChatMessage({
          sender: "ai",
          text: ` You want to send  ${successData.amount} ${successData.token.symbol} to ${successData.receiver}. Are you confirming this transaction ?`,
          type: "send_token",
          intent: intent,
          send: {
            token: {
              tokenType: successData.token.tokenType,
              address: successData.token.address,
              decimals: successData.token.decimals,
              denom: successData.token.denom,
            },
            receiver: successData.receiver,
            amount: successData.amount,
          },
        })
      );
      return;
    case "fail_address":
      addToChat(
        createChatMessage({
          sender: "ai",
          text: "❌ Prompt details are unclear. Receiver address not found. Please type it fully and clear at your prompt. ",
          type: "error",
          intent: intent,
        })
      );
      return;
    case "fail_token":
      addToChat(
        createChatMessage({
          sender: "ai",
          text: "❌ Prompt details are unclear. Token could not be found on Injective Metadata list. ",
          type: "error",
          intent: intent,
        })
      );
      return;
    case "fail_match":
      addToChat(
        createChatMessage({
          sender: "ai",
          text: "❌ Prompt details are unclear. Please send me an info with basic prompt like this. Example : 'I want to send 10 INJ to inj1... ' ",
          type: "error",
          intent: intent,
        })
      );
      return;
  }
}
