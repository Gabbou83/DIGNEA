import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';
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

    const client = getSupabaseServerAdminClient();

    // Use PostgreSQL function with built-in accent normalization
    const { data: rpas, error } = await client.rpc('search_rpas_k10', {
      search_query: query,
      result_limit: limit,
    });

    if (error) {
      console.error('K10 search database error:', error);
      throw error;
    }

    const results = rpas || [];

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
