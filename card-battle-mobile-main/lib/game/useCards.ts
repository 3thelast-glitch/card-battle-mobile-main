/**
 * useCards — Single source of truth for card data.
 *
 * cards-gallery saves edits to AsyncStorage under CARD_EDITS_KEY.
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
import { Card } from './types';
import { getRageOverrides } from './rage-store';

/** Must match CARD_EDITS_KEY in cards-gallery.tsx */
export const CARD_EDITS_KEY = 'card_edits_v1';

/**
 * Deduplicate cards by id — last occurrence wins (same as gallery).
 * This removes duplicates coming from CARDS_BATCH_* + ANIME_CARDS.
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
 * Returns unique ALL_CARDS merged with:
 *  1. Gallery edits (attack, defense, nameAr, rarity, etc.)
 *  2. Rage mode overrides (rageMode data from rage-store)
 */
export async function getCardsWithEdits(): Promise<Card[]> {
  const unique = dedup(ALL_CARDS);
  try {
    const [rawEdits, rageMap] = await Promise.all([
      AsyncStorage.getItem(CARD_EDITS_KEY),
      getRageOverrides(),
    ]);

    const editsMap: Record<string, Partial<Card>> = rawEdits ? JSON.parse(rawEdits) : {};

    return unique.map(c => {
      let merged = editsMap[c.id] ? { ...c, ...editsMap[c.id] } : c;
      if (rageMap[c.id]) {
        merged = { ...merged, rageMode: rageMap[c.id] };
      }
      return merged;
    });
  } catch {
    return unique;
  }
}

/**
 * React hook — returns unique cards with gallery edits + rage overrides applied.
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
