import { defineContentConfig, defineCollection, z } from "@nuxt/content";

export default defineContentConfig({
  collections: {
    pages: defineCollection({
      type: "page",
      source: "pages/**/*.md",
    }),

    // pdf: defineCollection({
    //   type: "data",
    //   source: "pdf/**/*.json",
    //   schema: z.object({
    //     title: z.string(),
    //     description: z.string(),
    //     link: z.string().url(),
    //     author: z.string().optional(),
    //     date: z.string().optional(),
    //     keywords: z.array(z.string()).optional(),
    //   }),
    // }),
  },
});
