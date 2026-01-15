#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';
import { scrapeK10Registry } from '../src/scraper';
import { normalizeK10RPA } from '../src/parser';

/**
 * CLI Script: Import K10 test data using direct Supabase client
 * Usage: pnpm tsx packages/k10/scripts/seed-k10-direct.ts
 */
async function main() {
  console.log('🚀 Starting K10 import...\n');

  // Initialize Supabase client with environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SECRET_KEY;

  if (!supabaseServiceKey) {
    console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY not found in environment');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  try {
    // Step 1: Scrape K10 (returns mock data for development)
    console.log('📡 Fetching K10 data...');
    const rpas = await scrapeK10Registry();
    console.log(`✅ Retrieved ${rpas.length} RPAs\n`);

    // Step 2: Import to database
    console.log('💾 Importing to database...');

    let imported = 0;
    let errors = 0;

    for (const rpa of rpas) {
      try {
        const normalized = normalizeK10RPA(rpa);

        const record = {
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
          k10_certification_status: normalized.certification_status || 'active',
          k10_certification_date: normalized.certification_date,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { error } = await supabase.from('rpas').upsert(record, {
          onConflict: 'k10_id',
          ignoreDuplicates: false,
        });

        if (error) {
          console.error(`   ❌ Error importing ${record.k10_id}:`, error.message);
          errors++;
        } else {
          console.log(`   ✅ Imported: ${record.name} (${record.k10_id})`);
          imported++;
        }
      } catch (error) {
        console.error(`   ❌ Error processing RPA:`, error);
        errors++;
      }
    }

    console.log('\n✅ Import complete!');
    console.log(`   - Imported: ${imported}`);
    console.log(`   - Errors: ${errors}`);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Import failed:', error);
    process.exit(1);
  }
}

main();
