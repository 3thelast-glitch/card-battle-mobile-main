// ✅ صح
import { COMMON_IMAGES }    from '@/assets/characters/common';
import { RARE_IMAGES }      from '@/assets/characters/rare';
import { EPIC_IMAGES }      from '@/assets/characters/epic';
import { LEGENDARY_IMAGES } from '@/assets/characters/legendary';


const FALLBACK = require('@/assets/cards/final/human-warrior.png');

export function getCardImage(card: Card): ImageSourcePropType {
    // 1. لو فيه صورة محلية جاهزة حسب الندرة
    const rarity = card.rarity ?? 'common';
    const maps: Record<string, Record<string, any>> = {
        common: COMMON_IMAGES,
        rare: RARE_IMAGES,
        epic: EPIC_IMAGES,
        legendary: LEGENDARY_IMAGES,
    };

    const local = maps[rarity]?.[card.id];
    if (local) return local;

    // 2. لو فيه imageUrl من MyAnimeList
    if (card.imageUrl) return { uri: card.imageUrl };

    // 3. لو فيه finalImage قديم
    if (card.finalImage) return card.finalImage;

    // 4. fallback مؤقت
    return FALLBACK;
}
