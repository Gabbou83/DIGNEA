import { NextRequest, NextResponse } from 'next/server';
import { validateK10ID } from '@kit/k10/importer';
import { z } from 'zod';

const ValidateSchema = z.object({
  k10_id: z.string().regex(/^K10-\d{5}$/),
});

/**
 * POST /api/k10/validate
 * Validate if K10 ID exists in registry
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { k10_id } = ValidateSchema.parse(body);

    const isValid = await validateK10ID(k10_id);

    return NextResponse.json({
      success: true,
      valid: isValid,
      k10_id,
    });
  } catch (error) {
    console.error('K10 validation error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid K10 ID format', details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json({ error: 'Validation failed' }, { status: 500 });
  }
}
