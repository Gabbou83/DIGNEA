import type { K10RPA } from './types';

const K10_BASE_URL = 'http://k10.pub.msss.rtss.qc.ca';

/**
 * Generate normalized search terms for fuzzy matching
 */
function generateSearchTerms(fields: {
  name: string;
  city?: string;
  k10_id: string;
}): string {
  const terms = [fields.name, fields.city, fields.k10_id]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s]/g, ' ') // Remove special chars
    .trim();

  return terms;
}

/**
 * Scrape all RPAs from K10 registry
 *
 * NOTE: This is currently returning mock data for development.
 * The actual K10 website structure needs to be analyzed and implemented.
 */
export async function scrapeK10Registry(): Promise<K10RPA[]> {
  // TODO: Implement actual web scraping once K10 site structure is known
  // For now, return test data for development

  const mockRPAs: K10RPA[] = [
    {
      k10_id: 'K10-12345',
      name: 'Résidence des Érables',
      address: '123 rue Principale',
      city: 'Montreal',
      region: 'Montréal',
      postal_code: 'H1A 1A1',
      phone: '514-555-1234',
      email: 'contact@erables.qc.ca',
      category: 2,
      certification_status: 'active',
      search_terms: generateSearchTerms({
        name: 'Résidence des Érables',
        city: 'Montreal',
        k10_id: 'K10-12345',
      }),
    },
    {
      k10_id: 'K10-12346',
      name: 'Maison du Soleil',
      address: '456 avenue du Parc',
      city: 'Quebec',
      region: 'Capitale-Nationale',
      postal_code: 'G1R 2B1',
      phone: '418-555-5678',
      email: 'info@maisonsoleil.qc.ca',
      category: 3,
      certification_status: 'active',
      search_terms: generateSearchTerms({
        name: 'Maison du Soleil',
        city: 'Quebec',
        k10_id: 'K10-12346',
      }),
    },
    {
      k10_id: 'K10-12347',
      name: 'Les Jardins du Fleuve',
      address: '789 boulevard Saint-Laurent',
      city: 'Laval',
      region: 'Laval',
      postal_code: 'H7G 3C3',
      phone: '450-555-9012',
      email: 'contact@jardinsfleuve.qc.ca',
      category: 1,
      certification_status: 'active',
      search_terms: generateSearchTerms({
        name: 'Les Jardins du Fleuve',
        city: 'Laval',
        k10_id: 'K10-12347',
      }),
    },
  ];

  console.log(`Returning ${mockRPAs.length} mock RPAs for development`);
  return mockRPAs;
}

/**
 * Fetch details for a specific K10 RPA
 * NOTE: Mock implementation for development
 */
export async function fetchK10Details(k10_id: string): Promise<K10RPA | null> {
  const all = await scrapeK10Registry();
  return all.find((rpa) => rpa.k10_id === k10_id) || null;
}
