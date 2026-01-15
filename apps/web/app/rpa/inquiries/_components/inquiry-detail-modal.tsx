'use client';

import { useState } from 'react';

import { Button } from '@kit/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@kit/ui/dialog';
import { Label } from '@kit/ui/label';
import { toast } from '@kit/ui/sonner';
import { Textarea } from '@kit/ui/textarea';

interface Inquiry {
  id: string;
  requester_email: string | null;
  requester_name?: string | null;
  message: string | null;
  created_at: string;
  responded_at: string | null;
}

interface InquiryDetailModalProps {
  inquiry: Inquiry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function InquiryDetailModal({
  inquiry,
  open,
  onOpenChange,
  onSuccess,
}: InquiryDetailModalProps) {
  const [response, setResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inquiry) return;

    if (!response || response.trim().length === 0) {
      toast.error('Veuillez entrer une reponse');
      return;
    }

    if (response.length > 1000) {
      toast.error('La reponse ne peut pas depasser 1000 caracteres');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/rpa/inquiries/${inquiry.id}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ response }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur lors de l\'envoi de la reponse');
      }

      toast.success('Reponse envoyee', {
        description: 'La famille a recu votre reponse par email',
      });

      setResponse('');
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Error responding to inquiry:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Une erreur est survenue',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!inquiry) return null;

  const formattedDate = new Date(inquiry.created_at).toLocaleDateString(
    'fr-CA',
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    },
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Repondre a la demande</DialogTitle>
          <DialogDescription>
            Envoyez une reponse a {inquiry.requester_email || 'ce contact'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Inquiry Details */}
          <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                De:
              </p>
              <p className="font-medium">
                {inquiry.requester_name || inquiry.requester_email || 'Contact anonyme'}
              </p>
              {inquiry.requester_name && inquiry.requester_email && (
                <p className="text-sm text-muted-foreground">
                  {inquiry.requester_email}
                </p>
              )}
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Date:
              </p>
              <p className="text-sm">{formattedDate}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Message:
              </p>
              <p className="mt-1 whitespace-pre-wrap">
                {inquiry.message || 'Aucun message'}
              </p>
            </div>
          </div>

          {/* Response Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="response">Votre reponse</Label>
              <Textarea
                id="response"
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Ecrivez votre reponse ici..."
                rows={6}
                maxLength={1000}
                className="resize-none"
                disabled={isSubmitting}
              />
              <p className="text-sm text-muted-foreground text-right">
                {response.length}/1000 caracteres
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Envoi en cours...' : 'Envoyer la reponse'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
