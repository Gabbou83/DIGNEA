'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@kit/ui/button';
import { Textarea } from '@kit/ui/textarea';
import { toast } from '@kit/ui/sonner';
import { Send, Loader2 } from 'lucide-react';

import { ChatMessage } from './chat-message';
import { ResultsList } from './results-list';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface PatientProfile {
  age?: number;
  conditions?: string[];
  care_level?: string;
  budget?: number;
  location?: string;
  urgency?: string;
  mobility?: string;
  preferences?: string[];
}

export function ConversationChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        'Bonjour! Je suis ici pour vous aider à trouver la résidence parfaite pour votre proche. Pour commencer, pouvez-vous me parler un peu de la personne que vous cherchez à placer? Par exemple, son âge, ses besoins de soins, et votre budget approximatif.',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [patientProfile, setPatientProfile] = useState<PatientProfile>({});
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [matches, setMatches] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || isLoading) {
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Call API to extract entities and get response
      const response = await fetch('/api/conversation/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userMessage: userMessage.content,
          context: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          currentProfile: patientProfile,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors du traitement de votre message');
      }

      const data = await response.json();

      // Update patient profile with extracted entities
      if (data.extractedProfile) {
        setPatientProfile((prev) => ({
          ...prev,
          ...data.extractedProfile,
        }));
      }

      // Check if profile is complete
      if (data.isComplete) {
        setIsProfileComplete(true);
      }

      // Add assistant response
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error in conversation:', error);
      toast.error('Erreur', {
        description:
          error instanceof Error ? error.message : 'Erreur de communication',
      });

      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          'Désolé, j\'ai rencontré un problème technique. Pouvez-vous reformuler votre message?',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowResults = async () => {
    setIsSearching(true);

    try {
      // Call matching API
      const response = await fetch('/api/search/match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientProfile: patientProfile,
          limit: 10,
          requireAvailability: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la recherche');
      }

      const data = await response.json();

      setMatches(data.matches || []);
      setShowResults(true);

      toast.success('Résultats trouvés!', {
        description: `${data.matches?.length || 0} résidence(s) compatible(s)`,
      });
    } catch (error) {
      console.error('Error searching:', error);
      toast.error('Erreur', {
        description:
          error instanceof Error
            ? error.message
            : 'Erreur lors de la recherche',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleContactMultiple = (rpaIds: string[]) => {
    // TODO: Implement contact form modal
    console.log('Contact RPAs:', rpaIds);
    toast.info('Formulaire de contact', {
      description: `Fonctionnalité en développement pour contacter ${rpaIds.length} résidence(s)`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Conversation Interface */}
      {!showResults && (
        <div className="flex flex-col rounded-lg border bg-card">
          {/* Messages Container */}
          <div className="flex-1 space-y-4 overflow-y-auto p-6 max-h-[600px]">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">L&apos;assistant réfléchit...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

      {/* Profile Completeness Indicator */}
      {Object.keys(patientProfile).length > 0 && (
        <div className="border-t bg-muted/50 p-4">
          <div className="text-sm">
            <p className="mb-2 font-medium">Informations collectées:</p>
            <div className="flex flex-wrap gap-2">
              {patientProfile.age && (
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs">
                  Âge: {patientProfile.age} ans
                </span>
              )}
              {patientProfile.budget && (
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs">
                  Budget: {patientProfile.budget}$/mois
                </span>
              )}
              {patientProfile.location && (
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs">
                  Région: {patientProfile.location}
                </span>
              )}
              {patientProfile.care_level && (
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs">
                  Soins: {patientProfile.care_level}
                </span>
              )}
            </div>

            {isProfileComplete && (
              <Button
                className="mt-4 w-full"
                onClick={handleShowResults}
                size="sm"
                disabled={isSearching}
              >
                {isSearching ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Recherche en cours...
                  </>
                ) : (
                  'Afficher les résidences compatibles'
                )}
              </Button>
            )}
          </div>
        </div>
      )}

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="border-t p-4">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Décrivez vos besoins... (Ex: Ma mère a 82 ans, besoin d'aide quotidienne, budget 2500$/mois)"
                className="min-h-[60px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isLoading}
                className="h-[60px] w-[60px]"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Appuyez sur Entrée pour envoyer, Shift+Entrée pour une nouvelle
              ligne
            </p>
          </form>
        </div>
      )}

      {/* Results Display */}
      {showResults && (
        <div className="space-y-4">
          {/* Back to conversation button */}
          <Button variant="outline" onClick={() => setShowResults(false)}>
            ← Retour à la conversation
          </Button>

          {/* Results list */}
          {isSearching ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                <p className="text-lg font-medium">Recherche en cours...</p>
                <p className="text-sm text-muted-foreground">
                  Analyse de vos critères et recherche des meilleures
                  résidences
                </p>
              </div>
            </div>
          ) : (
            <ResultsList
              matches={matches}
              onContactMultiple={handleContactMultiple}
              allowMultiSelect={true}
            />
          )}
        </div>
      )}
    </div>
  );
}
