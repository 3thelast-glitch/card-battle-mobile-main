import type { ImageSourcePropType } from 'react-native';
import type { Card } from '@/lib/game/types';
import { COMMON_IMAGES } from '@/assets/characters/common';
import { RARE_IMAGES } from '@/assets/characters/rare';
import { EPIC_IMAGES } from '@/assets/characters/epic';
import { LEGENDARY_IMAGES } from '@/assets/characters/legendary';

export function getCardImage(card: Card & { customImage?: string; finalImage?: ImageSourcePropType }): ImageSourcePropType | null {
    // Custom image uploaded by user always wins
    if ((card as any).customImage) return { uri: (card as any).customImage };
    if (card.finalImage) return card.finalImage;

    const maps: Record<string, Record<string, any>> = {
        common: COMMON_IMAGES,
        rare: RARE_IMAGES,
        epic: EPIC_IMAGES,
        legendary: LEGENDARY_IMAGES,
    };

    const local = maps[card.rarity ?? 'common']?.[card.id];
    if (local) return local;
    if (card.imageUrl) return { uri: card.imageUrl };
    return null;
}
