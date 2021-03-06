import { I18nName } from '../common/i18n-name';

export interface Levequest {
  level: number;
  jobId: number;
  itemId: number;
  itemIcon: string;
  recipes: { recipeId: string, jobId: number }[];
  exp: number;
  gil: number;
  hq: boolean;
  // Amount of levequest completions
  amount: number;
  // Quantity of item required for completion
  itemQuantity: number;
  name: I18nName;
  repeats: number;
  deliveryPlaceId: number;
  startPlaceId: number;
  // Levequest is selected from search results
  selected?: boolean;
  // Option to complete all deliveries (3x turn-in) is selected from search results
  allDeliveries?: boolean;
}
