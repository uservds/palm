import { z } from 'zod';

export const imageQualitySchema = z.object({
  score:     z.number().min(0).max(100),
  issues:    z.array(z.string()),
  user_hint: z.string().nullable(),
});

export const lineObservationSchema = z.object({
  id:         z.string(),
  present:    z.boolean(),
  quality:    z.string(),
  confidence: z.number().min(0).max(100),
  notes:      z.string(),
});

export const mountObservationSchema = z.object({
  id:          z.string(),
  prominence:  z.string(),
  signs:       z.array(z.string()),
  confidence:  z.number().min(0).max(100),
  notes:       z.string(),
});

export const observationsSchema = z.object({
  hand:              z.enum(['left', 'right', 'unknown']),
  hand_type:         z.enum(['earth', 'air', 'fire', 'water', 'unknown']),
  lines:             z.array(lineObservationSchema),
  mounts:            z.array(mountObservationSchema),
  additional_markers: z.array(z.any()),
});

export const lockedBlockSchema = z.object({
  title:      z.string(),
  teaser:     z.string(),
  block_type: z.enum(['relationships','career','fears','potential','money','health_wellbeing']),
});

export const aiReportSchema = z.object({
  archetype:       z.string().min(1),
  metaphor:        z.string().min(1),
  free_insights:   z.array(z.string()).min(1),
  locked_blocks:   z.array(lockedBlockSchema).min(1),
  scientific_facts: z.array(z.string()),
  progress_percent: z.number().min(0).max(100),
  disclaimer:      z.string().min(1),
  cta:             z.string().min(1),
});

export const palmAnalysisResultSchema = z.object({
  image_quality: imageQualitySchema,
  observations:  observationsSchema,
  report:        aiReportSchema,
});