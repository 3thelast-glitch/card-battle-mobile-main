/**
 * cards-data-exports.ts
 *
 * يُوفّر exports مطلوبة من ملفات أخرى:
 *   - ALL_CARDS                 ← bot-ai.ts
 *   - getElementAdvantage       ← bot-ai.ts
 *   - applyElementalReactions   ← منطق المعركة (داخلي)
 *   - determineRoundWinner      ← game-context.tsx
 */

import { CARDS_BATCH_1 } from './cards-batch-1-fixed';
import { CARDS_BATCH_2 } from './cards-batch-2-fixed';
import { CARDS_BATCH_3 } from './cards-batch-3-fixed';
import { CARDS_BATCH_4 } from './cards-batch-4-fixed';
import { CARDS_BATCH_5 } from './cards-batch-5-fixed';
import { CARDS_BATCH_6 } from './cards-batch-6-fixed';
import { ANIME_CARDS } from './anime-cards-data';
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
export const ALL_CARDS: Card[] = [
  ...CARDS_BATCH_1,
  ...CARDS_BATCH_2,
  ...CARDS_BATCH_3,
  ...CARDS_BATCH_4,
  ...CARDS_BATCH_5,
  ...CARDS_BATCH_6,
  ...ANIME_CARDS,
];

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

// ─── applyElementalReactions ─────────────────────────────────────────────────
//
// تُطبّق Buffs/Debuffs على نسخ مؤقتة — لا تعدّل البيانات الأصلية.
//
// جدول التفاعلات الكامل (7 تفاعلات):
// ┌─────────────────────────────┬───────────────────────────────────────────┐
// │ التفاعل                     │ التأثير                                   │
// ├─────────────────────────────┼───────────────────────────────────────────┤
// │ 1. ماء   ضد نار   (إخماد)  │ مهاجم: +4 hp    │ مدافع: −2 attack       │
// │ 2. برق   ضد ماء   (صعق)    │ مهاجم: +3 atk   │ مدافع: −2 atk, −1 def  │
// │ 3. برق   ضد ريح   (شحن)    │ مهاجم: +2 atk   │ مدافع: −2 def          │
// │ 4. أرض   ضد برق  (تأريض)  │ مهاجم: +4 def   │ مدافع: −3 attack       │
// │ 5. نار   ضد أرض  (صهر)    │ مهاجم: +2 atk   │ مدافع: −3 def          │
// │ 6. ريح   ضد أرض  (تعرية)  │ مهاجم: +3 atk   │ مدافع: −2 def          │
// │ 7. أرض   ضد ماء  (تجفيف)  │ مهاجم: +2 hp    │ مدافع: −2 def          │
// └─────────────────────────────┴───────────────────────────────────────────┘
//
export function applyElementalReactions(
  attacker: { attack: number; defense: number; hp?: number; element: Element },
  defender: { attack: number; defense: number; hp?: number; element: Element },
): void {
  const atk = attacker.element;
  const def = defender.element;

  // ─ 1. ماء ضد نار (إخماد) ────────────────────────────────────────────
  if (atk === 'water' && def === 'fire') {
    attacker.hp = (attacker.hp ?? 0) + 4;
    defender.attack = Math.max(1, defender.attack - 2);
    return;
  }

  // ─ 2. برق ضد ماء (صعق) ──────────────────────────────────────────────
  if (atk === 'lightning' && def === 'water') {
    attacker.attack += 3;
    defender.attack  = Math.max(1, defender.attack  - 2);
    defender.defense = Math.max(0, defender.defense - 1);
    return;
  }

  // ─ 3. برق ضد ريح (شحن) ──────────────────────────────────────────────
  if (atk === 'lightning' && def === 'wind') {
    attacker.attack += 2;
    defender.defense = Math.max(0, defender.defense - 2);
    return;
  }

  // ─ 4. أرض ضد برق (تأريض) ────────────────────────────────────────────
  if (atk === 'earth' && def === 'lightning') {
    attacker.defense += 4;
    defender.attack = Math.max(1, defender.attack - 3);
    return;
  }

  // ─ 5. نار ضد أرض (صهر الصخور) ───────────────────────────────────────
  if (atk === 'fire' && def === 'earth') {
    attacker.attack += 2;
    defender.defense = Math.max(0, defender.defense - 3);
    return;
  }

  // ─ 6. ريح ضد أرض (تعرية) ─────────────────────────────────────────────
  if (atk === 'wind' && def === 'earth') {
    attacker.attack += 3;
    defender.defense = Math.max(0, defender.defense - 2);
    return;
  }

  // ─ 7. أرض ضد ماء (تجفيف) ─────────────────────────────────────────────
  if (atk === 'earth' && def === 'water') {
    attacker.hp      = (attacker.hp ?? 0) + 2;
    defender.defense = Math.max(0, defender.defense - 2);
    return;
  }
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
  const botAdv    = getElementAdvantage(botCard.element,    playerCard.element);

  // ─ نسخ مؤقتة لتطبيق التفاعلات دون تعديل البيانات الأصلية
  const p = { attack: playerCard.attack, defense: playerCard.defense, hp: playerCard.hp, element: playerCard.element };
  const b = { attack: botCard.attack,    defense: botCard.defense,    hp: botCard.hp,    element: botCard.element };

  applyElementalReactions(p, b); // تفاعل لاعب على بوت
  applyElementalReactions(b, p); // تفاعل بوت على لاعب

  let playerAtk = p.attack;
  let playerDef = p.defense;
  let botAtk    = b.attack;
  let botDef    = b.defense;

  // ─ تطبيق تأثيرات القدرات
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
  if      (playerDamage > botDamage) winner = 'player';
  else if (botDamage > playerDamage) winner = 'bot';
  else                               winner = 'draw';

  return {
    winner,
    playerDamage,
    botDamage,
    playerBaseDamage,
    botBaseDamage,
    playerElementAdvantage: playerAdv,
    botElementAdvantage:    botAdv,
  };
}
