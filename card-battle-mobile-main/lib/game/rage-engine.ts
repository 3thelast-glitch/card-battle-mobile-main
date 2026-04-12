/**
 * rage-engine.ts
 * منطق تفعيل وضع الغضب أثناء المعركة
 *
 * الاستخدام:
 *   import { shouldTriggerRage, applyRageToCard, buildRageState } from '@/lib/game/rage-engine';
 */
import type { Card, RageModeData } from './types';

export interface RageState {
  /** البطاقات التي فعّلت وضع الغضب بالفعل في هذه المباراة */
  activatedThisMatch: Set<string>;
}

export function buildRageState(): RageState {
  return { activatedThisMatch: new Set() };
}

/**
 * هل يجب تفعيل وضع الغضب لهذه البطاقة بعد خسارتها؟
 *
 * الشروط:
 *   1. البطاقة لديها rageMode.enabled = true
 *   2. إذا كانت oncePer = 'match' → لم تُفعَّل بعد في هذه المباراة
 *   3. إذا كانت oncePer = 'unlimited' → تتفعل في كل خسارة
 */
export function shouldTriggerRage(
  card: Card,
  rageState: RageState,
): boolean {
  const rm = card.rageMode;
  if (!rm?.enabled) return false;
  if (rm.oncePer === 'match' && rageState.activatedThisMatch.has(card.id)) return false;
  return true;
}

/**
 * طبّق وضع الغضب على البطاقة — يُعيد نسخة جديدة من البطاقة بإحصائيات وصورة مُعدَّلة
 */
export function applyRageToCard(card: Card, rageState: RageState): Card {
  const rm = card.rageMode as RageModeData;

  // تسجيل التفعيل إذا كانت oncePer = 'match'
  if (rm.oncePer === 'match') {
    rageState.activatedThisMatch.add(card.id);
  }

  const hasRageImageOnly = !!(rm.rageImageUrl || (rm as any).image) && !(rm.rageVideoUrl || (rm as any).video);
  const newImageUrl = rm.rageImageUrl || (rm as any).image || card.imageUrl;
  const newVideoUrl = hasRageImageOnly ? undefined : (rm.rageVideoUrl || (rm as any).video || card.videoUrl);
  const hasNewRageMedia = !!(rm.rageImageUrl || (rm as any).image || rm.rageVideoUrl || (rm as any).video);

  return {
    ...card,
    // وضع العلامة الدلالية للغضب بدلاً من تعديل الـ id لأنه سيكسر اسم الكرت في الواجهة
    isRagedVersion: true,
    
    attack:  card.attack  + (rm.rageAttackBoost  ?? 0),
    defense: card.defense + (rm.rageDefenseBoost ?? 0),
    nameAr:  rm.rageNameAr ?? card.nameAr,

    // الصورة والفيديو الجديدتين
    imageUrl: newImageUrl,
    videoUrl: newVideoUrl,

    // إبطال الصور المحلية في حال تم تخصيص ميديا جديدة للغضب
    ...(hasNewRageMedia && {
      customImage: undefined,
      finalImage: undefined,
      localImage: undefined,
      ...(hasRageImageOnly && { videoUrl: undefined }),
    }),

    _rageActive: true,
  } as Card & { _rageActive: boolean };
}

/** معلومات الغضب التي تُمرَّر للـ UI عند التفعيل */
export interface RageTriggerEvent {
  card: Card;
  rageCard: Card;
  videoUrl?: string;
  imageUrl?: string;
}

/**
 * بناء حدث الغضب الكامل (يُستخدم لعرض الـ overlay / الفيديو)
 */
export function buildRageTriggerEvent(original: Card, rageCard: Card): RageTriggerEvent {
  return {
    card:     original,
    rageCard,
    videoUrl: original.rageMode?.rageVideoUrl ?? (original as any).videoUrl,
    imageUrl: original.rageMode?.rageImageUrl ?? original.imageUrl,
  };
}
