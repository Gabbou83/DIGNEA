'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@kit/ui/dialog';
import { Button } from '@kit/ui/button';
import { Label } from '@kit/ui/label';
import { Textarea } from '@kit/ui/textarea';
import { toast } from '@kit/ui/sonner';
import { AlertTriangle } from 'lucide-react';

interface DeactivateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rpaName: string;
  onSuccess?: () => void;
}

export function DeactivateDialog({
  open,
  onOpenChange,
  rpaName,
  onSuccess,
}: DeactivateDialogProps) {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/rpa/settings/deactivate', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: reason.trim() || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la desactivation');
      }

      toast.success('Residence desactivee', {
        description:
          'Votre residence ne recevra plus de nouvelles demandes de contact',
      });

      onOpenChange(false);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error deactivating residence:', error);
      toast.error('Erreur', {
        description:
          error instanceof Error ? error.message : 'Erreur serveur',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-destructive/10 p-2">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <DialogTitle>Desactiver la residence</DialogTitle>
              </div>
            </div>
            <DialogDescription>
              Cette action aura les consequences suivantes:
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-6">
            {/* Warning List */}
            <div className="space-y-2 rounded-lg border border-destructive/50 bg-destructive/5 p-4">
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-destructive">•</span>
                  <span>
                    Votre residence ne sera <strong>plus visible</strong> dans
                    les resultats de recherche
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive">•</span>
                  <span>
                    Vous ne recevrez <strong>plus de nouvelles demandes</strong>
                    de contact
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive">•</span>
                  <span>
                    Les demandes existantes seront{' '}
                    <strong>toujours accessibles</strong> mais marquees comme
                    desactivees
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive">•</span>
                  <span>
                    Les rappels SMS quotidiens seront{' '}
                    <strong>automatiquement desactives</strong>
                  </span>
                </li>
              </ul>
            </div>

            {/* RPA Name Confirmation */}
            <div className="rounded-lg border bg-muted/50 p-4">
              <p className="text-sm">
                Vous etes sur le point de desactiver:{' '}
                <strong>{rpaName}</strong>
              </p>
            </div>

            {/* Optional Reason */}
            <div className="space-y-2">
              <Label htmlFor="reason">
                Raison de la desactivation{' '}
                <span className="text-muted-foreground">(optionnel)</span>
              </Label>
              <Textarea
                id="reason"
                placeholder="Ex: Fermeture temporaire pour renovations, plus de disponibilites..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">
                {reason.length}/500 caracteres
              </p>
            </div>

            {/* Reactivation Note */}
            <div className="rounded-lg border bg-blue-50 p-4 dark:bg-blue-950/20">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>Note:</strong> Vous pourrez reactiver votre residence a
                tout moment en contactant le support DIGNEA.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Desactivation...' : 'Confirmer la desactivation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
