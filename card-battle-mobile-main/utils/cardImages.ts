// utils/cardImages.ts
import { ImageSourcePropType } from 'react-native';
import { CardRarity } from '../lib/game/types';
import CARD_IMAGE_REGISTRY from './cardImageRegistry';

export function getCardImage(
    id: string,
    rarity?: CardRarity,
    imageUrl?: string
): ImageSourcePropType | string | undefined {
    // أولاً: ابحث في الـ registry عن صورة محلية بالـ id
    if (CARD_IMAGE_REGISTRY[id]) {
        return CARD_IMAGE_REGISTRY[id];
    }
    // ثانياً: رجّع الـ URL الخارجي كـ fallback
    if (imageUrl) {
        return imageUrl;
    }
    return undefined;
}
