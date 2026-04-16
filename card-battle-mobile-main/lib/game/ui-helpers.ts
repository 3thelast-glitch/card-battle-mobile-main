import { Effect, Side } from './types';

export type PredictionSelections = Record<number, 'win' | 'loss'>;

export const getUpcomingPredictionRounds = (currentRound: number, totalRounds: number) =>
  [currentRound + 1, currentRound + 2].filter((round) => round <= totalRounds);

export const getRemainingRounds = (currentRound: number, totalRounds: number) =>
  Array.from(
    { length: Math.max(0, totalRounds - currentRound) },
    (_, index) => currentRound + 1 + index
  );

export const isPredictionComplete = (
  upcomingRounds: number[],
  selections: PredictionSelections
) =>
  upcomingRounds.length > 0 && upcomingRounds.every((round) => selections[round]);

export const buildPredictionSummary = (activeEffects: Effect[], sourceSide: Side = 'player') => {
  const predictionEffect = activeEffects.find(
    (effect) => effect.kind === 'prediction' && effect.sourceSide === sourceSide
  );
  const predictions =
    (predictionEffect?.data as { predictions?: Record<number, 'win' | 'loss'> } | undefined)
      ?.predictions ?? {};
  const entries = Object.entries(predictions)
    .map(([round, outcome]) => ({ round: Number(round), outcome }))
    .filter((entry) => !Number.isNaN(entry.round))
    .sort((a, b) => a.round - b.round)
    .map((entry) => `Round ${entry.round}: ${entry.outcome === 'win' ? 'Win' : 'Loss'}`);
  return entries.length > 0 ? entries.join(' | ') : '';
};

/**
 * يحسب قيم الهجوم والدفاع الفعلية للكرت بعد تطبيق كل التأثيرات النشطة.
 * - statModifier: يعدّل هجوم أو دفاع كرت محدد (مثال: الخسوف = هجوم الخصم → 0)
 * - fortify: يعدّل الهجوم والدفاع معاً (مثال: التدعيم، التقليص)
 */
export function getEffectiveStats(
  baseAttack: number,
  baseDefense: number,
  effects: Effect[],
  side: Side
): { attack: number; defense: number } {
  let atk = baseAttack;
  let def = baseDefense;

  for (const eff of effects) {
    if (eff.targetSide !== side && eff.targetSide !== 'all') continue;

    const data = eff.data ?? {};

    switch (eff.kind) {
      case 'statModifier':
        if (data.stat === 'attack')  atk = Math.max(0, atk + (data.delta as number ?? 0));
        if (data.stat === 'defense') def = Math.max(0, def + (data.delta as number ?? 0));
        break;
      case 'fortify':
        atk = Math.max(0, atk + (data.attackDelta as number ?? 0));
        def = Math.max(0, def + (data.defenseDelta as number ?? 0));
        break;
      default:
        break;
    }
  }

  return { attack: atk, defense: def };
}
