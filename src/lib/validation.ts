import { z } from 'zod';

const safeUrl = z.string().trim().max(2048).refine(
  (val) => !val || /^https?:\/\//i.test(val),
  { message: 'URL must start with http:// or https://' }
);

export const branchSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(255, 'Name too long'),
  code: z.string().trim().min(1, 'Code is required').max(20, 'Code too long')
    .regex(/^[A-Za-z0-9_-]+$/, 'Code must be alphanumeric'),
  description: z.string().trim().max(5000, 'Description too long').optional(),
  icon_url: safeUrl.optional().nullable(),
});

export const resourceSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(255, 'Title too long'),
  subject_name: z.string().trim().min(1, 'Subject is required').max(255, 'Subject name too long'),
  description: z.string().trim().max(5000, 'Description too long').optional().nullable(),
  file_url: safeUrl.optional().nullable(),
  external_url: safeUrl.optional().nullable(),
  thumbnail_url: safeUrl.optional().nullable(),
  branch_id: z.string().uuid(),
  semester: z.number().int().min(1).max(12),
  resource_type: z.enum([
    'playlist', 'gtu_paper', 'paper_solution', 'imp', 'book', 'lab_manual', 'handwritten_notes'
  ]),
  is_active: z.boolean().optional(),
  uploaded_by: z.string().uuid().optional().nullable(),
});

export const supportRequestSchema = z.object({
  subject: z.string().trim().min(1, 'Subject is required').max(255, 'Subject too long'),
  message: z.string().trim().min(1, 'Message is required').max(5000, 'Message too long'),
});

export const scanTitleSchema = z.string().trim().min(1, 'Title is required').max(255, 'Title too long');
