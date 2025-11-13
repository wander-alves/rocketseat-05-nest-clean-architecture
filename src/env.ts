import { z } from 'zod/v3';

export const envSchema = z.object({
  DATABASE_URL: z.string().url().startsWith('postgres://'),
  PORT: z.coerce.number().optional().default(3333),
});

export type Env = z.infer<typeof envSchema>;
