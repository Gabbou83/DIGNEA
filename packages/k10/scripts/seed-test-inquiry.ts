#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';

/**
 * Script to create test inquiry data for testing the RPA response system
 * Usage: pnpm tsx packages/k10/scripts/seed-test-inquiry.ts
 */
async function main() {
  console.log('🚀 Creating test inquiry data...\n');

  // Initialize Supabase client
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    'https://mxzgwbzijosamimodxow.supabase.co';
  const supabaseServiceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14emd3Ynppam9zYW1pbW9keG93Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODQzNDY2MiwiZXhwIjoyMDg0MDEwNjYyfQ.f26yycj-jrVLBDd2qRcVFwvHdDFnsF7tTlxYjzqB7vU';

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  try {
    // Get the first RPA with K10-12345 (from our test data)
    const { data: rpa, error: rpaError } = await supabase
      .from('rpas')
      .select('id, name, k10_id')
      .eq('k10_id', 'K10-12345')
      .single();

    if (rpaError || !rpa) {
      console.error('❌ Error: Test RPA not found');
      console.error('   Please run seed-k10-direct.ts first to create test RPAs');
      process.exit(1);
    }

    console.log(`✅ Found RPA: ${rpa.name} (${rpa.k10_id})\n`);

    // Create test inquiries
    const testInquiries = [
      {
        rpa_id: rpa.id,
        requester_email: 'jean.tremblay@example.com',
        message:
          'Bonjour, je cherche une place pour ma mère âgée de 82 ans. Elle a besoin d\'aide pour les activités quotidiennes mais est encore assez autonome. Avez-vous des disponibilités? Merci.\n\nJean Tremblay',
        contact_type: 'message' as const,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      },
      {
        rpa_id: rpa.id,
        requester_email: 'marie.bouchard@example.com',
        message:
          'Mon père sort de l\'hôpital bientôt et a besoin d\'un hébergement. Il a 78 ans, diabétique, et nécessite un suivi médical régulier. Pouvez-vous m\'informer sur vos services?\n\nMarie Bouchard',
        contact_type: 'message' as const,
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      },
      {
        rpa_id: rpa.id,
        requester_email: 'sophie.martin@ciusss.qc.ca',
        message:
          '[URGENCE] Patient de 85 ans qui doit quitter l\'hôpital dans 48h. Alzheimer stade modéré, besoin de surveillance 24/7. Budget RAMQ standard. Pouvez-vous accueillir rapidement?\n\nSophie Martin, Travailleuse sociale\nCIUSSS de l\'Outaouais',
        contact_type: 'urgent_broadcast' as const,
        created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
      },
      {
        rpa_id: rpa.id,
        requester_email: 'claude.gagnon@example.com',
        message:
          'Ma femme et moi cherchons une résidence pour nos deux parents. Ils souhaitent rester ensemble si possible. Pouvez-vous nous rencontrer pour discuter des options?\n\nClaude Gagnon\n819-555-1234',
        contact_type: 'message' as const,
        created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
      },
    ];

    console.log('📝 Creating test inquiries...\n');

    for (const inquiry of testInquiries) {
      const { data, error } = await supabase
        .from('contacts')
        .insert(inquiry)
        .select()
        .single();

      if (error) {
        console.error(
          `   ❌ Error creating inquiry from ${inquiry.requester_email}:`,
          error.message,
        );
      } else {
        console.log(`   ✅ Created inquiry from ${inquiry.requester_email}`);
      }
    }

    console.log('\n✅ Test inquiry data created successfully!');
    console.log('\n📌 Next steps:');
    console.log('   1. Navigate to http://localhost:3005/rpa/inquiries');
    console.log('   2. Log in as RPA manager');
    console.log('   3. Click "Repondre" on an inquiry');
    console.log('   4. Test the response flow\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  }
}

main();
