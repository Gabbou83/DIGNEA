import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { z } from 'zod';

const SearchSchema = z.object({
  query: z.string().min(2).max(100),
  limit: z.number().int().min(1).max(50).optional().default(10),
});

/**
 * POST /api/k10/search
 * Search for RPAs in local database (seeded from K10)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, limit } = SearchSchema.parse(body);

    const client = getSupabaseServerClient();

    // Normalize query for search
    const normalizedQuery = query
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    // Search by:
    // 1. K10 ID exact match (priority)
    // 2. Name fuzzy match (using pg_trgm or full-text search)
    // 3. City match

    const { data: rpas, error } = await client
      .from('rpas')
      .select('k10_id, name, city, region, address, category, phone')
      .or(`k10_id.ilike.%${query}%,name.ilike.%${query}%,city.ilike.%${query}%`)
      .eq('is_active', true)
      .order('name')
      .limit(limit);

    if (error) {
      throw error;
    }

    // Calculate relevance score (simple version)
    const results =
      rpas?.map((rpa) => {
        let score = 0;

        // Exact K10 ID match = highest score
        if (rpa.k10_id.toLowerCase() === query.toLowerCase()) {
          score = 1.0;
        }
        // Starts with query
        else if (rpa.name.toLowerCase().startsWith(normalizedQuery)) {
          score = 0.9;
        }
        // Contains query
        else if (rpa.name.toLowerCase().includes(normalizedQuery)) {
          score = 0.7;
        }
        // City match
        else if (rpa.city?.toLowerCase().includes(normalizedQuery)) {
          score = 0.5;
        }

        return {
          ...rpa,
          relevance: score,
        };
      }) || [];

    // Sort by relevance
    results.sort((a, b) => b.relevance - a.relevance);

    return NextResponse.json({
      success: true,
      results,
      count: results.length,
    });
  } catch (error) {
    console.error('K10 search error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid search query', details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
