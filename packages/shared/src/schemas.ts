import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
});

export const joinProjectSchema = z.object({
  inviteCode: z.string().length(6),
});

export const createSongSchema = z.object({
  name: z.string().min(1).max(200),
});

export const updateSongSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  position: z.number().int().min(0).optional(),
});

export const createStepSchema = z.object({
  name: z.string().min(1).max(200),
});

export const updateStepSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  position: z.number().int().min(0).optional(),
});

export const toggleCellSchema = z.object({
  isComplete: z.boolean(),
});

export const createNoteSchema = z.object({
  content: z.string().min(1).max(5000),
});
