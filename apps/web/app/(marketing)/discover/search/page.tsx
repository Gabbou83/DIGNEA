import { ConversationChat } from '../_components/conversation-chat';

export const metadata = {
  title: 'Recherche - DIGNÉA',
  description: 'Trouvez la résidence parfaite grâce à notre assistant conversationnel',
};

export default function SearchPage() {
  return (
    <div className="container py-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-3 text-3xl font-bold">
            Trouvons la résidence parfaite ensemble
          </h1>
          <p className="text-muted-foreground">
            Décrivez-moi vos besoins et je vous guiderai vers les meilleures
            options
          </p>
        </div>

        {/* Conversation Interface */}
        <ConversationChat />
      </div>
    </div>
  );
}
