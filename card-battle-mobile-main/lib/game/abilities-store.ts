/**
 * abilities-store.ts
 * مخزن بسيط لحفظ القدرات المعطّلة في AsyncStorage.
 * يُستخدم في شاشة القدرات وفي game-context لاستثنائها من اللعب.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'disabled_abilities_v1';

/** اقرأ مجموعة الـ IDs المعطّلة */
export async function getDisabledAbilityIds(): Promise<Set<number>> {
<<<<<<< HEAD
    try {
        const raw = await AsyncStorage.getItem(KEY);
        if (!raw) return new Set();
        const arr = JSON.parse(raw) as number[];
        return new Set(arr);
    } catch {
        return new Set();
    }
=======
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as number[];
    return new Set(arr);
  } catch {
    return new Set();
  }
>>>>>>> 765f6de734d6ad6d1dd61f8dfa220559988ac639
}

/** احفظ مجموعة الـ IDs المعطّلة */
export async function saveDisabledAbilityIds(ids: Set<number>): Promise<void> {
<<<<<<< HEAD
    try {
        await AsyncStorage.setItem(KEY, JSON.stringify([...ids]));
    } catch { }
=======
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify([...ids]));
  } catch {}
>>>>>>> 765f6de734d6ad6d1dd61f8dfa220559988ac639
}
