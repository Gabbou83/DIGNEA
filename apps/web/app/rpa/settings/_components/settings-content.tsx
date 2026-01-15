'use client';

import { useState } from 'react';

import { Button } from '@kit/ui/button';

import { DeactivateDialog } from './deactivate-dialog';
import { SmsSettingsDialog } from './sms-settings-dialog';

interface SettingsContentProps {
  rpa: {
    name: string;
    k10_id: string;
  };
  rpaProfile: {
    sms_enabled: boolean;
    sms_phone: string | null;
    sms_daily_reminder: boolean;
  };
}

export function SettingsContent({ rpa, rpaProfile }: SettingsContentProps) {
  const [isSmsDialogOpen, setIsSmsDialogOpen] = useState(false);
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false);

  const handleSmsSuccess = () => {
    // Refresh the page to show updated data
    window.location.reload();
  };

  const handleDeactivateSuccess = () => {
    // Redirect to dashboard after deactivation
    window.location.href = '/rpa';
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* RPA Information */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="mb-4 text-lg font-semibold">
          Informations de la residence
        </h3>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground">Nom</p>
            <p className="font-medium">{rpa.name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Code K10</p>
            <p className="font-medium">{rpa.k10_id}</p>
          </div>
        </div>
      </div>

      {/* SMS Settings */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="mb-4 text-lg font-semibold">Notifications SMS</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Rappels quotidiens</p>
              <p className="text-sm text-muted-foreground">
                Recevez un SMS chaque matin pour mettre a jour vos
                disponibilites
              </p>
            </div>
            <div className="text-sm">
              {rpaProfile.sms_enabled ? (
                <span className="text-green-600">Active</span>
              ) : (
                <span className="text-muted-foreground">Desactive</span>
              )}
            </div>
          </div>
          {rpaProfile.sms_phone && (
            <div>
              <p className="text-sm text-muted-foreground">
                Numero de telephone
              </p>
              <p className="font-medium">{rpaProfile.sms_phone}</p>
            </div>
          )}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setIsSmsDialogOpen(true)}
          >
            Modifier les parametres SMS
          </Button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-lg border border-destructive/50 bg-card p-6">
        <h3 className="mb-4 text-lg font-semibold text-destructive">
          Zone de danger
        </h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Actions irreversibles concernant votre residence
        </p>
        <Button
          variant="destructive"
          onClick={() => setIsDeactivateDialogOpen(true)}
        >
          Desactiver la residence
        </Button>
      </div>

      {/* SMS Settings Dialog */}
      <SmsSettingsDialog
        open={isSmsDialogOpen}
        onOpenChange={setIsSmsDialogOpen}
        currentSettings={{
          sms_enabled: rpaProfile.sms_enabled,
          sms_phone: rpaProfile.sms_phone,
          sms_daily_reminder: rpaProfile.sms_daily_reminder,
        }}
        onSuccess={handleSmsSuccess}
      />

      {/* Deactivate Dialog */}
      <DeactivateDialog
        open={isDeactivateDialogOpen}
        onOpenChange={setIsDeactivateDialogOpen}
        rpaName={rpa.name}
        onSuccess={handleDeactivateSuccess}
      />
    </div>
  );
}
