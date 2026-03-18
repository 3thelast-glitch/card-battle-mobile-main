import { Card, AbilityType, ActiveEffect, GameState } from './types';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ✅ موحَّد مع abilities-store.ts
export const DISABLED_ABILITIES_KEY = 'disabled_abilities_v1';

export const ALL_ABILITIES: AbilityType[] = [
  'LogicalEncounter', 'Recall', 'Protection', 'Arise', 'Reinforcement',
  'Wipe', 'Purge', 'HalvePoints', 'Seal', 'DoubleOrNothing',
  'StarSuperiority', 'Reduction', 'Sacrifice', 'Popularity', 'Eclipse',
  'CancelAbility', 'Revive', 'Shambles', 'ConsecutiveLossBuff', 'Lifesteal',
  'Revenge', 'Suicide', 'Disaster', 'Compensation', 'Weakening',
  'Misdirection', 'StealAbility', 'Rescue', 'Trap', 'ConvertDebuffsToBuffs',
  'Sniping', 'Merge', 'DoubleNextCards', 'Deprivation', 'Greed',
  'Dilemma', 'Subhan', 'Propaganda', 'DoubleYourBuffs', 'Avatar',
  'Penetration', 'Pool', 'Conversion', 'Shield', 'SwapClass',
  'TakeIt', 'Skip', 'AddElement', 'Explosion', 'DoublePoints', 'ElementalMastery'
];

export const NAME_TO_ABILITY_TYPE: Record<string, AbilityType> = {
  'Logical Encounter': 'LogicalEncounter',
  'Recall': 'Recall',
  'Protection': 'Protection',
  'Wipe': 'Wipe',
  'Halve Points': 'HalvePoints',
  'Seal': 'Seal',
  'Reduction': 'Reduction',
  'Sacrifice': 'Sacrifice',
  'Suicide': 'Suicide',
  'Compensation': 'Compensation',
  'Arise': 'Arise',
  'Reinforcement': 'Reinforcement',
  'Purge': 'Purge',
  'Double Or Nothing': 'DoubleOrNothing',
  'Disaster': 'Disaster',
  'Rescue': 'Rescue',
  'Trap': 'Trap',
  'Sniping': 'Sniping',
  'Merge': 'Merge',
  'Revive': 'Revive',
  'Consecutive Loss Buff': 'ConsecutiveLossBuff',
  'Weakening': 'Weakening',
  'Subhan': 'Subhan',
  'Swap Class': 'SwapClass',
  'Lifesteal': 'Lifesteal',
  'Revenge': 'Revenge',
  'Popularity': 'Popularity',
  'Misdirection': 'Misdirection',
  'Steal Ability': 'StealAbility',
  'Convert Debuffs': 'ConvertDebuffsToBuffs',
  'Double Next Cards': 'DoubleNextCards',
  'Deprivation': 'Deprivation',
  'Greed': 'Greed',
  'Dilemma': 'Dilemma',
  'Propaganda': 'Propaganda',
  'Double Your Buffs': 'DoubleYourBuffs',
  'Avatar': 'Avatar',
  'Penetration': 'Penetration',
  'Pool': 'Pool',
  'Conversion': 'Conversion',
  'Shield': 'Shield',
  'Take It': 'TakeIt',
  'Skip': 'Skip',
  'Add Element': 'AddElement',
  'Explosion': 'Explosion',
  'Double Points': 'DoublePoints',
  'Star Superiority': 'StarSuperiority',
  'Eclipse': 'Eclipse',
  'Cancel Ability': 'CancelAbility',
  'Elemental Mastery': 'ElementalMastery',
  'Deprivation (Ability)': 'Deprivation',
};

let _disabledCache: Set<AbilityType> | null = null;

export async function loadDisabledAbilities(): Promise<Set<AbilityType>> {
  try {
    const raw = await AsyncStorage.getItem(DISABLED_ABILITIES_KEY);
    const arr: AbilityType[] = raw ? JSON.parse(raw) : [];
    _disabledCache = new Set(arr);
  } catch {
    _disabledCache = new Set();
  }
  return _disabledCache;
}

export function getDisabledAbilitiesCache(): Set<AbilityType> {
  return _disabledCache ?? new Set();
}

export async function saveDisabledAbilities(disabled: Set<AbilityType>): Promise<void> {
  _disabledCache = disabled;
  await AsyncStorage.setItem(DISABLED_ABILITIES_KEY, JSON.stringify([...disabled]));
}

export function getRandomAbilities(count: number): AbilityType[] {
  const disabled = getDisabledAbilitiesCache();
  const available = ALL_ABILITIES.filter(a => !disabled.has(a));
  if (available.length === 0) return [];
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

interface AbilityExecutionResult {
  newEffects: ActiveEffect[];
  newPlayerScore?: number;
  newBotScore?: number;
  playerDeckChange?: { index: number, newCard: Card };
  botDeckChange?: { index: number, newCard: Card };
}

export type AbilityExecutor = (
  state: GameState,
  isPlayer: boolean,
) => AbilityExecutionResult;

// ─────────────────────────────────────────────────────────
// دوال مساعدة: تطبيق تأثير على كل كروت الديك
// ─────────────────────────────────────────────────────────

/**
 * تطبق buff أو debuff على جميع كروت الديك بحسب نتيجة الجولة.
 * تُستخدم لـ: Reinforcement, Greed, Revenge, Compensation, Explosion, Weakening
 */
function applyDeckEffect(
  deck: Card[],
  target: 'player' | 'bot',
  stat: 'attack' | 'defense',
  delta: number,
  sourceAbility: AbilityType,
  currentRound: number,
): ActiveEffect[] {
  // نطبق بف واحد لكل كرت لم يُلعب بعد (index > currentRound)
  return deck
    .slice(currentRound + 1)
    .map((_, i) => ({
      type: delta > 0 ? 'buff' as const : 'debuff' as const,
      target,
      stat,
      value: delta,
      roundsLeft: deck.length - currentRound - 1 - i,
      sourceAbility,
    }));
}

export const abilityExecutors: Record<AbilityType, AbilityExecutor> = {

  // ──────────────────── لم يُنفّذ بعد (UI مطلوب) ────────────────────
  LogicalEncounter: () => ({ newEffects: [] }),
  Recall:           () => ({ newEffects: [] }),
  Arise:            () => ({ newEffects: [] }),
  Popularity:       () => ({ newEffects: [] }),
  Revive:           () => ({ newEffects: [] }),
  Sniping:          () => ({ newEffects: [] }),
  Subhan:           () => ({ newEffects: [] }),
  Propaganda:       () => ({ newEffects: [] }),
  CancelAbility:    () => ({ newEffects: [] }),
  Shambles:         () => ({ newEffects: [] }),
  Disaster:         () => ({ newEffects: [] }),
  StealAbility:     () => ({ newEffects: [] }),
  Rescue:           () => ({ newEffects: [] }),
  Trap:             () => ({ newEffects: [] }),
  Merge:            () => ({ newEffects: [] }),
  Dilemma:          () => ({ newEffects: [] }),
  Pool:             () => ({ newEffects: [] }),
  SwapClass:        () => ({ newEffects: [] }),
  Skip:             () => ({ newEffects: [] }),
  AddElement:       () => ({ newEffects: [] }),
  DoubleOrNothing:  () => ({ newEffects: [] }),
  Sacrifice:        () => ({ newEffects: [] }),
  ConsecutiveLossBuff: () => ({ newEffects: [] }),

  // ──────────────────── أولوية عالية ✔️ ────────────────────

  // Wipe: امسح كل التأثيرات السلبية على اللاعب فقط
  Wipe: (state, isPlayer) => {
    const myTarget = isPlayer ? 'player' : 'bot';
    const filtered = (state.activeEffects as unknown as ActiveEffect[]).filter(
      e => !(e.target === myTarget && e.type === 'debuff')
    );
    // نرجع التأثيرات المتبقية كـ newEffects بقيم صفر
    // (game-context يجب أن يستبدل activeEffects بالكامل بعد الفلترة)
    return { newEffects: filtered };
  },

  // Purge: امسح كل التأثيرات للجميع
  Purge: () => ({ newEffects: [] }),

  // Reinforcement: في حال الفوز +1 دفاع لكل كروتك القادمة
  Reinforcement: (state, isPlayer) => {
    const myTarget = isPlayer ? 'player' : 'bot';
    const myDeck   = isPlayer ? state.playerDeck : state.botDeck;
    const effects  = applyDeckEffect(myDeck, myTarget, 'defense', 1, 'Reinforcement', state.currentRound);
    return { newEffects: effects };
  },

  // Greed: في حال الفوز +1 هجوم لكل كروتك القادمة
  Greed: (state, isPlayer) => {
    const myTarget = isPlayer ? 'player' : 'bot';
    const myDeck   = isPlayer ? state.playerDeck : state.botDeck;
    const effects  = applyDeckEffect(myDeck, myTarget, 'attack', 1, 'Greed', state.currentRound);
    return { newEffects: effects };
  },

  // Revenge: في حال الخسارة +1 هجوم لكل كروتك القادمة
  Revenge: (state, isPlayer) => {
    const myTarget = isPlayer ? 'player' : 'bot';
    const myDeck   = isPlayer ? state.playerDeck : state.botDeck;
    const effects  = applyDeckEffect(myDeck, myTarget, 'attack', 1, 'Revenge', state.currentRound);
    return { newEffects: effects };
  },

  // Compensation: في حال الخسارة +1 دفاع لكل كروتك القادمة
  Compensation: (state, isPlayer) => {
    const myTarget = isPlayer ? 'player' : 'bot';
    const myDeck   = isPlayer ? state.playerDeck : state.botDeck;
    const effects  = applyDeckEffect(myDeck, myTarget, 'defense', 1, 'Compensation', state.currentRound);
    return { newEffects: effects };
  },

  // Explosion: في حال الخسارة -1 دفاع لكل كروت الخصم القادمة
  Explosion: (state, isPlayer) => {
    const opponentTarget = isPlayer ? 'bot' : 'player';
    const opponentDeck   = isPlayer ? state.botDeck : state.playerDeck;
    const effects = applyDeckEffect(opponentDeck, opponentTarget, 'defense', -1, 'Explosion', state.currentRound);
    return { newEffects: effects };
  },

  // Lifesteal: مع الفوز ترجع نقطة صحة (+1 score)
  Lifesteal: (state, isPlayer) => {
    if (isPlayer) {
      return { newEffects: [], newPlayerScore: state.playerScore + 1 };
    }
    return { newEffects: [], newBotScore: state.botScore + 1 };
  },

  // Suicide: مع الخسارة ينقص الخصم نقطة صحة (-1 score للخصم)
  Suicide: (state, isPlayer) => {
    if (isPlayer) {
      const newScore = Math.max(0, state.botScore - 1);
      return { newEffects: [], newBotScore: newScore };
    }
    const newScore = Math.max(0, state.playerScore - 1);
    return { newEffects: [], newPlayerScore: newScore };
  },

  // Weakening: في حال الخسارة -1 هجوم لكل كروت الخصم القادمة
  Weakening: (state, isPlayer) => {
    const opponentTarget = isPlayer ? 'bot' : 'player';
    const opponentDeck   = isPlayer ? state.botDeck : state.playerDeck;
    const effects = applyDeckEffect(opponentDeck, opponentTarget, 'attack', -1, 'Weakening', state.currentRound);
    return { newEffects: effects };
  },

  // ──────────────────── أولوية متوسطة ✔️ ────────────────────

  // TakeIt: أعطِ كل النيرفات التي عليك للخصم
  TakeIt: (state, isPlayer) => {
    const myTarget       = isPlayer ? 'player' : 'bot';
    const opponentTarget = isPlayer ? 'bot' : 'player';
    const effects = (state.activeEffects as unknown as ActiveEffect[])
      .filter(e => e.target === myTarget && e.type === 'debuff')
      .map(e => ({ ...e, target: opponentTarget, sourceAbility: 'TakeIt' as AbilityType }));
    return { newEffects: effects };
  },

  // ConvertDebuffsToBuffs: حوّل النيرفات عليك إلى بفات
  ConvertDebuffsToBuffs: (state, isPlayer) => {
    const myTarget = isPlayer ? 'player' : 'bot';
    const converted = (state.activeEffects as unknown as ActiveEffect[])
      .filter(e => e.target === myTarget && e.type === 'debuff')
      .map(e => ({ ...e, type: 'buff' as const, value: Math.abs(e.value), sourceAbility: 'ConvertDebuffsToBuffs' as AbilityType }));
    return { newEffects: converted };
  },

  // DoubleYourBuffs: دبل كل البفات الحالية لك
  DoubleYourBuffs: (state, isPlayer) => {
    const myTarget = isPlayer ? 'player' : 'bot';
    const doubled = (state.activeEffects as unknown as ActiveEffect[])
      .filter(e => e.target === myTarget && e.type === 'buff')
      .map(e => ({ ...e, value: e.value * 2, sourceAbility: 'DoubleYourBuffs' as AbilityType }));
    return { newEffects: doubled };
  },

  // Conversion: حوّل بفات الخصم إلى نيرفات
  Conversion: (state, isPlayer) => {
    const opponentTarget = isPlayer ? 'bot' : 'player';
    const converted = (state.activeEffects as unknown as ActiveEffect[])
      .filter(e => e.target === opponentTarget && e.type === 'buff')
      .map(e => ({ ...e, type: 'debuff' as const, value: -Math.abs(e.value), sourceAbility: 'Conversion' as AbilityType }));
    return { newEffects: converted };
  },

  // Deprivation: خذ أول بف من الخصم واجعله بفاً لك
  Deprivation: (state, isPlayer) => {
    const myTarget       = isPlayer ? 'player' : 'bot';
    const opponentTarget = isPlayer ? 'bot' : 'player';
    const opponentBuffs  = (state.activeEffects as unknown as ActiveEffect[])
      .filter(e => e.target === opponentTarget && e.type === 'buff');
    if (opponentBuffs.length === 0) return { newEffects: [] };
    const stolen = { ...opponentBuffs[0], target: myTarget, sourceAbility: 'Deprivation' as AbilityType };
    return { newEffects: [stolen] };
  },

  // ConsecutiveLossBuff: خسارة جولتين متتاليتين = +1 هجوم ودفاع
  ConsecutiveLossBuff: (state, isPlayer) => {
    const myTarget = isPlayer ? 'player' : 'bot';
    const results  = state.roundResults;
    const lastTwo  = results.slice(-2);
    const twoLosses = lastTwo.length === 2 && lastTwo.every(
      r => (isPlayer ? r.winner === 'bot' : r.winner === 'player')
    );
    if (!twoLosses) return { newEffects: [] };
    return {
      newEffects: [
        { type: 'buff', target: myTarget, stat: 'attack',  value: 1, roundsLeft: state.totalRounds - state.currentRound, sourceAbility: 'ConsecutiveLossBuff' },
        { type: 'buff', target: myTarget, stat: 'defense', value: 1, roundsLeft: state.totalRounds - state.currentRound, sourceAbility: 'ConsecutiveLossBuff' },
      ],
    };
  },

  // ──────────────────── قدرات منفّذة سابقاً ────────────────────

  Protection: (state, isPlayer) => {
    const target = isPlayer ? 'player' : 'bot';
    return { newEffects: [{ type: 'buff', target, stat: 'defense', value: 5, roundsLeft: 1, sourceAbility: 'Protection' }] };
  },

  HalvePoints: (state, isPlayer) => {
    const target       = isPlayer ? 'bot' : 'player';
    const opponentDeck = isPlayer ? state.botDeck : state.playerDeck;
    const currentCard  = opponentDeck[state.currentRound];
    const halfAttack   = currentCard ? Math.floor(currentCard.attack / 2) : 5;
    return { newEffects: [{ type: 'debuff', target, stat: 'attack', value: -halfAttack, roundsLeft: 1, sourceAbility: 'HalvePoints' }] };
  },

  Seal: (state, isPlayer) => {
    const target = isPlayer ? 'bot' : 'player';
    return { newEffects: [{ type: 'seal', target, stat: 'ability', value: 0, roundsLeft: 5, sourceAbility: 'Seal' }] };
  },

  StarSuperiority: (state, isPlayer) => {
    const target = isPlayer ? 'player' : 'bot';
    const rem    = state.totalRounds - state.currentRound;
    return { newEffects: [{ type: 'buff', target, stat: 'attack', value: 3, roundsLeft: rem, sourceAbility: 'StarSuperiority' }] };
  },

  Reduction: (state, isPlayer) => {
    const target = isPlayer ? 'bot' : 'player';
    return { newEffects: [{ type: 'debuff', target, stat: 'defense', value: -2, roundsLeft: 1, sourceAbility: 'Reduction' }] };
  },

  Eclipse: (state, isPlayer) => {
    const target = isPlayer ? 'bot' : 'player';
    return { newEffects: [{ type: 'debuff', target, stat: 'attack', value: -9999, roundsLeft: 1, sourceAbility: 'Eclipse' }] };
  },

  Avatar: (state, isPlayer) => {
    const target = isPlayer ? 'player' : 'bot';
    return { newEffects: [{ type: 'buff', target, stat: 'attack', value: 2, roundsLeft: 1, sourceAbility: 'Avatar' }] };
  },

  Penetration: (state, isPlayer) => {
    const target = isPlayer ? 'bot' : 'player';
    return { newEffects: [{ type: 'debuff', target, stat: 'defense', value: -9999, roundsLeft: 1, sourceAbility: 'Penetration' }] };
  },

  Misdirection: (state, isPlayer) => {
    const opponentTarget = isPlayer ? 'bot' : 'player';
    const debuffs = (state.activeEffects as unknown as ActiveEffect[]).filter(
      e => e.target === opponentTarget && e.type === 'debuff'
    );
    return { newEffects: debuffs.map(e => ({ ...e, value: e.value * 2, sourceAbility: 'Misdirection' as AbilityType })) };
  },

  DoubleNextCards: (state, isPlayer) => {
    const target = isPlayer ? 'player' : 'bot';
    return { newEffects: [{ type: 'buff', target, stat: 'attack', value: 2, roundsLeft: 2, sourceAbility: 'DoubleNextCards' }] };
  },

  Shield: (state, isPlayer) => {
    const target = isPlayer ? 'player' : 'bot';
    return { newEffects: [{ type: 'buff', target, stat: 'defense', value: 5, roundsLeft: 1, sourceAbility: 'Shield' }] };
  },

  DoublePoints: (state, isPlayer) => {
    const target = isPlayer ? 'player' : 'bot';
    return { newEffects: [{ type: 'buff', target, stat: 'attack', value: 100, roundsLeft: 1, sourceAbility: 'DoublePoints' }] };
  },

  ElementalMastery: (state, isPlayer) => {
    const target = isPlayer ? 'player' : 'bot';
    return { newEffects: [{ type: 'buff', target, stat: 'attack', value: 4, roundsLeft: state.totalRounds - state.currentRound, sourceAbility: 'ElementalMastery' }] };
  },
};
