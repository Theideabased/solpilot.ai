import jwt from "jsonwebtoken";
import { PublicKey } from "@solana/web3.js";
import nacl from "tweetnacl";
import bs58 from "bs58";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: Request) {
  try {
    const { nonce, signature, address } = await req.json();

    // Validate Solana address
    let publicKey: PublicKey;
    try {
      publicKey = new PublicKey(address);
    } catch (error) {
      return new Response(
        JSON.stringify({ 
          isValid: false, 
          error: "Invalid Solana address" 
        }), 
        { status: 400 }
      );
    }

    // Create the message that was signed
    const message = `Sign this message to authenticate with SOLPILOT:\n\nNonce: ${nonce}`;
    const messageBytes = new TextEncoder().encode(message);

    // Decode the signature from base58
    let signatureBytes: Uint8Array;
    try {
      signatureBytes = bs58.decode(signature);
    } catch (error) {
      return new Response(
        JSON.stringify({ 
          isValid: false, 
          error: "Invalid signature format" 
        }), 
        { status: 400 }
      );
    }

    // Verify the signature
    const isValid = nacl.sign.detached.verify(
      messageBytes,
      signatureBytes,
      publicKey.toBytes()
    );

    if (isValid) {
      // Check if nonce matches in database
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("wallet_address", address)
        .eq("nonce", nonce)
        .single();

      if (error || !data) {
        return new Response(
          JSON.stringify({ 
            isValid: false, 
            error: "Invalid nonce or user not found" 
          }), 
          { status: 401 }
        );
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          aud: "authenticated",
          wallet_address: address,
          nonce: nonce,
          exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour expiry
          user_metadata: {
            user_id: address,
            nonce: nonce,
          },
          role: "authenticated",
        },
        process.env.SUPABASE_JWT_SECRET as string
      );

      return new Response(
        JSON.stringify({ isValid: true, token }), 
        { status: 200 }
      );
    }

    return new Response(
      JSON.stringify({ isValid: false, token: null }), 
      { status: 401 }
    );
  } catch (error) {
    console.error("Error in verification:", error);
    return new Response(
      JSON.stringify({
        isValid: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500 }
    );
  }
}