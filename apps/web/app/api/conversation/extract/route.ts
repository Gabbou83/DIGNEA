import { NextRequest, NextResponse } from 'next/server';

import { NLUEngine } from '@kit/ai/nlu-engine';
import type { ConversationContext, PatientProfile } from '@kit/ai/types';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { userMessage, context, currentProfile } = body;

    if (!userMessage || userMessage.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message utilisateur requis' },
        { status: 400 },
      );
    }

    // Initialize NLU engine
    const nluEngine = new NLUEngine();

    // Build conversation context
    const conversationContext: ConversationContext = {
      messages: context || [],
      extracted_entities: currentProfile,
    };

    // Extract entities from user message
    const extractionResult = await nluEngine.extractEntities(
      userMessage,
      conversationContext,
    );

    // Generate empathetic response
    const response = await nluEngine.generateResponse(
      extractionResult.entities,
    );

    // Determine if profile is complete enough to show results
    const isComplete =
      extractionResult.confidence >= 0.75 &&
      extractionResult.missing_fields.length === 0;

    return NextResponse.json({
      extractedProfile: extractionResult.entities,
      response: response,
      confidence: extractionResult.confidence,
      missingFields: extractionResult.missing_fields,
      isComplete: isComplete,
    });
  } catch (error) {
    console.error('Error in conversation extraction:', error);

    return NextResponse.json(
      {
        error: 'Erreur serveur',
        details:
          error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 },
    );
  }
}
