'use client';

import { useState } from 'react';

import { InquiryDetailModal } from './inquiry-detail-modal';

interface Inquiry {
  id: string;
  requester_email: string | null;
  requester_name?: string | null;
  message: string | null;
  created_at: string;
  responded_at: string | null;
}

interface InquiriesListProps {
  inquiries: Inquiry[];
  onRefresh?: () => void;
}

export function InquiriesList({ inquiries, onRefresh }: InquiriesListProps) {
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setIsModalOpen(true);
  };

  const handleSuccess = () => {
    // Refresh the page to get updated data
    if (onRefresh) {
      onRefresh();
    } else {
      window.location.reload();
    }
  };

  if (inquiries.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-6">
        <div className="py-12 text-center">
          <p className="text-muted-foreground">
            Aucune demande pour le moment
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Les demandes de contact apparaitront ici
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border bg-card p-6">
        <div className="space-y-4">
          {inquiries.map((inquiry) => (
            <div
              key={inquiry.id}
              className="flex items-start justify-between rounded-md border p-4 hover:bg-accent/50 transition-colors"
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
                  {inquiry.responded_at && (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                      Repondu
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {inquiry.message || 'Pas de message'}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {inquiry.created_at
                    ? new Date(inquiry.created_at).toLocaleDateString('fr-CA', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Date inconnue'}
                </p>
              </div>
              {!inquiry.responded_at && (
                <button
                  onClick={() => handleOpenModal(inquiry)}
                  className="ml-4 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Repondre
                </button>
              )}
              {inquiry.responded_at && (
                <button
                  onClick={() => handleOpenModal(inquiry)}
                  className="ml-4 rounded-md border px-4 py-2 text-sm hover:bg-accent transition-colors"
                >
                  Voir details
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <InquiryDetailModal
        inquiry={selectedInquiry}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSuccess={handleSuccess}
      />
    </>
  );
}
