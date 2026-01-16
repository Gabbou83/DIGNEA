import { NextRequest, NextResponse } from 'next/server';

import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { rpaIds, requesterInfo, message, patientProfile } = body;

    if (!rpaIds || rpaIds.length === 0) {
      return NextResponse.json(
        { error: 'Au moins une résidence doit être sélectionnée' },
        { status: 400 },
      );
    }

    if (!requesterInfo?.name || !requesterInfo?.email) {
      return NextResponse.json(
        { error: 'Nom et courriel requis' },
        { status: 400 },
      );
    }

    if (!message) {
      return NextResponse.json(
        { error: 'Message requis' },
        { status: 400 },
      );
    }

    // Get Supabase admin client
    const client = getSupabaseServerAdminClient();

    // Create request record
    const { data: requestRecord, error: requestError } = await client
      .from('requests')
      .insert({
        requester_type: 'family',
        requester_id: null, // Anonymous for public searches
        requester_contact: requesterInfo,
        patient_profile: patientProfile || {},
        location_preference:
          patientProfile?.location?.city ||
          patientProfile?.location?.region ||
          null,
        budget_min: patientProfile?.budget?.amount
          ? Math.floor(patientProfile.budget.amount * 0.8)
          : null,
        budget_max: patientProfile?.budget?.amount
          ? Math.ceil(patientProfile.budget.amount * 1.2)
          : null,
        urgency_level: patientProfile?.urgency?.level || 'normal',
        status: 'open',
      })
      .select()
      .single();

    if (requestError || !requestRecord) {
      console.error('Error creating request:', requestError);
      throw new Error('Erreur lors de la création de la demande');
    }

    // Create contact records for each RPA
    const contactPromises = rpaIds.map(async (rpaId: string) => {
      const { data: contact, error: contactError } = await client
        .from('contacts')
        .insert({
          request_id: requestRecord.id,
          rpa_id: rpaId,
          requester_id: null,
          contact_type: 'message',
          message: message,
          requester_phone: requesterInfo.phone || null,
          requester_email: requesterInfo.email,
        })
        .select()
        .single();

      if (contactError) {
        console.error('Error creating contact:', contactError);
        return null;
      }

      // TODO: Send email/SMS notification to RPA
      // For now, just log it
      console.log('Created contact for RPA:', rpaId);

      return contact;
    });

    const contacts = await Promise.all(contactPromises);
    const successfulContacts = contacts.filter((c) => c !== null);

    if (successfulContacts.length === 0) {
      throw new Error('Erreur lors de l\'envoi des messages');
    }

    // TODO: Send email notifications to RPAs
    // This will be implemented with the mailer integration

    return NextResponse.json({
      success: true,
      requestId: requestRecord.id,
      contactsCreated: successfulContacts.length,
      message: `Votre demande a été envoyée à ${successfulContacts.length} résidence(s)`,
    });
  } catch (error) {
    console.error('Error in contact submission:', error);

    return NextResponse.json(
      {
        error: 'Erreur serveur',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 },
    );
  }
}
