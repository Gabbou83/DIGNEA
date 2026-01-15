#!/usr/bin/env tsx

import { scrapeK10Registry } from '../src/scraper';
import { importK10RPAs } from '../src/importer';

/**
 * CLI Script: Import K10 test data
 * Usage: pnpm tsx packages/k10/scripts/seed-k10.ts
 */
async function main() {
  console.log('🚀 Starting K10 import...\n');

  try {
    // Step 1: Scrape K10 (returns mock data for development)
    console.log('📡 Fetching K10 data...');
    const rpas = await scrapeK10Registry();
    console.log(`✅ Retrieved ${rpas.length} RPAs\n`);

    // Step 2: Import to database
    console.log('💾 Importing to database...');
    const { imported, errors } = await importK10RPAs(rpas);

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
