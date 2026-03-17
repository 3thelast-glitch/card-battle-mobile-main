/**
 * cards-data-exports.ts
 *
 * يُوفّر ثلاثة exports مطلوبة من ملفات أخرى:
 *   - ALL_CARDS           ← bot-ai.ts
 *   - getElementAdvantage ← bot-ai.ts
 *   - determineRoundWinner← game-context.tsx
 */

import { CARDS_BATCH_1 } from './cards-data';
import {
  Card,
  Element,
  ElementAdvantage,
  ELEMENT_ADVANTAGES,
  ELEMENT_WEAKNESSES,
  ELEMENT_MULTIPLIER,
} from './types';

// ─── ALL_CARDS ────────────────────────────────────────────────────────────────
// يجمع كل الكروت من جميع الـ batches
export const ALL_CARDS: Card[] = [...CARDS_BATCH_1];

// ─── getElementAdvantage ─────────────────────────────────────────────────────
/**
 * تُعيد ما إذا كان عنصر المهاجم قوياً أو ضعيفاً أو محايداً ضد عنصر المدافع.
 */
export function getElementAdvantage(
  attacker: Element,
  defender: Element,
): ElementAdvantage {
  const advantages = ELEMENT_ADVANTAGES[attacker] ?? [];
  const weaknesses = ELEMENT_WEAKNESSES[attacker] ?? [];

  if (advantages.includes(defender)) return 'strong';
  if (weaknesses.includes(defender)) return 'weak';
  return 'neutral';
}

// ─── determineRoundWinner ─────────────────────────────────────────────────────
/**
 * تُحدّد الفائز في الجولة بناءً على الضرر الفعلي لكل طرف.
 *
 * الضرر = attack × multiplier(element)  minus  defense الخصم
 * إذا كان الضرر سالباً يُعامَل كصفر.
 */
export function determineRoundWinner(
  playerCard: Card,
  botCard: Card,
): { winner: 'player' | 'bot' | 'draw'; playerDamage: number; botDamage: number } {
  const playerAdv = getElementAdvantage(playerCard.element, botCard.element);
  const botAdv    = getElementAdvantage(botCard.element,   playerCard.element);

  const playerRaw    = playerCard.attack * ELEMENT_MULTIPLIER[playerAdv];
  const botRaw       = botCard.attack    * ELEMENT_MULTIPLIER[botAdv];

  const playerDamage = Math.max(0, Math.floor(playerRaw - botCard.defense));
  const botDamage    = Math.max(0, Math.floor(botRaw    - playerCard.defense));

  let winner: 'player' | 'bot' | 'draw';
  if (playerDamage > botDamage)       winner = 'player';
  else if (botDamage > playerDamage)  winner = 'bot';
  else                                winner = 'draw';

  return { winner, playerDamage, botDamage };
}
