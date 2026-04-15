import type { ImageSourcePropType } from 'react-native';
import type { Card } from '@/lib/game/types';
import { COMMON_IMAGES, COMMON_VIDEOS } from '@/assets/characters/common';
import { RARE_IMAGES } from '@/assets/characters/rare';
import { EPIC_IMAGES, EPIC_VIDEOS } from '@/assets/characters/epic';
import { LEGENDARY_IMAGES, LEGENDARY_VIDEOS } from '@/assets/characters/legendary';
import { SPECIAL_IMAGES, SPECIAL_VIDEOS } from '@/assets/characters/special';
import { RAGE_IMAGES, RAGE_VIDEOS } from '@/assets/characters/rage';

// ─── خرائط الفيديو لكل ندرة ──────────────────────────────────────────────────
const VIDEO_MAPS: Record<string, Record<string, any>> = {
    common: COMMON_VIDEOS,
    // rare: RARE_VIDEOS,    // أضف لاحقاً عند الحاجة
    epic: EPIC_VIDEOS,
    legendary: LEGENDARY_VIDEOS,
    special: SPECIAL_VIDEOS,
};

/**
 * يرجع مصدر الصورة للكرت.
 * إذا كان للكرت فيديو محلي، يُسجَّل في card.videoUrl تلقائياً
 * ويُستخدَم لاحقاً في LuxuryCharacterCardAnimated.
 */
export function getCardImage(
    card: Card & { customImage?: string; finalImage?: ImageSourcePropType }
): ImageSourcePropType | null {
    // ─── اعتراض الغضب كأولوية قصوى متجاوزاً أي صور محفوظة ──────────────────────
    if ((card as any).isRagedVersion) {
        const rageFileName = `${card.id}_rage`;
        const rageVideo = RAGE_VIDEOS[rageFileName];
        if (rageVideo) {
            (card as any).videoUrl = rageVideo;
            return null; // الكمبوننت يعرض الفيديو مباشرة من videoUrl
        }
        
        const rageImage = RAGE_IMAGES[rageFileName];
        if (rageImage) {
            // إبطال أي فيديو للكرت الأصلي حتى تظهر الصورة بوضوح
            (card as any).videoUrl = null;
            return rageImage;
        }
    }

    // صورة مخصصة من المستخدم تتقدم على الكل
    if ((card as any).customImage) return { uri: (card as any).customImage };
    if (card.finalImage) return card.finalImage;

    const rarity = card.rarity ?? 'common';

    // ─── فيديو محلي ──────────────────────────────────────────────────────────
    const localVideo = VIDEO_MAPS[rarity]?.[card.id];
    if (localVideo) {
        // اربط videoUrl على الكائن حتى يستخدمه الكمبوننت
        (card as any).videoUrl = localVideo;
        return null; // الكمبوننت يعرض الفيديو مباشرة من videoUrl
    }

    // ─── صورة محلية ──────────────────────────────────────────────────────────
    const IMAGE_MAPS: Record<string, Record<string, any>> = {
        common: COMMON_IMAGES,
        rare: RARE_IMAGES,
        epic: EPIC_IMAGES,
        legendary: LEGENDARY_IMAGES,
        special: SPECIAL_IMAGES,
    };

    const local = IMAGE_MAPS[rarity]?.[card.id];
    if (local) return local;

    // ─── صورة عن بعد (imageUrl) ───────────────────────────────────────────────
    if (card.imageUrl) return { uri: card.imageUrl };

    return null;
}
