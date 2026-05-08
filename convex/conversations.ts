import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

const classConversationSlug = "class-chat";

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

export const listMyConversations = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      return [];
    }

    const conversations = await ctx.db.query("conversations").collect();

    return conversations
      .filter((conversation) => conversation.participantIds.includes(userId))
      .sort((a, b) => (b.lastMessageAt ?? b._creationTime) - (a.lastMessageAt ?? a._creationTime));
  },
});
