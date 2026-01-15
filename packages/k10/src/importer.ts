import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';
import type { K10RPA } from './types';
import { normalizeK10RPA } from './parser';

/**
 * Import K10 RPAs into Supabase database (bulk)
 */
export async function importK10RPAs(rpas: K10RPA[]): Promise<{
  imported: number;
  errors: number;
}> {
  const client = getSupabaseServerAdminClient();
  let imported = 0;
  let errors = 0;

  // Process in batches of 50
  const BATCH_SIZE = 50;

  for (let i = 0; i < rpas.length; i += BATCH_SIZE) {
    const batch = rpas.slice(i, i + BATCH_SIZE);

    try {
      const records = batch.map((rpa) => {
        const normalized = normalizeK10RPA(rpa);

        return {
          k10_id: normalized.k10_id,
          name: normalized.name,
          address: normalized.address,
          city: normalized.city,
          region: normalized.region,
          postal_code: normalized.postal_code,
          phone: normalized.phone,
          email: normalized.email,
          website: normalized.website,
          category: normalized.category,

          // K10 specific metadata
          k10_certification_status: normalized.certification_status || 'active',
          k10_certification_date: normalized.certification_date,

          // System fields
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      });

      const { error, count } = await client.from('rpas').upsert(records, {
        onConflict: 'k10_id',
        ignoreDuplicates: false,
      });

      if (error) {
        console.error(`Batch import error:`, error);
        errors += batch.length;
      } else {
        imported += count || batch.length;
      }
    } catch (error) {
      console.error(`Batch processing error:`, error);
      errors += batch.length;
    }
  }

  console.log(`Import complete: ${imported} imported, ${errors} errors`);

  return { imported, errors };
}

/**
 * Check if K10 ID exists in database
 */
export async function validateK10ID(k10_id: string): Promise<boolean> {
  const client = getSupabaseServerAdminClient();

  const { data, error } = await client
    .from('rpas')
    .select('k10_id')
    .eq('k10_id', k10_id.toUpperCase())
    .single();

  if (error || !data) {
    return false;
  }

  return true;
}
