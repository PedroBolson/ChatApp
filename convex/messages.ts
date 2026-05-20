import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";

type MessageStatus = "sent" | "delivered" | "read";

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
    const { userId, conversation } = await requireConversationParticipant(ctx, args.conversationId);
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .collect();
    const otherParticipantIds = conversation.participantIds.filter(
      (participantId) => participantId !== userId,
    );
    const otherReads = await Promise.all(
      otherParticipantIds.map((participantId) =>
        ctx.db
          .query("conversationReads")
          .withIndex("by_user_conversation", (q) =>
            q.eq("userId", participantId).eq("conversationId", args.conversationId),
          )
          .unique(),
      ),
    );

    return await Promise.all(
      messages.map(async (message) => {
        const sender = await ctx.db.get(message.senderId);
        const isMine = message.senderId === userId;
        const wasReadByOthers =
          otherReads.length > 0 &&
          otherReads.every((read) => read && read.lastReadAt >= message._creationTime);
        const status: MessageStatus | undefined = isMine
          ? wasReadByOthers
            ? "read"
            : conversation.privateKey
              ? "delivered"
              : "sent"
          : undefined;

        return {
          ...message,
          senderName: sender?.name ?? sender?.email ?? "Usuario",
          isMine,
          status,
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

export const updateMessage = mutation({
  args: {
    id: v.id("messages"),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.id);

    if (!message) {
      throw new ConvexError("Mensagem nao encontrada.");
    }

    const { userId } = await requireConversationParticipant(ctx, message.conversationId);

    if (message.senderId !== userId) {
      throw new ConvexError("Voce so pode editar suas mensagens.");
    }

    if (message.isDeleted) {
      throw new ConvexError("Nao e possivel editar mensagem apagada.");
    }

    const text = args.text.trim();

    if (!text) {
      throw new ConvexError("A mensagem nao pode ser vazia.");
    }

    await ctx.db.patch(args.id, {
      text,
      updatedAt: Date.now(),
    });

    const lastMessage = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", message.conversationId))
      .order("desc")
      .first();

    if (lastMessage?._id === args.id) {
      await ctx.db.patch(message.conversationId, {
        lastMessageText: text,
      });
    }
  },
});

export const deleteMessage = mutation({
  args: {
    id: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.id);

    if (!message) {
      throw new ConvexError("Mensagem nao encontrada.");
    }

    const { userId } = await requireConversationParticipant(ctx, message.conversationId);

    if (message.senderId !== userId) {
      throw new ConvexError("Voce so pode apagar suas mensagens.");
    }

    if (message.isDeleted) {
      return;
    }

    await ctx.db.patch(args.id, {
      text: "",
      isDeleted: true,
      deletedAt: Date.now(),
    });

    const lastMessage = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", message.conversationId))
      .order("desc")
      .first();

    if (lastMessage?._id === args.id) {
      await ctx.db.patch(message.conversationId, {
        lastMessageText: "Mensagem apagada",
      });
    }
  },
});
