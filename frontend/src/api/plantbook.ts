import { apiFetch } from './client';
import type { BaseKey, HeadKey, IconRecipe } from '../types/plant';

// keyword lists are checked in order; first match wins
const BASE_KEYWORDS: [string[], BaseKey][] = [
  [['monstera', 'rhaphidophora'], 'fenestrated-tropical'],
  [['ficus lyrata', 'fiddle leaf', 'fiddle-leaf'], 'big-paddle'],
  [['opuntia', 'prickly pear', 'bunny ear'], 'cactus-pad'],
  [['string of pearls', 'string of hearts', 'ceropegia', 'senecio', 'curio', 'peperomia rotundifolia'], 'beaded-strand'],
  [['echeveria', 'sempervivum', 'aeonium', 'haworthia', 'lithops', 'living stone'], 'rosette-succulent'],
  [['jade', 'crassula', 'sedum', 'portulacaria', 'kalanchoe', 'paddle'], 'paddle-succulent'],
  [['cactus', 'cereus', 'echinopsis', 'mammillaria', 'echinocactus', 'barrel cactus', 'saguaro'], 'cactus'],
  [['fern', 'asplenium', 'maidenhair', 'pteris', 'polypodium', 'nephrolepis'], 'feathery-fern'],
  [['palm', 'areca', 'ravenea', 'chamaedorea', 'kentia', 'livistona', 'cycas'], 'palm-frond'],
  [['sansevieria', 'dracaena trifasciata', 'snake plant', 'mother-in-law', 'aloe', 'agave', 'yucca'], 'upright-sword'],
  [['pothos', 'epipremnum', 'scindapsus', 'heartleaf philodendron', 'tradescantia', 'string of'], 'trailing-vine'],
  [['begonia', 'caladium', 'dieffenbachia', 'colocasia', 'alocasia', 'elephant ear', 'prayer plant', 'maranta', 'calathea', 'stromanthe'], 'patterned-broadleaf'],
  [['dracaena', 'cordyline', 'bromeliad', 'tillandsia', 'bird of paradise', 'strelitzia', 'heliconia', 'banana', 'musa'], 'strappy-arching'],
  [['ficus', 'rubber', 'money tree', 'pachira', 'weeping fig'], 'single-trunk-tree'],
];

const BLOOM_KEYWORDS: [string[], HeadKey][] = [
  [['orchid', 'phalaenopsis', 'dendrobium', 'cymbidium'], 'orchid'],
  [['rose', 'rosa'], 'rose'],
  [['tulip', 'tulipa'], 'tulip'],
  [['daisy', 'chrysanthemum', 'gerbera', 'bellis', 'chamomile'], 'daisy'],
  [['iris'], 'iris'],
  [['lily', 'lilium', 'anthurium', 'calla', 'peace lily', 'spathiphyllum'], 'lily'],
  [['campanula', 'bluebell', 'agapanthus', 'hosta'], 'bell'],
  [['poppy', 'papaver'], 'poppy'],
  [['hydrangea', 'lantana', 'sedum bloom'], 'cluster'],
  [['lavender', 'salvia', 'veronica', 'delphinium', 'liatris'], 'spike'],
];

export function suggestIconFromSpecies(displayName: string, alias: string): Partial<IconRecipe> {
  const hay = `${displayName} ${alias ?? ''}`.toLowerCase();
  const result: Partial<IconRecipe> = {};
  for (const [kws, base] of BASE_KEYWORDS) {
    if (kws.some(k => hay.includes(k))) { result.base = base; break; }
  }
  for (const [kws, head] of BLOOM_KEYWORDS) {
    if (kws.some(k => hay.includes(k))) { result.bloom = { head, petal: 'amber' }; break; }
  }
  return result;
}

export interface PlantSearchResult {
  pid: string;
  display_name: string;
  alias: string;
}

export interface PlantProfile {
  pid: string;
  display_name: string;
  alias: string;
  min_soil_moist: number | null;
  max_soil_moist: number | null;
  min_light_lux: number | null;
  max_light_lux: number | null;
  min_temp: number | null;
  max_temp: number | null;
  min_env_humid: number | null;
  max_env_humid: number | null;
  image_url: string;
}

export async function searchPlantbook(q: string): Promise<PlantSearchResult[]> {
  return apiFetch<PlantSearchResult[]>(`/plantbook/search?q=${encodeURIComponent(q)}`);
}

export async function getPlantbookDetail(pid: string): Promise<PlantProfile> {
  return apiFetch<PlantProfile>(`/plantbook/detail/${encodeURIComponent(pid)}`);
}

export function luxToLabel(minLux: number | null, maxLux: number | null): string {
  const avg = ((minLux ?? 0) + (maxLux ?? 0)) / 2;
  if (avg === 0) return '';
  if (avg < 1000) return 'Low light';
  if (avg < 3000) return 'Indirect light';
  if (avg < 6000) return 'Bright indirect';
  return 'Full sun';
}

export function suggestEvery(minSoilMoist: number | null): number {
  if (minSoilMoist === null) return 7;
  if (minSoilMoist <= 15) return 14;
  if (minSoilMoist <= 25) return 9;
  if (minSoilMoist <= 40) return 6;
  return 4;
}
