'use client';

import { useState } from 'react';
import { Button } from '@kit/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@kit/ui/dialog';
import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';
import { Textarea } from '@kit/ui/textarea';
import { toast } from '@kit/ui/sonner';
import { Loader2, X } from 'lucide-react';

interface ContactFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRpas: Array<{
    rpa_id: string;
    name: string;
    city: string;
  }>;
  patientProfile: any;
}

export function ContactFormModal({
  open,
  onOpenChange,
  selectedRpas,
  patientProfile,
}: ContactFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  // Generate default message from patient profile
  const getDefaultMessage = () => {
    const parts = ['Bonjour,', '', 'Je cherche une place en résidence pour'];

    if (patientProfile.relation) {
      parts.push(`${patientProfile.relation === 'mother' ? 'ma mère' : patientProfile.relation === 'father' ? 'mon père' : 'un proche'}`);
    } else {
      parts.push('un proche');
    }

    if (patientProfile.age) {
      parts.push(`de ${patientProfile.age} ans.`);
    }

    parts.push('');

    if (patientProfile.autonomy) {
      const autonomyText =
        patientProfile.autonomy === 'loss_of_independence'
          ? 'Perte d\'autonomie nécessitant de l\'aide quotidienne.'
          : patientProfile.autonomy === 'semi_autonomous'
            ? 'Semi-autonome, besoin d\'assistance partielle.'
            : 'Autonome.';
      parts.push(autonomyText);
    }

    if (patientProfile.budget?.amount) {
      parts.push(`Budget: ${patientProfile.budget.amount}$/mois.`);
    }

    if (patientProfile.location?.city || patientProfile.location?.region) {
      parts.push(
        `Région recherchée: ${patientProfile.location?.city || patientProfile.location?.region}.`,
      );
    }

    parts.push('');
    parts.push('Avez-vous de la disponibilité?');
    parts.push('');
    parts.push('Merci de me contacter pour discuter des options.');

    return parts.join('\n');
  };

  // Set default message when modal opens
  useState(() => {
    if (open && !formData.message) {
      setFormData((prev) => ({
        ...prev,
        message: getDefaultMessage(),
      }));
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error('Nom requis', {
        description: 'Veuillez entrer votre nom',
      });
      return;
    }

    if (!formData.email.trim()) {
      toast.error('Courriel requis', {
        description: 'Veuillez entrer votre courriel',
      });
      return;
    }

    if (!formData.message.trim()) {
      toast.error('Message requis', {
        description: 'Veuillez entrer un message',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rpaIds: selectedRpas.map((rpa) => rpa.rpa_id),
          requesterInfo: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
          },
          message: formData.message,
          patientProfile: patientProfile,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi');
      }

      const data = await response.json();

      toast.success('Message envoyé!', {
        description: `Votre demande a été envoyée à ${selectedRpas.length} résidence(s). Vous recevrez une réponse par courriel.`,
      });

      // Reset form and close
      setFormData({ name: '', email: '', phone: '', message: '' });
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting contact:', error);
      toast.error('Erreur', {
        description:
          error instanceof Error ? error.message : 'Erreur lors de l\'envoi',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Contacter les résidences</DialogTitle>
          <DialogDescription>
            Votre message sera envoyé à {selectedRpas.length} résidence
            {selectedRpas.length > 1 ? 's' : ''}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Selected RPAs List */}
          <div>
            <Label className="text-sm font-medium mb-2 block">
              Résidences sélectionnées:
            </Label>
            <div className="space-y-2">
              {selectedRpas.map((rpa) => (
                <div
                  key={rpa.rpa_id}
                  className="flex items-center gap-2 bg-muted/50 rounded-md px-3 py-2"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{rpa.name}</p>
                    <p className="text-xs text-muted-foreground">{rpa.city}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid gap-4">
            <div>
              <Label htmlFor="name">
                Votre nom <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Jean Tremblay"
                required
              />
            </div>

            <div>
              <Label htmlFor="email">
                Votre courriel <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="jean.tremblay@email.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="phone">Votre téléphone (optionnel)</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="(819) 555-1234"
              />
            </div>
          </div>

          {/* Message */}
          <div>
            <Label htmlFor="message">
              Votre message <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              placeholder="Décrivez vos besoins..."
              className="min-h-[200px]"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Ce message a été pré-rempli selon vos besoins. Vous pouvez le
              modifier.
            </p>
          </div>

          {/* Footer */}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                `Envoyer à ${selectedRpas.length} résidence${selectedRpas.length > 1 ? 's' : ''}`
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
