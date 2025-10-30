import { supabase } from "@/lib/supabaseClient";
import { v4 as uuidv4 } from "uuid";
import { PublicKey } from "@solana/web3.js";

export async function POST(req: Request) {
  try {
    const { address } = await req.json();

    // Validate the Solana wallet address format
    try {
      new PublicKey(address);
    } catch (error) {
      return new Response(
        JSON.stringify({ error: "Invalid Solana address" }),
        { status: 400 }
      );
    }
    const nonce = uuidv4();
  const { data, error: selectError } = await supabase
    .from("users")
    .select("nonce")
    .eq("wallet_address", address)
    .single();

  if (data) {
    const { error: updateError } = await supabase
      .from("users")
      .update({
        nonce: nonce,
      })
      .eq("wallet_address", address);

      if (updateError) {
        return new Response(
          JSON.stringify({ error: updateError.message }),
          { status: 500 }
        );
      }

  } else {
    const { error: insertError } = await supabase
      .from("users")
      .insert({ wallet_address: address, nonce: nonce });

    if (insertError) {
      return new Response(
        JSON.stringify({ error: insertError.message }),
        { status: 500 }
      );
    }
  }

  return new Response(JSON.stringify({ nonce: nonce }), { status: 200 });
  } catch (error) {
    console.error("Error generating nonce:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
}

