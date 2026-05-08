import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";

async function requireConversationParticipant(
  ctx: QueryCtx | MutationCtx,
  conversationId: Id<"conversations">,
) {
  const userId = await getAuthUserId(ctx);

  if (!userId) {
    throw new ConvexError("Usuario nao autenticado.");
  }

  const conversation = await ctx.db.get(conversationId);

  if (!conversation || !conversation.participantIds.includes(userId)) {
    throw new ConvexError("Conversa nao encontrada.");
  }

  return { userId, conversation };
}

export const listByConversation = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireConversationParticipant(ctx, args.conversationId);
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .collect();

    return await Promise.all(
      messages.map(async (message) => {
        const sender = await ctx.db.get(message.senderId);

        return {
          ...message,
          senderName: sender?.name ?? sender?.email ?? "Usuario",
          isMine: message.senderId === userId,
        };
      }),
    );
  },
});

export const sendMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireConversationParticipant(ctx, args.conversationId);
    const text = args.text.trim();

    if (!text) {
      throw new ConvexError("A mensagem nao pode ser vazia.");
    }

    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: userId,
      text,
    });

    await ctx.db.patch(args.conversationId, {
      lastMessageText: text,
      lastMessageAt: Date.now(),
    });

    return messageId;
  },
});
