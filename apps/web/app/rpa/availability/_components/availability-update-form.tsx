'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { Button } from '@kit/ui/button';
import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';

export function AvailabilityUpdateForm({
  rpaId,
  currentAvailability,
  lastUpdate,
}: {
  rpaId: string;
  currentAvailability: number | null;
  lastUpdate: string | null;
}) {
  const router = useRouter();
  const [units, setUnits] = useState(currentAvailability?.toString() ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lastUpdateDate = lastUpdate
    ? new Date(lastUpdate).toLocaleDateString('fr-CA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const unitsNumber = parseInt(units, 10);

    if (isNaN(unitsNumber) || unitsNumber < 0 || unitsNumber > 99) {
      setError('Veuillez entrer un nombre entre 0 et 99');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/rpa/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rpaId,
          units: unitsNumber,
          source: 'web',
        }),
      });

      if (!response.ok) {
        throw new Error('Echec de la mise a jour');
      }

      router.refresh();
      router.push('/rpa/dashboard');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Une erreur est survenue',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-lg border bg-card p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="units">Nombre d'unites disponibles</Label>
          <Input
            id="units"
            type="number"
            min="0"
            max="99"
            value={units}
            onChange={(e) => setUnits(e.target.value)}
            placeholder="Ex: 5"
            className="text-lg"
            required
          />
          <p className="text-sm text-muted-foreground">
            Entrez le nombre d'unites actuellement disponibles (0-99)
          </p>
        </div>

        {lastUpdateDate && (
          <div className="rounded-md bg-muted p-4 text-sm">
            <p className="text-muted-foreground">
              Derniere mise a jour: {lastUpdateDate}
            </p>
            <p className="mt-1 font-medium">
              Unites disponibles: {currentAvailability ?? '--'}
            </p>
          </div>
        )}

        {error && (
          <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? 'Mise a jour...' : 'Mettre a jour'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/rpa/dashboard')}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
        </div>
      </form>
    </div>
  );
}
