import { ConversationChat } from '../_components/conversation-chat';

export const metadata = {
  title: 'Recherche de résidence - DIGNÉA',
  description:
    'Recherchez la résidence parfaite pour votre proche avec notre assistant conversationnel intelligent.',
};

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Recherche de résidence</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Décrivez vos besoins et nous trouverons les meilleures options
              </p>
            </div>
            <a
              href="/discover"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ← Retour
            </a>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <ConversationChat />
        </div>
      </div>
    </div>
  );
}
