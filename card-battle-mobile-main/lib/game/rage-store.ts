/**
 * rage-store.ts
 * حفظ / تحميل إعدادات وضع الغضب (Rage Mode) لكل كرت في AsyncStorage.
 * نفس نمط abilities-store.ts
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const RAGE_KEY = 'card_rage_overrides_v1';

export interface RageModeData {
  /** هل الميزة مفعّلة لهذه البطاقة؟ */
  enabled: boolean;
  /** رابط صورة الغضب (URL أو base64) */
  rageImageUrl?: string;
  /** رابط فيديو التحول — يُشغَّل لحظة التفعيل */
  rageVideoUrl?: string;
  /** زيادة قيمة الهجوم عند الغضب */
  rageAttackBoost: number;
  /** زيادة قيمة الدفاع عند الغضب */
  rageDefenseBoost: number;
  /** اسم الشكل الجديد بالعربية (اختياري) */
  rageNameAr?: string;
  /** تفعيل مرة واحدة فقط في المباراة، أو في كل خسارة */
  oncePer: 'match' | 'unlimited';
}

export type RageOverridesMap = Record<string, RageModeData>;

/** تحميل كل إعدادات وضع الغضب المحفوظة */
export async function getRageOverrides(): Promise<RageOverridesMap> {
  try {
    const raw = await AsyncStorage.getItem(RAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as RageOverridesMap;
  } catch {
    return {};
  }
}

/** حفظ إعدادات كرت واحد */
export async function saveRageOverride(cardId: string, data: RageModeData): Promise<void> {
  try {
    const current = await getRageOverrides();
    current[cardId] = data;
    await AsyncStorage.setItem(RAGE_KEY, JSON.stringify(current));
  } catch {
    // تجاهل أخطاء الحفظ بصمت
  }
}

/** حذف إعدادات كرت معيّن */
export async function deleteRageOverride(cardId: string): Promise<void> {
  try {
    const current = await getRageOverrides();
    delete current[cardId];
    await AsyncStorage.setItem(RAGE_KEY, JSON.stringify(current));
  } catch {}
}

/** مسح كل إعدادات الغضب */
export async function clearAllRageOverrides(): Promise<void> {
  try {
    await AsyncStorage.removeItem(RAGE_KEY);
  } catch {}
}
