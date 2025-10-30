import { supabase } from "@/lib/supabaseClient";

export async function GET(req: Request) {
  const walletAddress = req.headers.get("solanaAddress") || req.headers.get("injectiveAddress");
  if (!walletAddress) {
    return new Response(JSON.stringify({ error: "Missing wallet address" }), { status: 400 });
  }

  const { data: userId, error: userIdError } = await supabase
    .from("users")
    .select("id")
    .eq("wallet_address", walletAddress)
    .single();

  if (userIdError) {
    return new Response(JSON.stringify({ error: `userError: ${userIdError.message}` }), {
      status: 500,
    });
  }

  const { data, error } = await supabase.from("chats").select("*").eq("user_id", userId?.id);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ data }), { status: 200 });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("📥 POST /api/chats received body:", JSON.stringify(body, null, 2));
    
    const { title, walletAddress, injectiveAddress, solanaAddress } = body;

    // Support both old and new parameter names
    const userWalletAddress = walletAddress || solanaAddress || injectiveAddress;

    console.log("🔍 Looking for user with wallet:", userWalletAddress);

    if (!userWalletAddress) {
      console.error("❌ Missing wallet address in request");
      return new Response(JSON.stringify({ error: "Missing wallet address" }), { status: 400 });
    }

    // Get user data
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("wallet_address", userWalletAddress)
      .single();

    console.log("👤 User lookup result:", { userData, userError: userError?.message });

    if (userError || !userData) {
      console.error("❌ User not found:", userError?.message);
      return new Response(JSON.stringify({ error: `User not found: ${userError?.message}` }), { status: 400 });
    }

    // Get or create system AI user (using a fixed wallet address for AI)
    const AI_WALLET_ADDRESS = "SYSTEM_AI_ADDRESS";
    const { data: existingSystemData, error: systemFetchError } = await supabase
      .from("users")
      .select("id")
      .eq("wallet_address", AI_WALLET_ADDRESS)
      .single();

    let systemUserId;

    // Create system user if it doesn't exist
    if (systemFetchError) {
      console.log("🤖 System user not found, creating...");
      const { data: newSystemUser, error: createError } = await supabase
        .from("users")
        .insert([{ wallet_address: AI_WALLET_ADDRESS, is_whitelisted: true }])
        .select()
        .single();

      if (createError || !newSystemUser) {
        console.error("❌ Failed to create system user:", createError?.message);
        return new Response(JSON.stringify({ error: `Failed to create system user: ${createError?.message}` }), {
          status: 500,
        });
      }
      systemUserId = newSystemUser.id;
      console.log("✅ System user created with ID:", systemUserId);
    } else {
      systemUserId = existingSystemData.id;
      console.log("✅ System user found with ID:", systemUserId);
    }

    if (!systemUserId) {
      return new Response(JSON.stringify({ error: "System user not found" }), { status: 500 });
    }

    console.log("💬 Creating chat with:", { ai_id: systemUserId, user_id: userData.id, title });

    const { data: chatData, error: chatError } = await supabase
      .from("chats")
      .insert([{ ai_id: systemUserId, user_id: userData.id, title: title }])
      .select()
      .single();

    if (chatError) {
      console.error("❌ Failed to create chat:", chatError.message);
      return new Response(JSON.stringify({ error: chatError.message }), { status: 500 });
    }

    console.log("✅ Chat created successfully:", chatData);
    return new Response(JSON.stringify({ data: chatData }), { status: 200 });
  } catch (error: any) {
    console.error("❌ Unexpected error in POST /api/chats:", error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
