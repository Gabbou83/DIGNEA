/**
 * DIGNEA Matching Engine - RPA Matching Algorithm
 * Matches patient profiles to available retirement residences
 */

import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';
import type { MatchingError, PatientProfile, RPAMatch } from './types';

export class MatchingEngine {
  /**
   * Find matching RPAs based on patient profile
   */
  async findMatches(
    client: SupabaseClient,
    profile: PatientProfile,
    options?: {
      limit?: number;
      offset?: number;
      requireAvailability?: boolean;
    },
  ): Promise<RPAMatch[]> {
    try {
      const { limit = 10, offset = 0, requireAvailability = true } = options || {};

      // Build query with hard filters
      let query = client
        .from('rpas')
        .select(`
          id,
          name,
          city,
          region,
          pricing_min,
          pricing_max,
          rating,
          response_time_hours,
          care_capabilities,
          category,
          availability (
            units_available,
            reported_at
          )
        `)
        .eq('is_active', true);

      // Hard filter: Budget
      if (profile.budget?.amount) {
        const budget = profile.budget.amount;
        const flexibility = profile.budget.flexibility || 'flexible';

        if (flexibility === 'strict') {
          query = query
            .lte('pricing_min', budget)
            .gte('pricing_max', budget);
        } else {
          // Allow 20% flexibility
          const flexAmount = budget * 0.2;
          query = query
            .lte('pricing_min', budget + flexAmount);
        }
      }

      // Hard filter: Location
      if (profile.location?.city) {
        query = query.ilike('city', profile.location.city);
      } else if (profile.location?.region) {
        query = query.ilike('region', profile.location.region);
      }

      // Execute query
      const { data: rpas, error } = await query;

      if (error) throw error;
      if (!rpas || rpas.length === 0) {
        return [];
      }

      // Calculate scores for each RPA and filter by availability if required
      const scoredMatches: RPAMatch[] = rpas
        .map((rpa: any) => {
          // Get latest availability
          const latestAvailability = rpa.availability?.length > 0
            ? rpa.availability.sort((a: any, b: any) =>
                new Date(b.reported_at).getTime() - new Date(a.reported_at).getTime()
              )[0]
            : null;

          const unitsAvailable = latestAvailability?.units_available || 0;

          // Skip if availability required but none available
          if (requireAvailability && unitsAvailable === 0) {
            return null;
          }

          // Calculate individual scores
          const budgetMatch = this.calculateBudgetScore(profile, rpa);
          const careMatch = this.calculateCareScore(profile, rpa);
          const locationMatch = this.calculateLocationScore(profile, rpa);
          const availabilityMatch = this.calculateAvailabilityScore(rpa);
          const responsivenessMatch = this.calculateResponsivenessScore(rpa);

          // Calculate total weighted score
          const totalScore = Math.round(
            budgetMatch * 0.3 +
            careMatch * 0.25 +
            locationMatch * 0.2 +
            availabilityMatch * 0.15 +
            responsivenessMatch * 0.1
          );

          // Build human-readable reasons
          const reasons: string[] = [];
          if (budgetMatch >= 80) reasons.push('Excellent budget match');
          else if (budgetMatch >= 60) reasons.push('Good budget match');

          if (careMatch >= 80) reasons.push('Specialized care available');
          else if (careMatch >= 60) reasons.push('Suitable care level');

          if (locationMatch >= 90) reasons.push('Perfect location match');
          else if (locationMatch >= 70) reasons.push('Good location match');

          if (unitsAvailable > 3) reasons.push(`${unitsAvailable} units available`);
          else if (unitsAvailable > 0) reasons.push(`${unitsAvailable} unit(s) available`);

          if (rpa.rating >= 4.5) reasons.push('Highly rated');
          else if (rpa.rating >= 4.0) reasons.push('Well rated');

          return {
            rpa_id: rpa.id,
            score: totalScore,
            match_details: {
              budget_match: budgetMatch,
              care_match: careMatch,
              location_match: locationMatch,
              availability_match: availabilityMatch,
              responsiveness_match: responsivenessMatch,
            },
            reasons,
            availability: {
              units_available: unitsAvailable,
              last_updated: latestAvailability?.reported_at
                ? new Date(latestAvailability.reported_at)
                : new Date(),
            },
            rpa_info: {
              name: rpa.name,
              city: rpa.city,
              region: rpa.region,
              pricing_min: rpa.pricing_min,
              pricing_max: rpa.pricing_max,
              rating: rpa.rating,
            },
          };
        })
        .filter((match): match is RPAMatch => match !== null)
        .sort((a, b) => b.score - a.score)
        .slice(offset, offset + limit);

      return scoredMatches;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Calculate match score between patient profile and RPA
   */
  private calculateMatchScore(
    profile: PatientProfile,
    rpa: unknown, // TODO: Type from database
  ): number {
    let score = 0;

    // Budget match (30% weight)
    score += this.calculateBudgetScore(profile, rpa) * 0.3;

    // Care level match (25% weight)
    score += this.calculateCareScore(profile, rpa) * 0.25;

    // Location match (20% weight)
    score += this.calculateLocationScore(profile, rpa) * 0.2;

    // Availability match (15% weight)
    score += this.calculateAvailabilityScore(rpa) * 0.15;

    // Responsiveness/Rating match (10% weight)
    score += this.calculateResponsivenessScore(rpa) * 0.1;

    return Math.round(score);
  }

  private calculateBudgetScore(
    profile: PatientProfile,
    rpa: any,
  ): number {
    if (!profile.budget?.amount) return 50; // Neutral if no budget specified

    const budget = profile.budget.amount;
    const rpaMin = rpa.pricing_min || 0;
    const rpaMax = rpa.pricing_max || budget * 2;

    // Perfect match: budget falls within RPA range
    if (budget >= rpaMin && budget <= rpaMax) {
      // Score higher if closer to middle of range
      const rangeMid = (rpaMin + rpaMax) / 2;
      const distanceFromMid = Math.abs(budget - rangeMid);
      const rangeSize = rpaMax - rpaMin;
      const proximity = 1 - (distanceFromMid / (rangeSize / 2));
      return Math.round(80 + proximity * 20); // 80-100 score
    }

    // Budget below minimum: penalize based on difference
    if (budget < rpaMin) {
      const difference = rpaMin - budget;
      const percentDiff = difference / budget;
      if (percentDiff > 0.3) return 0; // More than 30% below = no match
      return Math.round(50 * (1 - percentDiff / 0.3)); // 0-50 score
    }

    // Budget above maximum: less penalty (overpaying is ok)
    const difference = budget - rpaMax;
    const percentDiff = difference / budget;
    if (percentDiff > 0.5) return 30; // Way over but still possible
    return Math.round(60 - percentDiff * 40); // 40-60 score
  }

  private calculateCareScore(profile: PatientProfile, rpa: any): number {
    let score = 50; // Base score

    // Map autonomy to required RPA category
    const autonomy = profile.autonomy;
    const rpaCategory = rpa.category;

    if (autonomy === 'autonomous') {
      // Category 1-2 preferred
      score += rpaCategory <= 2 ? 30 : 10;
    } else if (autonomy === 'semi_autonomous') {
      // Category 2-3 preferred
      score += rpaCategory >= 2 && rpaCategory <= 3 ? 30 : 10;
    } else if (autonomy === 'loss_of_independence') {
      // Category 3-4 preferred
      score += rpaCategory >= 3 ? 30 : 10;
    }

    // Check care capabilities match conditions
    const careCapabilities = rpa.care_capabilities || [];
    const conditions = profile.conditions || {};

    let capabilityMatches = 0;
    let totalConditions = 0;

    if (conditions.alzheimers) {
      totalConditions++;
      if (careCapabilities.includes('alzheimers')) capabilityMatches++;
    }
    if (conditions.parkinsons) {
      totalConditions++;
      if (careCapabilities.includes('parkinsons')) capabilityMatches++;
    }
    if (conditions.mobility_issues) {
      totalConditions++;
      if (careCapabilities.includes('mobility_assistance')) capabilityMatches++;
    }
    if (conditions.cognitive_decline) {
      totalConditions++;
      if (careCapabilities.includes('cognitive_care')) capabilityMatches++;
    }

    // Add bonus for capability matches
    if (totalConditions > 0) {
      const matchRatio = capabilityMatches / totalConditions;
      score += Math.round(matchRatio * 20);
    }

    return Math.min(100, score);
  }

  private calculateLocationScore(
    profile: PatientProfile,
    rpa: any,
  ): number {
    if (!profile.location) return 50; // Neutral if no location preference

    const profileCity = profile.location.city?.toLowerCase();
    const profileRegion = profile.location.region?.toLowerCase();
    const rpaCity = rpa.city?.toLowerCase();
    const rpaRegion = rpa.region?.toLowerCase();

    // Perfect match: same city
    if (profileCity && rpaCity && profileCity === rpaCity) {
      return 100;
    }

    // Good match: same region
    if (profileRegion && rpaRegion && profileRegion === rpaRegion) {
      return 75;
    }

    // TODO: Calculate distance using coordinates when available
    // For now, return lower score for different regions
    return 30;
  }

  private calculateAvailabilityScore(rpa: any): number {
    const availability = rpa.availability?.length > 0
      ? rpa.availability.sort((a: any, b: any) =>
          new Date(b.reported_at).getTime() - new Date(a.reported_at).getTime()
        )[0]
      : null;

    if (!availability) return 0;

    const unitsAvailable = availability.units_available || 0;
    const reportedAt = new Date(availability.reported_at);
    const hoursOld = (Date.now() - reportedAt.getTime()) / (1000 * 60 * 60);

    // Score based on number of units (capped at 5)
    const unitsScore = Math.min(unitsAvailable / 5, 1) * 60;

    // Penalty for stale data
    let freshnessScore = 40;
    if (hoursOld < 24) freshnessScore = 40; // Fresh
    else if (hoursOld < 48) freshnessScore = 30; // Recent
    else if (hoursOld < 168) freshnessScore = 20; // Within a week
    else freshnessScore = 10; // Stale

    return Math.round(unitsScore + freshnessScore);
  }

  private calculateResponsivenessScore(rpa: any): number {
    let score = 0;

    // Rating component (60% weight)
    if (rpa.rating) {
      const ratingScore = (rpa.rating / 5) * 60;
      score += ratingScore;
    } else {
      score += 30; // Neutral for no rating
    }

    // Response time component (40% weight)
    if (rpa.response_time_hours) {
      const responseTime = rpa.response_time_hours;
      let timeScore = 0;

      if (responseTime <= 4) timeScore = 40; // Excellent
      else if (responseTime <= 12) timeScore = 30; // Good
      else if (responseTime <= 24) timeScore = 20; // Acceptable
      else timeScore = 10; // Slow

      score += timeScore;
    } else {
      score += 20; // Neutral for no data
    }

    return Math.round(score);
  }

  private handleError(error: unknown): MatchingError {
    const { MatchingError } = require('./types') as typeof import('./types');

    console.error('MatchingEngine error details:', error);

    if (error instanceof Error) {
      return new MatchingError(error.message, 'DATABASE_ERROR', error);
    }

    return new MatchingError('Unexpected error', 'DATABASE_ERROR', error);
  }
}
