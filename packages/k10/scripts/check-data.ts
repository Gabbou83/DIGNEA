#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mxzgwbzijosamimodxow.supabase.co';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14emd3Ynppam9zYW1pbW9keG93Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODQzNDY2MiwiZXhwIjoyMDg0MDEwNjYyfQ.f26yycj-jrVLBDd2qRcVFwvHdDFnsF7tTlxYjzqB7vU';

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  console.log('🔍 Checking rpas table...\n');

  // Get all RPAs
  const { data: rpas, error } = await supabase
    .from('rpas')
    .select('*')
    .limit(10);

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log(`Found ${rpas?.length || 0} RPAs in database:\n`);

  rpas?.forEach((rpa, index) => {
    console.log(`${index + 1}. ${rpa.name} (${rpa.k10_id})`);
    console.log(`   City: ${rpa.city}, Region: ${rpa.region}`);
    console.log(`   Active: ${rpa.is_active}`);
    console.log(`   All fields:`, Object.keys(rpa));
    console.log('');
  });

  // Test search query
  console.log('\n🔍 Testing search query...\n');

  const testQuery = 'Residence';
  const { data: searchResults, error: searchError } = await supabase
    .from('rpas')
    .select('k10_id, name, city')
    .or(`k10_id.ilike.%${testQuery}%,name.ilike.%${testQuery}%,city.ilike.%${testQuery}%`)
    .eq('is_active', true);

  console.log(`Search for "${testQuery}" found ${searchResults?.length || 0} results:`);
  searchResults?.forEach(r => console.log(`  - ${r.name}`));
}

main();
