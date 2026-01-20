import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type CreateChatBody =
  | {
      type: "direct";
      otherUserId: string;
    }
  | {
      type: "group";
      participantIds: string[];
      name: string;
    };

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader) {
      console.log("chat-create: missing Authorization header");
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    // Client bound to the caller identity
    const supabaseUserClient = createClient(supabaseUrl, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: userErr } = await supabaseUserClient.auth.getUser();
    if (userErr || !userData?.user) {
      console.log("chat-create: auth.getUser failed", userErr);
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const userId = userData.user.id;

    // Admin client bypassing RLS, but we enforce access using the verified userId above
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const body = (await req.json()) as CreateChatBody;

    console.log("chat-create: request", { userId, body });

    if (body.type === "direct") {
      const otherUserId = body.otherUserId;
      if (!otherUserId) return jsonResponse({ error: "otherUserId is required" }, 400);
      if (otherUserId === userId) return jsonResponse({ error: "Cannot chat with yourself" }, 400);

      // Find existing 1:1 chat
      const [u1, u2] = await Promise.all([
        supabaseAdmin.from("chat_participants").select("chat_id").eq("user_id", userId),
        supabaseAdmin.from("chat_participants").select("chat_id").eq("user_id", otherUserId),
      ]);

      if (u1.error) throw u1.error;
      if (u2.error) throw u2.error;

      const u1Ids = new Set((u1.data ?? []).map((r) => r.chat_id));
      const common = (u2.data ?? []).map((r) => r.chat_id).filter((id) => u1Ids.has(id));

      for (const chatId of common) {
        const { data: chat, error: chatErr } = await supabaseAdmin
          .from("chats")
          .select("*")
          .eq("id", chatId)
          .eq("type", "direct")
          .maybeSingle();

        if (chatErr) throw chatErr;
        if (!chat) continue;

        const { count, error: cntErr } = await supabaseAdmin
          .from("chat_participants")
          .select("id", { count: "exact", head: true })
          .eq("chat_id", chatId);

        if (cntErr) throw cntErr;
        if (count === 2) {
          console.log("chat-create: found existing direct chat", chatId);
          return jsonResponse(chat);
        }
      }

      // Create new chat
      const { data: newChat, error: createErr } = await supabaseAdmin
        .from("chats")
        .insert({ type: "direct", created_by: userId })
        .select("*")
        .single();

      if (createErr) throw createErr;

      const { error: partsErr } = await supabaseAdmin.from("chat_participants").insert([
        { chat_id: newChat.id, user_id: userId, last_read_at: new Date().toISOString() },
        { chat_id: newChat.id, user_id: otherUserId, last_read_at: null },
      ]);

      if (partsErr) throw partsErr;

      console.log("chat-create: created direct chat", newChat.id);
      return jsonResponse(newChat);
    }

    // group
    const name = (body as any).name;
    const participantIds = (body as any).participantIds as string[];

    if (!name?.trim()) return jsonResponse({ error: "name is required" }, 400);
    if (!Array.isArray(participantIds) || participantIds.length < 2) {
      return jsonResponse({ error: "participantIds must have at least 2 users" }, 400);
    }

    const uniqueParticipants = Array.from(new Set([userId, ...participantIds])).filter(Boolean);

    const { data: groupChat, error: groupErr } = await supabaseAdmin
      .from("chats")
      .insert({ type: "group", name: name.trim(), created_by: userId })
      .select("*")
      .single();

    if (groupErr) throw groupErr;

    const inserts = uniqueParticipants.map((pid) => ({
      chat_id: groupChat.id,
      user_id: pid,
      last_read_at: pid === userId ? new Date().toISOString() : null,
    }));

    const { error: groupPartsErr } = await supabaseAdmin.from("chat_participants").insert(inserts);
    if (groupPartsErr) throw groupPartsErr;

    console.log("chat-create: created group chat", groupChat.id);
    return jsonResponse(groupChat);
  } catch (e) {
    console.error("chat-create error:", e);
    return jsonResponse({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
