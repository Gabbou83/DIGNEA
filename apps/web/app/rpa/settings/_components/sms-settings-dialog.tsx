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
import { Input } from '@kit/ui/input';
import { Switch } from '@kit/ui/switch';
import { toast } from '@kit/ui/sonner';

interface SmsSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentSettings: {
    sms_enabled: boolean;
    sms_phone: string | null;
    sms_daily_reminder: boolean;
  };
  onSuccess?: () => void;
}

export function SmsSettingsDialog({
  open,
  onOpenChange,
  currentSettings,
  onSuccess,
}: SmsSettingsDialogProps) {
  const [smsEnabled, setSmsEnabled] = useState(currentSettings.sms_enabled);
  const [smsPhone, setSmsPhone] = useState(currentSettings.sms_phone || '');
  const [dailyReminder, setDailyReminder] = useState(
    currentSettings.sms_daily_reminder,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validatePhoneNumber = (phone: string): boolean => {
    // Quebec phone format: (819) 555-1234 or 819-555-1234 or 8195551234
    const phoneRegex = /^(\+1)?[\s-]?\(?([0-9]{3})\)?[\s-]?([0-9]{3})[\s-]?([0-9]{4})$/;
    return phoneRegex.test(phone.trim());
  };

  const formatPhoneNumber = (phone: string): string => {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');

    // Remove leading 1 if present (country code)
    const cleaned = digits.startsWith('1') ? digits.slice(1) : digits;

    // Format as (XXX) XXX-XXXX
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }

    return phone;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate phone number if SMS is enabled
    if (smsEnabled && !smsPhone.trim()) {
      toast.error('Numero de telephone requis', {
        description: 'Veuillez entrer un numero de telephone valide',
      });
      return;
    }

    if (smsEnabled && !validatePhoneNumber(smsPhone)) {
      toast.error('Numero de telephone invalide', {
        description: 'Format attendu: (819) 555-1234 ou 819-555-1234',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const formattedPhone = smsEnabled ? formatPhoneNumber(smsPhone) : null;

      const response = await fetch('/api/rpa/settings/sms', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sms_enabled: smsEnabled,
          sms_phone: formattedPhone,
          sms_daily_reminder: dailyReminder,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la mise a jour');
      }

      toast.success('Parametres SMS mis a jour', {
        description: smsEnabled
          ? `SMS actifs pour le ${formattedPhone}`
          : 'SMS desactives',
      });

      onOpenChange(false);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error updating SMS settings:', error);
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
            <DialogTitle>Parametres SMS</DialogTitle>
            <DialogDescription>
              Gerez vos notifications par SMS pour les demandes et rappels
              quotidiens
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-6">
            {/* SMS Enable/Disable */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sms-enabled">Activer les SMS</Label>
                <p className="text-sm text-muted-foreground">
                  Recevoir des notifications par SMS
                </p>
              </div>
              <Switch
                id="sms-enabled"
                checked={smsEnabled}
                onCheckedChange={setSmsEnabled}
              />
            </div>

            {/* Phone Number */}
            {smsEnabled && (
              <div className="space-y-2">
                <Label htmlFor="phone">Numero de telephone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(819) 555-1234"
                  value={smsPhone}
                  onChange={(e) => setSmsPhone(e.target.value)}
                  required={smsEnabled}
                />
                <p className="text-sm text-muted-foreground">
                  Format: (819) 555-1234 ou 819-555-1234
                </p>
              </div>
            )}

            {/* Daily Reminder */}
            {smsEnabled && (
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="daily-reminder">Rappel quotidien</Label>
                  <p className="text-sm text-muted-foreground">
                    Recevoir un SMS chaque jour pour mettre a jour la
                    disponibilite
                  </p>
                </div>
                <Switch
                  id="daily-reminder"
                  checked={dailyReminder}
                  onCheckedChange={setDailyReminder}
                />
              </div>
            )}
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
