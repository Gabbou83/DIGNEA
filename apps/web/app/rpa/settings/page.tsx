import { use } from 'react';

import { PageBody, PageHeader } from '@kit/ui/page';

import { loadRPADashboardData } from '../_lib/server/load-rpa-dashboard-data';
import { SettingsContent } from './_components/settings-content';

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
        <SettingsContent
          rpa={{
            name: data.rpa!.name,
            k10_id: data.rpa!.k10_id,
          }}
          rpaProfile={{
            sms_enabled: data.rpaProfile!.sms_enabled,
            sms_phone: data.rpaProfile!.sms_phone,
            sms_daily_reminder: data.rpaProfile!.sms_daily_reminder,
          }}
        />
      </PageBody>
    </>
  );
}
