import { use } from 'react';

import { PageBody, PageHeader } from '@kit/ui/page';

import { loadRPADashboardData } from '../_lib/server/load-rpa-dashboard-data';
import { AvailabilityUpdateForm } from './_components/availability-update-form';

export const metadata = {
  title: 'Disponibilites - RPA Portal',
};

export default function AvailabilityPage() {
  const data = use(loadRPADashboardData());

  if (!data.hasRPA) {
    return (
      <>
        <PageHeader
          title={'Disponibilites'}
          description={'Gerez vos disponibilites'}
        />
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
        title={'Disponibilites'}
        description={'Mettez a jour le nombre d\'unites disponibles'}
      />

      <PageBody>
        <div className="mx-auto max-w-2xl">
          <AvailabilityUpdateForm
            rpaId={data.rpa!.id}
            currentAvailability={data.availability?.units_available ?? null}
            lastUpdate={data.availability?.reported_at ?? null}
          />
        </div>
      </PageBody>
    </>
  );
}
