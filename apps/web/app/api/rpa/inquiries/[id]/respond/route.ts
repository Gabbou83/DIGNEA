import { NextRequest, NextResponse } from 'next/server';

import { getMailer } from '@kit/mailers';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const client = getSupabaseServerClient();
    const params = await context.params;
    const contactId = params.id;

    // Verify authentication
    const {
      data: { user },
    } = await client.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Non authentifie' },
        { status: 401 },
      );
    }

    // Parse request body
    const body = await request.json();
    const { response } = body;

    if (!response || response.trim().length === 0) {
      return NextResponse.json(
        { error: 'La reponse ne peut pas etre vide' },
        { status: 400 },
      );
    }

    if (response.length > 1000) {
      return NextResponse.json(
        { error: 'La reponse ne peut pas depasser 1000 caracteres' },
        { status: 400 },
      );
    }

    // Get the contact and verify it belongs to this user's RPA
    const { data: contact, error: contactError } = await client
      .from('contacts')
      .select(
        `
        id,
        rpa_id,
        requester_email,
        requester_name,
        message,
        created_at,
        responded_at,
        rpas (
          id,
          name,
          k10_id,
          rpa_profiles (
            user_id
          )
        )
      `,
      )
      .eq('id', contactId)
      .single();

    if (contactError || !contact) {
      return NextResponse.json(
        { error: 'Demande introuvable' },
        { status: 404 },
      );
    }

    // Verify user owns this RPA
    const rpaProfile = (contact.rpas as any)?.rpa_profiles;
    const isOwner = Array.isArray(rpaProfile)
      ? rpaProfile.some((profile: any) => profile.user_id === user.id)
      : rpaProfile?.user_id === user.id;

    if (!isOwner) {
      return NextResponse.json(
        { error: 'Vous n\'avez pas l\'autorisation de repondre a cette demande' },
        { status: 403 },
      );
    }

    // Check if already responded
    if (contact.responded_at) {
      return NextResponse.json(
        { error: 'Vous avez deja repondu a cette demande' },
        { status: 400 },
      );
    }

    // Calculate response time in minutes
    const createdAt = new Date(contact.created_at);
    const now = new Date();
    const responseTimeMinutes = Math.round(
      (now.getTime() - createdAt.getTime()) / (1000 * 60),
    );

    // Update contact with response
    const { error: updateError } = await client
      .from('contacts')
      .update({
        response,
        responded_at: now.toISOString(),
        response_time_minutes: responseTimeMinutes,
      })
      .eq('id', contactId);

    if (updateError) {
      console.error('Error updating contact:', updateError);
      return NextResponse.json(
        { error: 'Erreur lors de l\'enregistrement de la reponse' },
        { status: 500 },
      );
    }

    // Send email notification to requester
    if (contact.requester_email) {
      try {
        const mailer = getMailer();
        const rpaName = (contact.rpas as any)?.name || 'la residence';

        await mailer.sendEmail({
          from: 'DIGNÉA <noreply@dignea.com>',
          to: contact.requester_email,
          subject: `Réponse de ${rpaName}`,
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <style>
                  body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                  }
                  .header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 30px;
                    border-radius: 8px 8px 0 0;
                    text-align: center;
                  }
                  .content {
                    background: #f9fafb;
                    padding: 30px;
                    border-radius: 0 0 8px 8px;
                  }
                  .rpa-name {
                    font-size: 24px;
                    font-weight: bold;
                    margin-bottom: 10px;
                  }
                  .response-box {
                    background: white;
                    padding: 20px;
                    border-left: 4px solid #667eea;
                    border-radius: 4px;
                    margin: 20px 0;
                  }
                  .your-message {
                    background: #f3f4f6;
                    padding: 15px;
                    border-radius: 4px;
                    margin: 20px 0;
                    font-size: 14px;
                  }
                  .footer {
                    text-align: center;
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #e5e7eb;
                    color: #6b7280;
                    font-size: 14px;
                  }
                  .button {
                    display: inline-block;
                    background: #667eea;
                    color: white;
                    padding: 12px 24px;
                    text-decoration: none;
                    border-radius: 6px;
                    margin-top: 20px;
                  }
                </style>
              </head>
              <body>
                <div class="header">
                  <div class="rpa-name">${rpaName}</div>
                  <p>Vous a répondu</p>
                </div>
                <div class="content">
                  <p>Bonjour${contact.requester_name ? ` ${contact.requester_name}` : ''},</p>

                  <p>Vous avez reçu une réponse à votre demande de contact via DIGNÉA.</p>

                  <div class="response-box">
                    <strong>Réponse de ${rpaName}:</strong>
                    <p style="margin-top: 10px;">${response.replace(/\n/g, '<br>')}</p>
                  </div>

                  <div class="your-message">
                    <strong>Votre message original:</strong>
                    <p style="margin-top: 8px; color: #6b7280;">${contact.message?.replace(/\n/g, '<br>') || 'Aucun message'}</p>
                  </div>

                  <p>Pour continuer la conversation, vous pouvez répondre directement à cet email ou contacter ${rpaName} par téléphone.</p>

                  <div class="footer">
                    <p>Cet email a été envoyé par DIGNÉA</p>
                    <p style="margin-top: 5px; font-size: 12px;">
                      La dignité qu'ils méritent - Connecter familles et résidences au Québec
                    </p>
                  </div>
                </div>
              </body>
            </html>
          `,
          text: `
${rpaName} vous a répondu

Bonjour${contact.requester_name ? ` ${contact.requester_name}` : ''},

Vous avez reçu une réponse à votre demande de contact via DIGNÉA.

Réponse de ${rpaName}:
${response}

Votre message original:
${contact.message || 'Aucun message'}

Pour continuer la conversation, vous pouvez répondre directement à cet email ou contacter ${rpaName} par téléphone.

---
Cet email a été envoyé par DIGNÉA
La dignité qu'ils méritent - Connecter familles et résidences au Québec
          `.trim(),
        });

        console.log(
          `✅ Email sent to ${contact.requester_email} for inquiry ${contactId}`,
        );
      } catch (emailError) {
        // Log but don't fail the request if email fails
        console.error('Error sending email:', emailError);
      }
    }

    // TODO: Send SMS notification if requester has phone number and SMS enabled
    // This will be implemented when we add phone collection to the contact form

    return NextResponse.json({
      success: true,
      message: 'Reponse envoyee avec succes',
    });
  } catch (error) {
    console.error('Error responding to inquiry:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 },
    );
  }
}
