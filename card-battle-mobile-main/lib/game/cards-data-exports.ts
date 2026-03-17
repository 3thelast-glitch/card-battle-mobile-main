/**
 * cards-data-exports.ts
 *
 * يُوفّر exports مطلوبة من ملفات أخرى:
 *   - ALL_CARDS            ← bot-ai.ts
 *   - getElementAdvantage  ← bot-ai.ts
 *   - determineRoundWinner ← game-context.tsx
 */

import { CARDS_BATCH_1 } from './cards-data';
import {
  Card,
  Element,
  ElementAdvantage,
  Effect,
  ELEMENT_ADVANTAGES,
  ELEMENT_WEAKNESSES,
  ELEMENT_MULTIPLIER,
} from './types';

// ─── ALL_CARDS ────────────────────────────────────────────────────────────────
export const ALL_CARDS: Card[] = [...CARDS_BATCH_1];

// ─── getElementAdvantage ─────────────────────────────────────────────────────
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
interface RoundWinnerResult {
  winner: 'player' | 'bot' | 'draw';
  playerDamage: number;
  botDamage: number;
  playerBaseDamage: number;
  botBaseDamage: number;
  playerElementAdvantage: ElementAdvantage;
  botElementAdvantage: ElementAdvantage;
}

export function determineRoundWinner(
  playerCard: Card,
  botCard: Card,
  playerEffects: Effect[] = [],
  botEffects: Effect[] = [],
  _abilitiesEnabled = true,
): RoundWinnerResult {
  const playerAdv = getElementAdvantage(playerCard.element, botCard.element);
  const botAdv    = getElementAdvantage(botCard.element,   playerCard.element);

  // تطبيق stat modifiers من التأثيرات
  let playerAtk = playerCard.attack;
  let playerDef = playerCard.defense;
  let botAtk    = botCard.attack;
  let botDef    = botCard.defense;

  for (const e of playerEffects) {
    if (e.kind === 'statModifier') {
      const d = e.data as { stat?: string; amount?: number } | undefined;
      if (d?.stat === 'attack')  playerAtk = Math.max(0, playerAtk + (d.amount ?? 0));
      if (d?.stat === 'defense') playerDef = Math.max(0, playerDef + (d.amount ?? 0));
    }
  }
  for (const e of botEffects) {
    if (e.kind === 'statModifier') {
      const d = e.data as { stat?: string; amount?: number } | undefined;
      if (d?.stat === 'attack')  botAtk = Math.max(0, botAtk + (d.amount ?? 0));
      if (d?.stat === 'defense') botDef = Math.max(0, botDef + (d.amount ?? 0));
    }
  }

  const playerRaw = playerAtk * ELEMENT_MULTIPLIER[playerAdv];
  const botRaw    = botAtk    * ELEMENT_MULTIPLIER[botAdv];

  const playerBaseDamage = Math.max(0, Math.floor(playerRaw));
  const botBaseDamage    = Math.max(0, Math.floor(botRaw));

  const playerDamage = Math.max(0, Math.floor(playerRaw - botDef));
  const botDamage    = Math.max(0, Math.floor(botRaw    - playerDef));

  let winner: 'player' | 'bot' | 'draw';
  if (playerDamage > botDamage)       winner = 'player';
  else if (botDamage > playerDamage)  winner = 'bot';
  else                                winner = 'draw';

  return {
    winner,
    playerDamage,
    botDamage,
    playerBaseDamage,
    botBaseDamage,
    playerElementAdvantage: playerAdv,
    botElementAdvantage: botAdv,
  };
}
