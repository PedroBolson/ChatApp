import { getAuthUserId } from "@convex-dev/auth/server";
import { query } from "./_generated/server";

function getDisplayName(user: { name?: string; email?: string }) {
  return user.name ?? user.email ?? "Usuario";
}

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      return null;
    }

    return await ctx.db.get(userId);
  },
});

export const listContacts = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      return [];
    }

    const users = await ctx.db.query("users").collect();

    return users
      .filter((user) => user._id !== userId)
      .map((user) => ({
        _id: user._id,
        name: getDisplayName(user),
        email: user.email ?? "",
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  },
});
