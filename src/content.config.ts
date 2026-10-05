import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    // 05/10/2026: artículo que acompaña a un vídeo del canal de YouTube (@Masmoebel)
    youtube: z.string().regex(/^[A-Za-z0-9_-]{11}$/).optional(),
    youtubeVertical: z.boolean().default(false),
  }),
});

export const collections = { blog };
