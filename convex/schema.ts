import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  conversations: defineTable({
    title: v.string(),
    slug: v.optional(v.string()),
    privateKey: v.optional(v.string()),
    participantIds: v.array(v.id("users")),
    createdBy: v.id("users"),
    lastMessageText: v.optional(v.string()),
    lastMessageAt: v.optional(v.number()),
  })
    .index("by_slug", ["slug"])
    .index("by_private_key", ["privateKey"]),
  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    text: v.string(),
    imageId: v.optional(v.id("_storage")),
    type: v.optional(v.union(v.literal("text"), v.literal("image"))),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
    isDeleted: v.optional(v.boolean()),
    deletedAt: v.optional(v.number()),
  }).index("by_conversation", ["conversationId"]),
  conversationReads: defineTable({
    conversationId: v.id("conversations"),
    userId: v.id("users"),
    lastReadAt: v.number(),
  }).index("by_user_conversation", ["userId", "conversationId"]),
});
