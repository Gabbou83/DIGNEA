'use client';

import { useState } from 'react';

import { Button } from '@kit/ui/button';

import { RPACard } from './rpa-card';

interface RPAMatch {
  rpa_id: string;
  score: number;
  reasons: string[];
  availability: {
    units_available: number;
    last_updated: Date;
  };
  rpa_info: {
    name: string;
    city: string;
    region: string;
    pricing_min: number | null;
    pricing_max: number | null;
    rating: number | null;
  };
}

interface ResultsListProps {
  matches: RPAMatch[];
  onContactMultiple?: (rpaIds: string[]) => void;
  allowMultiSelect?: boolean;
}

export function ResultsList({
  matches,
  onContactMultiple,
  allowMultiSelect = true,
}: ResultsListProps) {
  const [selectedRpas, setSelectedRpas] = useState<Set<string>>(new Set());

  const handleToggleSelect = (rpaId: string) => {
    setSelectedRpas((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(rpaId)) {
        newSet.delete(rpaId);
      } else {
        // Limit to 6 selections
        if (newSet.size >= 6) {
          return prev;
        }
        newSet.add(rpaId);
      }
      return newSet;
    });
  };

  const handleContactSingle = (rpaId: string) => {
    // For single contact, just add to selection and trigger multi-contact
    if (onContactMultiple) {
      onContactMultiple([rpaId]);
    }
  };

  const handleContactSelected = () => {
    if (onContactMultiple && selectedRpas.size > 0) {
      onContactMultiple(Array.from(selectedRpas));
    }
  };

  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <svg
            className="h-12 w-12 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-2">
          Aucune résidence trouvée
        </h3>
        <p className="text-sm text-muted-foreground max-w-md">
          Nous n'avons pas trouvé de résidences correspondant exactement à vos
          critères. Essayez d'ajuster vos préférences ou élargir votre zone de
          recherche.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with results count and multi-select actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Résultats de recherche</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {matches.length} résidence{matches.length > 1 ? 's' : ''} trouvée
            {matches.length > 1 ? 's' : ''}
            {selectedRpas.size > 0 &&
              ` · ${selectedRpas.size} sélectionnée${selectedRpas.size > 1 ? 's' : ''}`}
          </p>
        </div>

        {allowMultiSelect && selectedRpas.size > 0 && onContactMultiple && (
          <Button onClick={handleContactSelected} size="lg">
            Contacter {selectedRpas.size} résidence
            {selectedRpas.size > 1 ? 's' : ''}
          </Button>
        )}
      </div>

      {/* Info banner for multi-select */}
      {allowMultiSelect && selectedRpas.size === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            💡 <strong>Conseil:</strong> Vous pouvez sélectionner jusqu'à 6
            résidences et les contacter toutes en même temps pour comparer les
            offres.
          </p>
        </div>
      )}

      {/* Results grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {matches.map((match) => (
          <RPACard
            key={match.rpa_id}
            match={match}
            onContact={handleContactSingle}
            selected={selectedRpas.has(match.rpa_id)}
            onToggleSelect={allowMultiSelect ? handleToggleSelect : undefined}
          />
        ))}
      </div>

      {/* Footer info */}
      {matches.length >= 10 && (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">
            Affichage des 10 meilleurs résultats. Affinez vos critères pour des
            résultats plus précis.
          </p>
        </div>
      )}
    </div>
  );
}
