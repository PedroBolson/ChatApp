import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

const classConversationSlug = "class-chat";

function getPrivateConversationKey(userA: string, userB: string) {
  return [userA, userB].sort().join(":");
}

function getDisplayName(user: { name?: string; email?: string }) {
  return user.name ?? user.email ?? "Usuario";
}

export const getOrCreateClassConversation = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new ConvexError("Usuario nao autenticado.");
    }

    const existingConversation = await ctx.db
      .query("conversations")
      .withIndex("by_slug", (q) => q.eq("slug", classConversationSlug))
      .unique();

    if (existingConversation) {
      if (!existingConversation.participantIds.includes(userId)) {
        await ctx.db.patch(existingConversation._id, {
          participantIds: [...existingConversation.participantIds, userId],
        });
      }

      return existingConversation._id;
    }

    return await ctx.db.insert("conversations", {
      title: "Chat da Turma",
      slug: classConversationSlug,
      participantIds: [userId],
      createdBy: userId,
    });
  },
});

export const createConversation = mutation({
  args: {
    title: v.string(),
    participantIds: v.array(v.id("users")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new ConvexError("Usuario nao autenticado.");
    }

    const participantIds = Array.from(new Set([userId, ...args.participantIds]));

    return await ctx.db.insert("conversations", {
      title: args.title.trim(),
      participantIds,
      createdBy: userId,
    });
  },
});

export const getOrCreatePrivateConversation = mutation({
  args: {
    contactId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new ConvexError("Usuario nao autenticado.");
    }

    if (userId === args.contactId) {
      throw new ConvexError("Nao e possivel conversar consigo mesmo.");
    }

    const contact = await ctx.db.get(args.contactId);

    if (!contact) {
      throw new ConvexError("Contato nao encontrado.");
    }

    const privateKey = getPrivateConversationKey(userId, args.contactId);
    const existingConversation = await ctx.db
      .query("conversations")
      .withIndex("by_private_key", (q) => q.eq("privateKey", privateKey))
      .unique();

    if (existingConversation) {
      return existingConversation._id;
    }

    return await ctx.db.insert("conversations", {
      title: getDisplayName(contact),
      privateKey,
      participantIds: [userId, args.contactId],
      createdBy: userId,
    });
  },
});

export const listMyConversations = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      return [];
    }

    const conversations = await ctx.db.query("conversations").collect();

    const myConversations = conversations
      .filter((conversation) => conversation.participantIds.includes(userId))
      .sort((a, b) => (b.lastMessageAt ?? b._creationTime) - (a.lastMessageAt ?? a._creationTime));

    return await Promise.all(
      myConversations.map(async (conversation) => {
        if (!conversation.privateKey || conversation.participantIds.length !== 2) {
          return conversation;
        }

        const otherUserId = conversation.participantIds.find((participantId) => participantId !== userId);
        const otherUser = otherUserId ? await ctx.db.get(otherUserId) : null;

        return {
          ...conversation,
          title: otherUser ? getDisplayName(otherUser) : conversation.title,
        };
      }),
    );
  },
});
