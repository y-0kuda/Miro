import { v } from "convex/values";
import { defineSchema, defineTable } from "convex/server";

export default defineSchema({
  boards: defineTable({
    title: v.string(),
    orgId: v.string(),
    authorId: v.string(),
    authorName: v.string(),
    imageUrl: v.string(),
  })
    // by_orgはconvexで設定されたもので、orgIdをそれに該当させる
    .index("by_org", ["orgId"])
    .searchIndex("serch_title", {
      // convexで設定されたsearchFiledとfilterFieldsはそれぞれを該当させる
      searchField: "title",
      filterFields: ["orgId"],
    }),
});
