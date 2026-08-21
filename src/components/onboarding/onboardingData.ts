import { BusinessCategoryOption, SuggestedInventory, SuggestedProduct } from './types';
import { BUSINESS_SEGMENTS_LIST, BUSINESS_SEGMENTS_MAP } from '../../config/businessSegments';
import { BusinessSegmentType } from '../../types';

export const BUSINESS_CATEGORIES: BusinessCategoryOption[] = BUSINESS_SEGMENTS_LIST.map((seg) => ({
  id: seg.id,
  name: `${seg.emoji} ${seg.name}`,
  icon: seg.emoji,
  color: seg.primaryColor,
  description: seg.description,
  defaultDeliveryFee: seg.features.hasDelivery ? 6.0 : 0,
}));

export const CATEGORY_PRODUCT_TEMPLATES: Record<string, SuggestedProduct[]> = {};
export const CATEGORY_INVENTORY_TEMPLATES: Record<string, SuggestedInventory[]> = {};

// Populate templates from all registered segment configs
BUSINESS_SEGMENTS_LIST.forEach((seg) => {
  CATEGORY_PRODUCT_TEMPLATES[seg.id] = seg.suggestedProducts.map((p) => ({
    name: p.name,
    category: p.category,
    price: p.price,
    cost: p.cost,
    description: p.description || '',
  }));

  CATEGORY_INVENTORY_TEMPLATES[seg.id] = seg.suggestedInventory.map((i) => ({
    name: i.name,
    unit: i.unit,
    currentQuantity: i.currentQuantity,
    minQuantity: i.minQuantity,
    cost: i.cost,
  }));
});

