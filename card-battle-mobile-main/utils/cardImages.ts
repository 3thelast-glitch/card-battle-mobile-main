// utils/cardImages.ts
import { ImageSourcePropType } from 'react-native';
import { CardRarity } from '../lib/game/types';
import CARD_IMAGE_REGISTRY from './cardImageRegistry';

export function getCardImage(
  id: string,
  race?: string,
  cardClass?: string,
  imageUrl?: string,
  rarity?: CardRarity,
): ImageSourcePropType | string | undefined {

  // 1. صورة خاصة بالـ id (للمستقبل لما تضيف صور فردية)
  if (CARD_IMAGE_REGISTRY[id]) {
    return CARD_IMAGE_REGISTRY[id];
  }

  // 2. القالب بناءً على race + class
  const templateKey = `${race}-${cardClass}`;
  if (CARD_IMAGE_REGISTRY[templateKey]) {
    return CARD_IMAGE_REGISTRY[templateKey];
  }

  // 3. fallback → URL خارجي (anime-cards-data)
  if (imageUrl) {
    return imageUrl;
  }

  return undefined;
}
