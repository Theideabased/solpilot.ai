import { fetchLatestAuction } from "../tools/fetchAuction";
import { createChatMessage } from "@/app/utils";


export async function getLatestAuction(
  intent: string,
  message: string,
  chatHistory: any[],
  addToChat: (msg: any) => void,
  address: string | null) {
       
      addToChat(
        createChatMessage({
                sender: "ai",
                text: "🔍 Fetching the latest SOL Burn Auction...",
                type: "loading",
                intent: intent,
              })
        );
      const latestAuction = await fetchLatestAuction(null);
      addToChat(
        createChatMessage({
          sender: "ai",
          text: latestAuction,
          type: "success",
          intent: intent,
        })
      );

      
      
    }

export async function getAuction(
  intent: string,
  message: string,
  chatHistory: any[],
  addToChat: (msg: any) => void,
  address: string | null) {

        const round = extractAuctionRound(message)
            if(round == null){
              addToChat(
                createChatMessage({
                  sender: "ai",
                  text: "❌ No valid Round found in your message.",
                  type: "error",
                  intent: intent,
                })
              );
                return
            }
            
          addToChat(
            createChatMessage({
              sender: "ai",
              text: `🔍 Fetching SOL Burn Auction ${round} ...`,
              type: "loading",
              intent: intent,
            })
            );
    
          
          const latestAuction = await fetchLatestAuction(round);
          addToChat(
            createChatMessage({
              sender: "ai",
              text: latestAuction,
              type: "success",
              intent: intent,
            })
          );
          
        }

function extractAuctionRound(userMessage:string) {
            const regex = /(?:auction|round|number|bidding round)\s*(\d+)/i;
            const match = userMessage.match(regex);
        
            if (match) {
                return parseInt(match[1], 10); 
            }
        
            return null; 
        }

