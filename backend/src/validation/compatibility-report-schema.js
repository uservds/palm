import { z } from 'zod';

export const coupleArchetypeSchema = z.object({
  name: z.string().min(1),
  energies: z.tuple([z.string().min(1), z.string().min(1)]),
});

export const freeInsightSchema = z.object({
  section_id: z.string().min(1),
  title: z.string().min(1),
  text: z.string().min(1),
});

export const lockedBlockSchema = z.object({
  section_id: z.string().min(1),
  title: z.string().min(1),
  teaser: z.string().min(1),
});

export const compatibilityReportSchema = z.object({
  couple_archetype: coupleArchetypeSchema,
  overall_score: z.number().min(0).max(100),
  free_insights: z.array(freeInsightSchema).length(2),
  locked_blocks: z.array(lockedBlockSchema).min(8).max(10),
  disclaimer: z.string().min(1),
  cta: z.string().min(1),
});