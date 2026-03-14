/**
 * Bot Brain v2 — Utility AI
 *
 * نظام قرار مبني على Utility Scoring:
 *  1. يحسب لكل بطاقة متاحة درجة utility من عدة محاور
 *  2. يقيّم كل قدرة متاحة حسب التوقيت والحاجة
 *  3. يغيّر mode (هجومي ؏ متوازن ؏ حذر) حسب فارق النقاط
 *  4. يحتفظ بذاكرة خفيفة عن أنماط اللاعب
 *  5. يضيف عشوائية خفيفة حتى لا يكون متوقعا تماماً
 */

import { Card, GameState, AbilityType, AbilityState, RoundResult } from './types';
import { ALL_CARDS, getElementAdvantage } from './cards-data';
import type { DifficultyLevel } from '@/app/screens/difficulty';

// ───────────────────────── Types ─────────────────────────
export type BotMode = 'aggressive' | 'balanced' | 'safe';

export interface UtilityBreakdown {
  winChance:     number; // فرصة الفوز بهذه الجولة
  damage:        number; // قيمة الضرر المباشر
  element:       number; // أفضلية العنصر
  roundPressure: number; // أهمية هذه الجولة
  saveAbility:   number; // قيمة حفظ القدرة لاحقاً
  risk:          number; // المخاطرة
}

export interface BotMemory {
  playerWinStreak:     number;  // كم جولة ربحها اللاعب متتالية
  playerUsedAbilities: AbilityType[];
  playerFavoredElements: Record<string, number>; // element → عدد المرات
  botLossStreak:       number;
  totalRoundsPlayed:   number;
}

export interface BotDecision {
  useAbility:   boolean;
  abilityType?: AbilityType;
  mode:         BotMode;
  score:        number;
  breakdown:    UtilityBreakdown;
}

// ───────────────────────── Mode Weights ─────────────────────────
type WeightMap = Record<keyof UtilityBreakdown, number>;

const WEIGHTS: Record<BotMode, WeightMap> = {
  aggressive: {
    winChance:     0.30,
    damage:        0.28,
    element:       0.14,
    roundPressure: 0.14,
    saveAbility:   0.04,
    risk:          0.10,
  },
  balanced: {
    winChance:     0.34,
    damage:        0.22,
    element:       0.14,
    roundPressure: 0.12,
    saveAbility:   0.10,
    risk:          0.08,
  },
  safe: {
    winChance:     0.36,
    damage:        0.16,
    element:       0.14,
    roundPressure: 0.10,
    saveAbility:   0.16,
    risk:          0.08,
  },
};

// ───────────────────────── Memory (singleton per session) ──────────────────

let _memory: BotMemory = {
  playerWinStreak:      0,
  playerUsedAbilities:  [],
  playerFavoredElements: {},
  botLossStreak:        0,
  totalRoundsPlayed:    0,
};

/** استدعاء الذاكرة الحالية (readonly snapshot) */
export function getBotMemory(): Readonly<BotMemory> {
  return { ..._memory };
}

/** تحديث الذاكرة بعد كل جولة */
export function updateBotMemory(result: RoundResult, playerUsedAbility?: AbilityType): void {
  _memory.totalRoundsPlayed++;

  if (result.winner === 'player') {
    _memory.playerWinStreak++;
    _memory.botLossStreak++;
  } else {
    _memory.playerWinStreak = 0;
    _memory.botLossStreak   = 0;
  }

  // تتبع أكثر عناصر يستخدمها اللاعب
  const el = result.playerCard.element;
  _memory.playerFavoredElements[el] = (_memory.playerFavoredElements[el] ?? 0) + 1;

  if (playerUsedAbility) {
    _memory.playerUsedAbilities.push(playerUsedAbility);
  }
}

/** إعادة ضبط الذاكرة (بداية مباراة جديدة) */
export function resetBotMemory(): void {
  _memory = {
    playerWinStreak:      0,
    playerUsedAbilities:  [],
    playerFavoredElements: {},
    botLossStreak:        0,
    totalRoundsPlayed:    0,
  };
}

// ───────────────────────── Helpers ─────────────────────────

function clamp(v: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, v));
}

function cardPower(card: Card): number {
  return card.attack + card.defense + card.speed;
}

function cardPowerAgainst(attacker: Card, defender: Card): number {
  const base = cardPower(attacker);
  const adv  = getElementAdvantage(attacker.element, defender.element);
  if (adv === 'strong') return base * 1.5;
  if (adv === 'weak')   return base * 0.7;
  return base;
}

// ───────────────────────── Mode detection ─────────────────────────

export function chooseBotMode(
  playerScore: number,
  botScore: number,
  currentRound: number,
  totalRounds: number,
): BotMode {
  const diff        = botScore - playerScore;
  const roundsLeft  = totalRounds - currentRound;
  const nearEnd     = roundsLeft <= 2;

  if (diff <= -2)              return 'aggressive'; // متأخر بكثير
  if (diff >= 2 && nearEnd)   return 'safe';       // متقدم قرب النهاية
  if (diff >= 1 && nearEnd)   return 'safe';
  return 'balanced';
}

// ───────────────────────── Utility scoring ─────────────────────────

function scoreUtility(breakdown: UtilityBreakdown, mode: BotMode): number {
  const w = WEIGHTS[mode];
  return (
    breakdown.winChance     * w.winChance     +
    breakdown.damage        * w.damage        +
    breakdown.element       * w.element       +
    breakdown.roundPressure * w.roundPressure +
    breakdown.saveAbility   * w.saveAbility   +
    breakdown.risk          * w.risk
  );
}

/**
 * تقييم لعب بطاقة ضد بطاقة الخصم
 */
function evaluateCardVs(
  botCard:     Card,
  playerCard:  Card,
  currentRound: number,
  totalRounds:  number,
  botScore:    number,
  playerScore: number,
  mode:        BotMode,
): UtilityBreakdown {
  const botPower    = cardPowerAgainst(botCard,    playerCard);
  const playerPower = cardPowerAgainst(playerCard, botCard);
  const adv         = getElementAdvantage(botCard.element, playerCard.element);
  const roundsLeft  = totalRounds - currentRound;

  // winChance: normalized score
  const totalPower = botPower + playerPower;
  const winChance  = totalPower > 0 ? clamp(botPower / totalPower) : 0.5;

  // damage: normalized between 0 and 1 relative to max possible
  const maxPossible = Math.max(...ALL_CARDS.map(c => c.attack + c.defense + c.speed)) * 1.5;
  const damage = clamp(botPower / maxPossible);

  // element advantage
  const element = adv === 'strong' ? 1.0 : adv === 'weak' ? 0.0 : 0.5;

  // roundPressure: كلما كان الفارق كبيراً والوقت ضيقاً، الجولة أهم
  const scoreDiff   = Math.abs(botScore - playerScore);
  const urgencyBase = scoreDiff >= 2 && roundsLeft <= 2 ? 1.0
                    : scoreDiff >= 1 && roundsLeft <= 3 ? 0.75
                    : roundsLeft <= 2 ? 0.6
                    : 0.4;
  const roundPressure = clamp(urgencyBase);

  // saveAbility: إذا كانت النتيجة محسومة بدون قدرة، احتفظ بالقدرة
  const saveAbility = winChance > 0.70 ? 0.8 : winChance > 0.55 ? 0.5 : 0.2;

  // risk: أعلى إذا كان البوت متأخراً (aggressive mode)
  const risk = mode === 'aggressive' ? clamp(1 - winChance + 0.3) : clamp(1 - winChance);

  return { winChance, damage, element, roundPressure, saveAbility, risk };
}

// ───────────────────────── Ability scoring ─────────────────────────

/**
 * هل التوقيت مناسب لاستخدام هذه القدرة الآن؟
 * يرجع قيمة 0–1 (أعلى = استخدمها الآن)
 */
export function evaluateAbilityTiming(
  ability:      AbilityType,
  currentRound: number,
  totalRounds:  number,
  botScore:     number,
  playerScore:  number,
  mode:         BotMode,
  memory:       BotMemory,
): number {
  const roundsLeft  = totalRounds - currentRound;
  const scoreDiff   = botScore - playerScore;   // موجب = بوت متقدم
  const losing      = scoreDiff < 0;
  const closeMatch  = Math.abs(scoreDiff) <= 1;

  // ── قدرات التنبؤ والفخاخ ──
  // أفضل في الجولات الوسطى والمتأخرة لأن أثرها يمتد لأكثر من جولة
  if (['LogicalEncounter','Eclipse','Trap','Pool'].includes(ability)) {
    if (roundsLeft < 2)  return 0.1; // متأخر جداً
    if (roundsLeft <= 4) return losing || closeMatch ? 0.85 : 0.55;
    return 0.35; // باكيراً، احتفظ بها
  }

  // ── قدرات الإنقاذ ──
  if (['Rescue','Popularity','Penetration'].includes(ability)) {
    if (losing && roundsLeft <= 3) return 0.90;
    if (losing)                    return 0.70;
    if (closeMatch)                return 0.50;
    return 0.20; // متقدم، لا تستخدمها الآن
  }

  // ── قدرات حومية ──
  if (['Protection','Shield','Fortify'].includes(ability)) {
    if (losing && roundsLeft <= 2) return 0.80;
    if (closeMatch)                return 0.60;
    return 0.30;
  }

  // ── قدرات هجومية ──
  if (['Reinforcement','Wipe','HalvePoints','Disaster','Explosion','DoublePoints'].includes(ability)) {
    if (mode === 'aggressive') return losing ? 0.92 : 0.70;
    if (mode === 'balanced')   return closeMatch ? 0.65 : 0.40;
    return 0.25; // safe mode: حافظ عليها
  }

  // ── قدرات إدارية (استدعاء، تحويل...) ──
  if (['Recall','Arise','Revive','Shambles','Sacrifice'].includes(ability)) {
    if (losing && closeMatch) return 0.75;
    if (losing)               return 0.60;
    return 0.35;
  }

  // ── قدرات خاصة ──
  if (['DoubleOrNothing','Dilemma','Suicide'].includes(ability)) {
    if (mode === 'aggressive' && losing) return 0.80;
    return 0.30;
  }

  // افتراضي لباقي القدرات
  return closeMatch ? 0.55 : losing ? 0.65 : 0.35;
}

// ───────────────────────── Main decision engine ─────────────────────────

/**
 * الدالة الرئيسية: هل يستخدم البوت قدرة هذه الجولة؟ وأيها؟
 */
export function decideBotAbility(
  botAbilities: AbilityState[],
  playerCard:   Card,
  gameState:    GameState,
  difficulty:   DifficultyLevel,
): BotDecision {
  const { currentRound, totalRounds, botScore, playerScore } = gameState;
  const mode     = chooseBotMode(playerScore, botScore, currentRound, totalRounds);
  const memory   = getBotMemory();

  // البطاقة الحالية للبوت
  const botCard = gameState.botDeck[currentRound];

  // التقييم بدون قدرة
  const noAbilityBreakdown = evaluateCardVs(
    botCard, playerCard,
    currentRound, totalRounds,
    botScore, playerScore, mode,
  );
  const noAbilityScore = scoreUtility(noAbilityBreakdown, mode);

  // القدرات المتاحة
  const available = botAbilities.filter(a => !a.used);

  if (available.length === 0 || difficulty <= 1) {
    // Easy: لا يستخدم قدرات إطلاقاً
    return { useAbility: false, mode, score: noAbilityScore, breakdown: noAbilityBreakdown };
  }

  // جودة أفضل قدرة متاحة
  let bestAbilityScore = 0;
  let bestAbility: AbilityType | undefined;

  for (const ab of available) {
    const timing = evaluateAbilityTiming(
      ab.type,
      currentRound, totalRounds,
      botScore, playerScore,
      mode, memory,
    );

    // للمستويات الصعبة فقط يأخذ timing بالاعتبار
    const effectiveScore = difficulty >= 4
      ? noAbilityScore * (1 - timing) + timing     // hard: يوازن بين القيم
      : timing * 0.7;                              // medium: يعتمد أكثر على التوقيت

    if (effectiveScore > bestAbilityScore) {
      bestAbilityScore = effectiveScore;
      bestAbility      = ab.type;
    }
  }

  // هل استخدام القدرة أجدى من عدمها؟
  const threshold = mode === 'aggressive' ? 0.50
                  : mode === 'safe'       ? 0.68
                  : 0.58;

  const shouldUse = bestAbility !== undefined && bestAbilityScore > threshold;

  // عشوائية خفيفة حسب الصعوبة
  const noise = difficulty <= 2 ? (Math.random() - 0.5) * 0.15
              : difficulty <= 3 ? (Math.random() - 0.5) * 0.08
              : 0;

  const finalUse = shouldUse && (bestAbilityScore + noise) > threshold;

  return {
    useAbility:  finalUse,
    abilityType: finalUse ? bestAbility : undefined,
    mode,
    score:       bestAbilityScore,
    breakdown:   noAbilityBreakdown,
  };
}

// ───────────────────────── Card selection (per difficulty) ─────────────────────────

function pickRandom(count: number): Card[] {
  return [...ALL_CARDS].sort(() => Math.random() - 0.5).slice(0, count);
}

function pickBalanced(count: number): Card[] {
  const top = [...ALL_CARDS]
    .sort((a, b) => cardPower(b) - cardPower(a))
    .slice(0, Math.ceil(ALL_CARDS.length / 2));
  const shuffled = top.sort(() => Math.random() - 0.5);
  return Array.from({ length: count }, (_, i) => shuffled[i % shuffled.length]);
}

function pickSmart(count: number, playerCards: Card[]): Card[] {
  const memory    = getBotMemory();
  const selected: Card[] = [];
  const pool      = [...ALL_CARDS];

  for (let i = 0; i < count; i++) {
    const playerCard = playerCards[i % playerCards.length];
    const available  = pool.filter(c => !selected.some(s => s.id === c.id));

    // ندرج كل بطاقة حسب utility حقيقي
    const scored = available.map(card => ({
      card,
      score: cardPowerAgainst(card, playerCard)
        // مكافأة إذا كان العنصر مضاداً لأكثر عنصر يفضله اللاعب
        + (card.element !== playerCard.element
            && (memory.playerFavoredElements[playerCard.element] ?? 0) >= 2
            ? 10 : 0),
    }));
    scored.sort((a, b) => b.score - a.score);
    selected.push(scored[0].card);
  }

  return selected;
}

export function getBotCards(
  count:      number,
  difficulty: DifficultyLevel,
  playerCards?: Card[],
): Card[] {
  if (difficulty <= 1) return pickRandom(count);
  if (difficulty <= 3) return pickBalanced(count);
  return pickSmart(count, playerCards ?? []);
}

// ───────────────────────── Strategy label ─────────────────────────

export function getBotStrategyDescription(difficulty: DifficultyLevel): string {
  switch (difficulty) {
    case 1: return 'البوت يختار عشوائياً بدون استراتيجية';
    case 2: return 'البوت يختار بطاقات متوازنة مع بعض التفكير';
    case 3: return 'البوت يوازن بين الهجوم والدفاع ويستخدم القدرات بذكاء';
    case 4: return 'البوت يحسب utility لكل قرار ويغيّر أسلوبه حسب الموقف';
    case 5: return 'البوت يتذكر أنماطك، يضغط في الجولات الحرجة، ويحتفظ بقدراته للحظة المناسبة';
    default: return 'البوت يستخدم استراتيجية متوازنة';
  }
}
