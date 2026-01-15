import { z } from 'zod';

/**
 * K10 RPA Entry from Registry
 */
export const K10RPASchema = z.object({
  k10_id: z.string().regex(/^K10-\d{5}$/), // Ex: K10-12345
  name: z.string(),
  address: z.string().optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  postal_code: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),

  // K10 specific
  category: z.number().int().min(1).max(4).optional(), // RPA Category 1-4
  certification_date: z.string().optional(),
  certification_status: z.enum(['active', 'suspended', 'expired']).optional(),

  // For matching
  search_terms: z.string().optional(), // Normalized for search
});

export type K10RPA = z.infer<typeof K10RPASchema>;

/**
 * Search result with relevance score
 */
export interface K10SearchResult {
  rpa: K10RPA;
  relevance: number; // 0-1 score
  matchedFields: string[]; // ['name', 'k10_id', etc.]
}

/**
 * Sync statistics
 */
export interface K10SyncStats {
  totalScraped: number;
  newRPAs: number;
  updatedRPAs: number;
  deactivatedRPAs: number;
  errors: number;
  duration: number; // milliseconds
  lastSyncAt: Date;
}
