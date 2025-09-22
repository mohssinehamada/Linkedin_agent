import { z } from 'zod';

export const JobPostExtract = z.object({
  title: z.string(),
  company: z.string(),
  location: z.string().optional(),
  seniority: z.string().optional(),
  remote: z.boolean().optional(),
  salary: z.string().optional(),
  tags: z.array(z.string()).default([]),
  responsibilities: z.array(z.string()).default([]),
  requirements: z.array(z.string()).default([]),
  applyUrl: z.string().url().optional()
});

export type JobPostExtractT = z.infer<typeof JobPostExtract>;


