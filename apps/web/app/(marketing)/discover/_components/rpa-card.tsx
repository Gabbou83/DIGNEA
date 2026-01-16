'use client';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';

interface RPACardProps {
  match: {
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
  };
  onContact: (rpaId: string) => void;
  selected?: boolean;
  onToggleSelect?: (rpaId: string) => void;
}

export function RPACard({
  match,
  onContact,
  selected = false,
  onToggleSelect,
}: RPACardProps) {
  const { rpa_info, score, reasons, availability } = match;

  // Format pricing
  const pricingText = (() => {
    if (rpa_info.pricing_min && rpa_info.pricing_max) {
      return `${rpa_info.pricing_min}$ - ${rpa_info.pricing_max}$/mois`;
    } else if (rpa_info.pricing_min) {
      return `À partir de ${rpa_info.pricing_min}$/mois`;
    } else if (rpa_info.pricing_max) {
      return `Jusqu'à ${rpa_info.pricing_max}$/mois`;
    }
    return 'Prix sur demande';
  })();

  // Score badge color
  const scoreColor = (() => {
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 60) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (score >= 40) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  })();

  // Availability badge color
  const availabilityColor = (() => {
    if (availability.units_available >= 5)
      return 'bg-green-100 text-green-800 border-green-200';
    if (availability.units_available >= 2)
      return 'bg-blue-100 text-blue-800 border-blue-200';
    if (availability.units_available >= 1)
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  })();

  return (
    <Card
      className={`transition-all hover:shadow-lg ${selected ? 'ring-2 ring-primary' : ''}`}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl">{rpa_info.name}</CardTitle>
            <CardDescription>
              {rpa_info.city}, {rpa_info.region}
            </CardDescription>
          </div>
          <Badge className={scoreColor} variant="outline">
            {score}% compatible
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Pricing */}
        <div>
          <p className="text-sm font-medium text-muted-foreground">Prix</p>
          <p className="text-lg font-semibold">{pricingText}</p>
        </div>

        {/* Availability */}
        <div>
          <Badge className={availabilityColor} variant="outline">
            {availability.units_available > 0
              ? `${availability.units_available} unité${availability.units_available > 1 ? 's' : ''} disponible${availability.units_available > 1 ? 's' : ''}`
              : 'Aucune disponibilité'}
          </Badge>
        </div>

        {/* Match reasons */}
        {reasons.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Pourquoi cette résidence?
            </p>
            <ul className="space-y-1">
              {reasons.map((reason, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <span className="text-primary">✓</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Rating if available */}
        {rpa_info.rating && (
          <div className="flex items-center gap-2">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className={
                    i < Math.round(rpa_info.rating!)
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  }
                >
                  ★
                </span>
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {rpa_info.rating.toFixed(1)}/5
            </span>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2">
        {onToggleSelect && (
          <Button
            variant={selected ? 'default' : 'outline'}
            onClick={() => onToggleSelect(match.rpa_id)}
            className="flex-1"
          >
            {selected ? 'Sélectionné' : 'Sélectionner'}
          </Button>
        )}
        <Button
          onClick={() => onContact(match.rpa_id)}
          className="flex-1"
          variant="default"
        >
          Contacter
        </Button>
      </CardFooter>
    </Card>
  );
}
