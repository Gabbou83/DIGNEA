import { use } from 'react';

import { PageBody, PageHeader } from '@kit/ui/page';

import { loadRPADashboardData } from '../_lib/server/load-rpa-dashboard-data';

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
        <div className="rounded-lg border bg-card p-6">
          {data.inquiries.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">
                Aucune demande pour le moment
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Les demandes de contact apparaitront ici
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.inquiries.map((inquiry) => (
                <div
                  key={inquiry.id}
                  className="flex items-start justify-between rounded-md border p-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {inquiry.requester_email || 'Contact anonyme'}
                      </p>
                      {!inquiry.responded_at && (
                        <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                          Nouveau
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {inquiry.message || 'Pas de message'}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {inquiry.created_at ? new Date(inquiry.created_at).toLocaleDateString('fr-CA', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      }) : 'Date inconnue'}
                    </p>
                  </div>
                  {!inquiry.responded_at && (
                    <button className="ml-4 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90">
                      Repondre
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </PageBody>
    </>
  );
}
