import { BusinessSegmentConfig, BusinessSegmentType } from './types';
import { pizzariaSegment } from './segments/pizzaria';
import { padariaSegment } from './segments/padaria';
import { hamburgueriaSegment } from './segments/hamburgueria';
import { confeitariaSegment } from './segments/confeitaria';
import { adegaSegment } from './segments/adega';
import { acaiSorveteriaSegment } from './segments/acaiSorveteria';
import { restauranteSegment } from './segments/restaurante';
import { lanchoneteSegment } from './segments/lanchonete';
import { mercadinhoSegment } from './segments/mercadinho';
import { cafeteriaSegment } from './segments/cafeteria';
import { salaoBarbeariaSegment } from './segments/salaoBarbearia';
import { servicosSegment } from './segments/servicos';
import { outroSegment } from './segments/outro';

export * from './types';

export const BUSINESS_SEGMENTS_MAP: Record<BusinessSegmentType, BusinessSegmentConfig> = {
  pizzaria: pizzariaSegment,
  padaria: padariaSegment,
  hamburgueria: hamburgueriaSegment,
  confeitaria: confeitariaSegment,
  adega: adegaSegment,
  acai_sorveteria: acaiSorveteriaSegment,
  restaurante: restauranteSegment,
  lanchonete: lanchoneteSegment,
  mercadinho: mercadinhoSegment,
  cafeteria: cafeteriaSegment,
  salao_barbearia: salaoBarbeariaSegment,
  servicos: servicosSegment,
  outro: outroSegment,
};

export const BUSINESS_SEGMENTS_LIST: BusinessSegmentConfig[] = [
  pizzariaSegment,
  padariaSegment,
  hamburgueriaSegment,
  confeitariaSegment,
  adegaSegment,
  acaiSorveteriaSegment,
  restauranteSegment,
  lanchoneteSegment,
  mercadinhoSegment,
  cafeteriaSegment,
  salaoBarbeariaSegment,
  servicosSegment,
  outroSegment,
];

export const DEFAULT_SEGMENT_ID: BusinessSegmentType = 'pizzaria';
export const DEFAULT_SEGMENT_CONFIG: BusinessSegmentConfig = pizzariaSegment;

/**
 * Returns the BusinessSegmentConfig for a given ID, category name, or fallback to default
 */
export function getSegmentConfig(idOrCategory?: string | null): BusinessSegmentConfig {
  if (!idOrCategory) return DEFAULT_SEGMENT_CONFIG;

  const raw = idOrCategory.toLowerCase().trim();

  // 1. Direct map lookup (e.g. 'padaria', 'hamburgueria', 'acai_sorveteria')
  if (BUSINESS_SEGMENTS_MAP[raw as BusinessSegmentType]) {
    return BUSINESS_SEGMENTS_MAP[raw as BusinessSegmentType];
  }

  // 2. Exact match on seg.id or seg.name
  const exactMatch = BUSINESS_SEGMENTS_LIST.find(
    (s) => s.id === raw || s.name.toLowerCase().trim() === raw
  );
  if (exactMatch) return exactMatch;

  // 3. Keyword / partial matching
  if (raw.includes('padaria') || raw.includes('panific') || raw.includes('pao') || raw.includes('pão') || raw.includes('fornada')) {
    return padariaSegment;
  }
  if (raw.includes('pizza') || raw.includes('fornaria')) {
    return pizzariaSegment;
  }
  if (raw.includes('burger') || raw.includes('hamburguer') || raw.includes('hambúrguer')) {
    return hamburgueriaSegment;
  }
  if (raw.includes('bolo') || raw.includes('confeit') || raw.includes('doces')) {
    return confeitariaSegment;
  }
  if (raw.includes('adega') || raw.includes('bebida') || raw.includes('distribuidora') || raw.includes('vinho')) {
    return adegaSegment;
  }
  if (raw.includes('açaí') || raw.includes('acai') || raw.includes('sorvet') || raw.includes('gelad')) {
    return acaiSorveteriaSegment;
  }
  if (raw.includes('restaurante') || raw.includes('marmita') || raw.includes('refeição') || raw.includes('refeicao')) {
    return restauranteSegment;
  }
  if (raw.includes('lanche') || raw.includes('lanchonete') || raw.includes('pastel') || raw.includes('salgado')) {
    return lanchoneteSegment;
  }
  if (raw.includes('mercado') || raw.includes('mercadinho') || raw.includes('conveniencia') || raw.includes('mercearia')) {
    return mercadinhoSegment;
  }
  if (raw.includes('café') || raw.includes('cafe') || raw.includes('cafeteria')) {
    return cafeteriaSegment;
  }
  if (raw.includes('salão') || raw.includes('salao') || raw.includes('barbearia') || raw.includes('cabelo') || raw.includes('estética') || raw.includes('estetica')) {
    return salaoBarbeariaSegment;
  }
  if (raw.includes('serviço') || raw.includes('servico') || raw.includes('oficina') || raw.includes('prestador')) {
    return servicosSegment;
  }

  return DEFAULT_SEGMENT_CONFIG;
}
