import { use } from 'react';

import { PageBody, PageHeader } from '@kit/ui/page';

import { loadRPADashboardData } from '../_lib/server/load-rpa-dashboard-data';
import { InquiriesList } from './_components/inquiries-list';

export const metadata = {
  title: 'Demandes - RPA Portal',
};

export default function InquiriesPage() {
  const data = use(loadRPADashboardData());

  if (!data.hasRPA) {
    return (
      <>
        <PageHeader
          title={'Demandes'}
          description={'Consultez vos demandes de contact'}
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
        title={'Demandes de contact'}
        description={'Gerez les demandes de familles et travailleurs sociaux'}
      />

      <PageBody>
        <InquiriesList inquiries={data.inquiries} />
      </PageBody>
    </>
  );
}
