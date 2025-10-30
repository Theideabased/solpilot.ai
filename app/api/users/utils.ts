import { supabase } from "@/lib/supabaseClient";

export async function getMessages(chatId: number) {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching messages:", error);
    return [];
  }

  return data;
}

export async function sendMessageToDB(chatId: number, senderId: number, message: object) {
  const { data, error } = await supabase
    .from("messages")
    .insert([{ chat_id: chatId, sender_id: senderId, message }]);

  if (error) {
    console.error("Error sending message:", error);
    return error;
  }

  return data;
}

export async function getSolanaAddress(solanaAddress: string): Promise<any> {
  const { data, error } = await supabase
    .from("users")
    .select("wallet_address, is_whitelisted")
    .eq("wallet_address", solanaAddress)
    .single();

  if (error) {
    console.error("Error fetching solana address:", error);
    return { data: null, error };
  }

  return { data, error };
}

export async function createSolanaIfNotExists(
  solanaAddress: string,
  referralCode?: string
): Promise<any> {
  const { data: existingSolana, error: existingSolanaError } = await supabase
    .from("users")
    .select("wallet_address")
    .eq("wallet_address", solanaAddress)
    .single();

  if (existingSolana) {
    // Update is_whitelisted to true if referral code is provided
    if (referralCode !== undefined) {
      const { data: updatedData, error: updateError } = await supabase
        .from("users")
        .update({ is_whitelisted: true })
        .eq("wallet_address", solanaAddress)
        .select();

      if (updateError) {
        console.error("Error updating solana user:", updateError);
        return { data: null, error: updateError };
      }
      return { data: updatedData, error: null };
    }
    return { data: existingSolana, error: null };
  }

  const { data, error } = await supabase
    .from("users")
    .insert([
      {
        wallet_address: solanaAddress,
        is_whitelisted: referralCode !== undefined,
      },
    ])
    .select();

  if (error) {
    console.error("Error creating solana user:", error);
    return { data: null, error };
  }

  return { data, error };
}
