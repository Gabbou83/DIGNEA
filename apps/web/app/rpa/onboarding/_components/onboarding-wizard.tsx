'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { Button } from '@kit/ui/button';
import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';

import pathsConfig from '~/config/paths.config';

type OnboardingStep = 'search' | 'confirm' | 'availability' | 'phone' | 'complete';

interface RPAData {
  k10_id?: string;
  name: string;
  address?: string;
  city?: string;
  region?: string;
  postal_code?: string;
  phone?: string;
  availability?: number;
}

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState<OnboardingStep>('search');
  const [rpaData, setRpaData] = useState<RPAData>({
    name: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // TODO: Search K10 registry
    // For now, just move to manual entry
    setStep('confirm');
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!rpaData.name) {
      setError('Le nom de la residence est requis');
      return;
    }

    setStep('availability');
  };

  const handleAvailability = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (rpaData.availability === undefined || rpaData.availability < 0) {
      setError('Veuillez entrer un nombre valide');
      return;
    }

    setStep('phone');
  };

  const handlePhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Submit onboarding data
      const response = await fetch('/api/rpa/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rpaData),
      });

      if (!response.ok) {
        throw new Error('Echec de la configuration');
      }

      setStep('complete');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Une erreur est survenue',
      );
      setIsSubmitting(false);
    }
  };

  const handleComplete = () => {
    router.push(pathsConfig.rpa.dashboard);
  };

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-2">
        <StepIndicator active={step === 'search'} completed={step !== 'search'} />
        <div className="h-1 w-12 bg-muted" />
        <StepIndicator active={step === 'confirm'} completed={['availability', 'phone', 'complete'].includes(step)} />
        <div className="h-1 w-12 bg-muted" />
        <StepIndicator active={step === 'availability'} completed={['phone', 'complete'].includes(step)} />
        <div className="h-1 w-12 bg-muted" />
        <StepIndicator active={step === 'phone'} completed={step === 'complete'} />
      </div>

      <div className="rounded-lg border bg-card p-8">
        {step === 'search' && (
          <form onSubmit={handleSearch} className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold">Rechercher votre residence</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Recherchez votre residence dans le registre K10 ou creez une nouvelle entree
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="search">Nom de la residence ou code K10</Label>
              <Input
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ex: Residence des Erables ou K10-12345"
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" className="flex-1">
                Rechercher
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep('confirm')}
                className="flex-1"
              >
                Entree manuelle
              </Button>
            </div>
          </form>
        )}

        {step === 'confirm' && (
          <form onSubmit={handleConfirm} className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold">Informations de la residence</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Confirmez ou completez les informations de votre residence
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom de la residence *</Label>
                <Input
                  id="name"
                  value={rpaData.name}
                  onChange={(e) => setRpaData({ ...rpaData, name: e.target.value })}
                  placeholder="Ex: Residence des Erables"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Adresse</Label>
                <Input
                  id="address"
                  value={rpaData.address || ''}
                  onChange={(e) => setRpaData({ ...rpaData, address: e.target.value })}
                  placeholder="Ex: 123 rue Principale"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="city">Ville</Label>
                  <Input
                    id="city"
                    value={rpaData.city || ''}
                    onChange={(e) => setRpaData({ ...rpaData, city: e.target.value })}
                    placeholder="Ex: Montreal"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postal_code">Code postal</Label>
                  <Input
                    id="postal_code"
                    value={rpaData.postal_code || ''}
                    onChange={(e) => setRpaData({ ...rpaData, postal_code: e.target.value })}
                    placeholder="Ex: H1A 1A1"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep('search')}
              >
                Retour
              </Button>
              <Button type="submit" className="flex-1">
                Continuer
              </Button>
            </div>
          </form>
        )}

        {step === 'availability' && (
          <form onSubmit={handleAvailability} className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold">Disponibilites initiales</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Combien d'unites sont actuellement disponibles?
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="availability">Nombre d'unites disponibles</Label>
              <Input
                id="availability"
                type="number"
                min="0"
                max="99"
                value={rpaData.availability ?? ''}
                onChange={(e) => setRpaData({ ...rpaData, availability: parseInt(e.target.value, 10) })}
                placeholder="Ex: 5"
                className="text-lg"
                required
              />
              <p className="text-sm text-muted-foreground">
                Vous pourrez mettre a jour ce nombre a tout moment
              </p>
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep('confirm')}
              >
                Retour
              </Button>
              <Button type="submit" className="flex-1">
                Continuer
              </Button>
            </div>
          </form>
        )}

        {step === 'phone' && (
          <form onSubmit={handlePhone} className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold">Notifications SMS</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Recevez un rappel quotidien par SMS pour mettre a jour vos disponibilites
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Numero de telephone (optionnel)</Label>
              <Input
                id="phone"
                type="tel"
                value={rpaData.phone || ''}
                onChange={(e) => setRpaData({ ...rpaData, phone: e.target.value })}
                placeholder="Ex: 514-555-0123"
              />
              <p className="text-sm text-muted-foreground">
                Format: 514-555-0123 ou +1-514-555-0123
              </p>
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep('availability')}
                disabled={isSubmitting}
              >
                Retour
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? 'Configuration...' : 'Terminer'}
              </Button>
            </div>
          </form>
        )}

        {step === 'complete' && (
          <div className="space-y-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <div>
              <h2 className="text-2xl font-semibold">Configuration terminee!</h2>
              <p className="mt-2 text-muted-foreground">
                Votre residence est maintenant configuree et visible sur DIGNEA
              </p>
            </div>

            <Button onClick={handleComplete} className="w-full">
              Aller au tableau de bord
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function StepIndicator({ active, completed }: { active: boolean; completed: boolean }) {
  return (
    <div
      className={`flex h-8 w-8 items-center justify-center rounded-full ${
        completed
          ? 'bg-primary text-primary-foreground'
          : active
            ? 'border-2 border-primary bg-background'
            : 'bg-muted'
      }`}
    >
      {completed && (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )}
    </div>
  );
}
