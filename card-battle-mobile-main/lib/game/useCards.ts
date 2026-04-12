/**
 * useCards — Single source of truth for card data.
 *
 * Merges ALL_CARDS (static) + custom cards (AsyncStorage) + gallery edits + rage overrides.
 * Every screen that needs cards should call useCards() instead of
 * reading ALL_CARDS directly, so gallery changes propagate everywhere.
 *
 * Usage:
 *   const cards = useCards();           // all cards, edits applied
 *   const cards = useCards([id1,id2]);  // filtered subset
 */

import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ALL_CARDS } from './cards-data-exports';
import { loadCustomCards } from './custom-cards-store';
import { Card } from './types';
import { getRageOverrides } from './rage-store';

/** Must match CARD_EDITS_KEY in cards-gallery.tsx */
export const CARD_EDITS_KEY = 'card_edits_v1';

/**
 * Deduplicate cards by id — last occurrence wins.
 * custom cards override base cards with the same id.
 */
function dedup(cards: Card[]): Card[] {
  return Object.values(
    cards.reduce<Record<string, Card>>((acc, card) => {
      acc[card.id] = card;
      return acc;
    }, {})
  );
}

/**
 * Returns ALL_CARDS + custom cards merged with:
 *  1. Gallery edits (attack, defense, nameAr, rarity, etc.)
 *  2. Rage mode overrides
 */
export async function getCardsWithEdits(): Promise<Card[]> {
  try {
    const [customCards, rawEdits, rageMap] = await Promise.all([
      loadCustomCards(),
      AsyncStorage.getItem(CARD_EDITS_KEY),
      getRageOverrides(),
    ]);

    // custom cards تغلب على base cards بنفس الكي
    const unique = dedup([...ALL_CARDS, ...customCards]);
    const editsMap: Record<string, Partial<Card>> = rawEdits ? JSON.parse(rawEdits) : {};

    return unique.map(c => {
      let merged = editsMap[c.id] ? { ...c, ...editsMap[c.id] } : c;
      if (rageMap[c.id]) merged = { ...merged, rageMode: rageMap[c.id] };
      return merged;
    });
  } catch {
    return dedup(ALL_CARDS);
  }
}

/**
 * React hook — returns all cards (base + custom) with edits + rage overrides applied.
 * @param ids  Optional card IDs to filter. Omit to get all cards.
 */
export function useCards(ids?: string[]): Card[] {
  const [cards, setCards] = useState<Card[]>(
    () => {
      const unique = dedup(ALL_CARDS);
      return ids ? unique.filter(c => ids.includes(c.id)) : unique;
    }
  );

  useEffect(() => {
    let cancelled = false;
    getCardsWithEdits().then(merged => {
      if (cancelled) return;
      setCards(ids ? merged.filter(c => ids.includes(c.id)) : merged);
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids?.join(',')]);

  return cards;
}
