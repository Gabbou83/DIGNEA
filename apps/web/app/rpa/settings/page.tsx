import { use } from 'react';

import { PageBody, PageHeader } from '@kit/ui/page';

import { loadRPADashboardData } from '../_lib/server/load-rpa-dashboard-data';

export const metadata = {
  title: 'Parametres - RPA Portal',
};

export default function SettingsPage() {
  const data = use(loadRPADashboardData());

  if (!data.hasRPA) {
    return (
      <>
        <PageHeader title={'Parametres'} description={'Gerez vos parametres'} />
        <PageBody>
          <p className="text-muted-foreground">
            Vous devez d'abord configurer votre residence.
          </p>
        </PageBody>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={'Parametres'}
        description={'Configurez votre residence et vos preferences'}
      />

      <PageBody>
        <div className="mx-auto max-w-2xl space-y-6">
          {/* RPA Information */}
          <div className="rounded-lg border bg-card p-6">
            <h3 className="mb-4 text-lg font-semibold">
              Informations de la residence
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Nom</p>
                <p className="font-medium">{data.rpa?.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Code K10</p>
                <p className="font-medium">{data.rpa?.k10_id}</p>
              </div>
            </div>
          </div>

          {/* SMS Settings */}
          <div className="rounded-lg border bg-card p-6">
            <h3 className="mb-4 text-lg font-semibold">
              Notifications SMS
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Rappels quotidiens</p>
                  <p className="text-sm text-muted-foreground">
                    Recevez un SMS chaque matin pour mettre a jour vos disponibilites
                  </p>
                </div>
                <div className="text-sm">
                  {data.rpaProfile?.sms_enabled ? (
                    <span className="text-green-600">Active</span>
                  ) : (
                    <span className="text-muted-foreground">Desactive</span>
                  )}
                </div>
              </div>
              {data.rpaProfile?.sms_phone && (
                <div>
                  <p className="text-sm text-muted-foreground">
                    Numero de telephone
                  </p>
                  <p className="font-medium">{data.rpaProfile.sms_phone}</p>
                </div>
              )}
              <button className="w-full rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
                Modifier les parametres SMS
              </button>
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
            <button className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90">
              Desactiver la residence
            </button>
          </div>
        </div>
      </PageBody>
    </>
  );
}
