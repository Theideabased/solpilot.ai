import { supabase } from "@/lib/supabaseClient";

// Get chat messages
export async function GET(req: Request, { params }: { params: Promise<{ chatId: string }> }) {
  const chatId = (await params).chatId;

  const { data, error } = await supabase.from("messages").select("*").eq("chat_id", chatId);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify(data), { status: 200 });
}

// Delete chat and all its messages
export async function DELETE(req: Request, { params }: { params: Promise<{ chatId: string }> }) {
  try {
    const chatId = (await params).chatId;

    // First delete all messages for this chat
    const { error: messagesError } = await supabase
      .from("messages")
      .delete()
      .eq("chat_id", chatId);

    if (messagesError) {
      console.error("Error deleting messages:", messagesError);
      return new Response(
        JSON.stringify({ error: "Failed to delete messages", details: messagesError.message }), 
        { status: 500 }
      );
    }

    // Then delete the chat itself
    const { error: chatError } = await supabase
      .from("chats")
      .delete()
      .eq("id", chatId);

    if (chatError) {
      console.error("Error deleting chat:", chatError);
      return new Response(
        JSON.stringify({ error: "Failed to delete chat", details: chatError.message }), 
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "Chat deleted successfully" }), 
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error in DELETE /api/chats/[chatId]:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }), 
      { status: 500 }
    );
  }
}
