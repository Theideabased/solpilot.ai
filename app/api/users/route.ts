import { createSolanaIfNotExists, getSolanaAddress } from "./utils";

export async function POST(req: Request) {
  const { wallet_address, referral_code } = await req.json();

  if (!wallet_address) {
    return new Response(JSON.stringify({ error: "Missing wallet_address" }), { status: 400 });
  }

  if (wallet_address) {
    const { data, error } = await createSolanaIfNotExists(wallet_address, referral_code);
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
    return new Response(JSON.stringify({ data }), { status: 200 });
  }

  return new Response(JSON.stringify({ error: "Invalid request" }), { status: 400 });
}

export async function GET(req: Request) {
  const solanaAddress = req.headers.get("solanaAddress");

  if (solanaAddress) {
    const { data, error } = await getSolanaAddress(solanaAddress);
    if (error) {
      return new Response(JSON.stringify({ data }), { status: 500 });
    }
    return new Response(JSON.stringify({ data }), { status: 200 });
  }

  return new Response(JSON.stringify({ error: "Missing solanaAddress header" }), { status: 400 });
}
