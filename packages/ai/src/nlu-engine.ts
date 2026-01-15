/**
 * DIGNEA NLU Engine - Claude API Integration
 * Handles natural language understanding for patient profile extraction
 */

import 'server-only';

import Anthropic from '@anthropic-ai/sdk';
import type {
  AIError,
  ConversationContext,
  NLUExtractionResult,
  NLUGenerationOptions,
  PatientProfile,
} from './types';

export class NLUEngine {
  private client: Anthropic;
  private model = 'claude-3-5-haiku-latest';

  constructor(apiKey?: string) {
    this.client = new Anthropic({
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY,
    });
  }

  /**
   * Extract patient profile entities from a natural language message
   */
  async extractEntities(
    userMessage: string,
    context?: ConversationContext,
  ): Promise<NLUExtractionResult> {
    try {
      const { ENTITY_EXTRACTION_PROMPT } = await import(
        './prompts/entity-extraction'
      );

      // Build conversation history for context
      const conversationHistory =
        context?.messages?.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })) || [];

      // Call Claude API for entity extraction
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 2000,
        system: ENTITY_EXTRACTION_PROMPT,
        messages: [
          ...conversationHistory,
          {
            role: 'user',
            content: `Extract patient profile entities from this message:\n\n${userMessage}\n\nReturn ONLY a valid JSON object with the extracted entities.`,
          },
        ],
      });

      // Parse the response
      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      // Extract JSON from response (Claude might wrap it in markdown)
      let jsonText = content.text.trim();

      // Remove markdown code blocks if present
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.slice(7);
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.slice(3);
      }

      if (jsonText.endsWith('```')) {
        jsonText = jsonText.slice(0, -3);
      }

      const extractedEntities: PatientProfile = JSON.parse(jsonText.trim());

      // Merge with existing profile if context provided
      const mergedProfile: PatientProfile = {
        ...context?.extracted_entities,
        ...extractedEntities,
      };

      // Determine missing critical fields
      const missingFields: string[] = [];
      if (!mergedProfile.age) missingFields.push('age');
      if (!mergedProfile.budget?.amount) missingFields.push('budget');
      if (!mergedProfile.location?.city && !mergedProfile.location?.region) {
        missingFields.push('location');
      }

      // Calculate confidence based on extracted fields
      const totalFields = 4; // age, budget, location, autonomy/conditions
      const extractedCount =
        (mergedProfile.age ? 1 : 0) +
        (mergedProfile.budget?.amount ? 1 : 0) +
        (mergedProfile.location?.city || mergedProfile.location?.region
          ? 1
          : 0) +
        (mergedProfile.autonomy || mergedProfile.conditions ? 1 : 0);

      const confidence = extractedCount / totalFields;

      return {
        entities: mergedProfile,
        confidence,
        missing_fields: missingFields,
        clarification_needed: missingFields.length > 0 ? [] : undefined,
      };
    } catch (error) {
      throw this.handleError(error, 'EXTRACTION_FAILED');
    }
  }

  /**
   * Generate an empathetic response based on extracted entities
   */
  async generateResponse(
    entities: PatientProfile,
    options?: NLUGenerationOptions,
  ): Promise<string> {
    try {
      const { EMPATHIC_RESPONSE_PROMPT } = await import(
        './prompts/entity-extraction'
      );

      const missingFields = [];
      if (!entities.age) missingFields.push('age');
      if (!entities.budget?.amount) missingFields.push('budget');
      if (!entities.location?.city && !entities.location?.region) {
        missingFields.push('location');
      }

      // Build context about extracted entities
      const extractedSummary = `
Extracted information:
- Age: ${entities.age || 'Not provided'}
- Budget: ${entities.budget?.amount ? `${entities.budget.amount}$/mois` : 'Not provided'}
- Location: ${entities.location?.city || entities.location?.region || 'Not provided'}
- Autonomy: ${entities.autonomy || 'Not specified'}
- Conditions: ${entities.conditions ? JSON.stringify(entities.conditions) : 'None mentioned'}
- Urgency: ${entities.urgency?.level || 'normal'}

Missing critical fields: ${missingFields.length > 0 ? missingFields.join(', ') : 'None'}
`;

      const responsePrompt =
        missingFields.length > 0
          ? `Generate an empathetic response asking for the missing information: ${missingFields.join(', ')}. Ask 1-2 key questions maximum. Keep it conversational and warm.`
          : `Generate an empathetic response confirming you have all the information needed and are ready to show matching residences. Express confidence and reassurance.`;

      // Call Claude API for response generation
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 500,
        system: EMPATHIC_RESPONSE_PROMPT,
        messages: [
          {
            role: 'user',
            content: `${extractedSummary}\n\n${responsePrompt}`,
          },
        ],
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      return content.text.trim();
    } catch (error) {
      throw this.handleError(error, 'GENERATION_FAILED');
    }
  }

  /**
   * Generate clarification questions for missing or ambiguous information
   */
  async generateClarificationQuestions(
    currentProfile: PatientProfile,
  ): Promise<string[]> {
    // TODO: Implement clarification question generation
    throw new Error('Not implemented yet');
  }

  /**
   * Stream a conversational response (for real-time UI)
   */
  async *streamResponse(
    userMessage: string,
    context: ConversationContext,
  ): AsyncGenerator<string, void, unknown> {
    try {
      // TODO: Implement streaming response
      // Use Claude's streaming API for real-time responses
      yield 'Streaming not implemented yet';
    } catch (error) {
      throw this.handleError(error, 'GENERATION_FAILED');
    }
  }

  private handleError(error: unknown, code: AIError['code']): AIError {
    const { AIError } = require('./types') as typeof import('./types');

    if (error instanceof Anthropic.APIError) {
      if (error.status === 429) {
        return new AIError('Rate limit exceeded', 'RATE_LIMIT_EXCEEDED', error);
      }
      return new AIError('Claude API error', 'API_ERROR', error);
    }

    return new AIError('Unexpected error', code, error);
  }
}
