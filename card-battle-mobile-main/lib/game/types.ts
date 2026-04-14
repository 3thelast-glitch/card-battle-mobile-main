// أنواع البطاقات والإحصائيات

import type { ImageSourcePropType } from 'react-native';

export type Race =
  | 'human'
  | 'elf'
  | 'orc'
  | 'dragon'
  | 'demon'
  | 'undead'
  | 'monster'   // anime-cards-data
  | 'robot';    // anime-cards-data

export type CardClass = 'warrior' | 'knight' | 'mage' | 'archer' | 'berserker' | 'paladin';

export type Element = 'fire' | 'ice' | 'water' | 'earth' | 'lightning' | 'wind';

// Removed predefined tags to rely entirely on Element, Race, and Class.
export type Tag = string;

/** Rarity tier for a card */
export type CardRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'special';

/** Special in-game effects a card can carry */
export type CardEffect = 'taunt' | 'divine_shield' | 'poison' | 'stealth' | 'charge';

/** Localised string for bilingual support */
export interface LocalizedString {
  en: string;
  ar: string;
}

/** Per-card animation preset key */
export type CardAnimationPreset = 'default' | 'fire' | 'ice' | 'lightning' | 'shadow' | 'holy';

/**
 * بيانات وضع الغضب للبطاقة — اختياري، يُضبَط من شاشة إدارة الكروت
 * عند خسارة الكرت: تتحول البطاقة إلى نسخة أقوى مع صورة/فيديو جديد
 */
export interface RageModeData {
  /** هل الميزة مفعّلة لهذه البطاقة؟ */
  enabled: boolean;
  /** رابط صورة الغضب (URL أو base64) — تحل محل صورة الكرت عند التفعيل */
  rageImageUrl?: string;
  /** رابط فيديو التحول — يُشغَّل لحظة تفعيل وضع الغضب */
  rageVideoUrl?: string;
  /** زيادة قيمة الهجوم عند الغضب */
  rageAttackBoost: number;
  /** زيادة قيمة الدفاع عند الغضب */
  rageDefenseBoost: number;
  /** اسم وضع الغضب بالعربية (مثل: سوبر سايان) */
  rageNameAr?: string;
  /** تفعيل مرة واحدة فقط في المباراة، أو عند كل خسارة */
  oncePer: 'match' | 'unlimited';
}

export interface Card {
  id: string;
  name: string;
  nameAr: string;
  nameEn?: string;
  /** Local image source — optional when imageUrl is provided instead */
  finalImage?: ImageSourcePropType;
  /** URL string fallback used by anime-cards-data (remote images) */
  imageUrl?: string;
  attack: number;
  defense: number;
  /** Legacy hp field used by older screens/tests */
  hp?: number;
  race: Race;
  cardClass: CardClass;
  element: Element;
  tags?: Tag[];
  emoji?: string;
  videoUrl?: string;
  rarity?: CardRarity;
  stars?: number;
  specialAbility?: string;
  cardEffects?: CardEffect[];
  animationPreset?: CardAnimationPreset;
  /** Optional ability slot — can be undefined after Recall/Merge/etc. */
  ability?: AbilityType;
  /** إعدادات وضع الغضب — اختياري، يُفعّل من شاشة إدارة الكروت */
  rageMode?: RageModeData;
}

export type AbilityType =
  | 'LogicalEncounter'
  | 'Recall'
  | 'Protection'
  | 'Arise'
  | 'Reinforcement'
  | 'Wipe'
  | 'Purge'
  | 'HalvePoints'
  | 'Seal'
  | 'DoubleOrNothing'
  | 'StarSuperiority'
  | 'Reduction'
  | 'Sacrifice'
  | 'Popularity'
  | 'Eclipse'
  | 'CancelAbility'
  | 'Revive'
  | 'ConsecutiveLossBuff'
  | 'Lifesteal'
  | 'Revenge'
  | 'Suicide'
  | 'Disaster'
  | 'Compensation'
  | 'Weakening'
  | 'Misdirection'
  | 'StealAbility'
  | 'Rescue'
  | 'Trap'
  | 'ConvertDebuffsToBuffs'
  | 'Sniping'
  | 'Merge'
  | 'DoubleNextCards'
  | 'Deprivation'
  | 'Greed'
  | 'Dilemma'
  | 'Subhan'
  | 'Propaganda'
  | 'DoubleYourBuffs'
  | 'Avatar'
  | 'Penetration'
  | 'Pool'
  | 'Conversion'
  | 'Shield'
  | 'SwapClass'
  | 'TakeIt'
  | 'Skip'
  | 'AddElement'
  | 'Explosion'
  | 'DoublePoints'
  | 'ElementalMastery';

export type Side = 'player' | 'bot';

export type EffectKind =
  | 'prediction'
  | 'protection'
  | 'fortify'
  | 'statModifier'
  | 'halvePoints'
  | 'silenceAbilities'
  | 'doubleOrNothing'
  | 'forcedOutcome'
  | 'starAdvantage'
  | 'sacrifice'
  | 'greedBuff'
  | 'lifesteal'
  | 'revengeBuff'
  | 'suicidePact'
  | 'compensationBuff'
  | 'weakeningDebuff'
  | 'explosionDebuff'
  | 'consecutiveLoss'
  | 'shieldGuard'
  | 'trap'
  | 'convertDebuffs'
  | 'doubleBuffs'
  | 'conversion'
  | 'takeIt'
  | 'deprivation'
  | 'pool';

export interface Effect {
  id: string;
  kind: EffectKind;
  sourceSide: Side;
  targetSide: Side | 'all';
  createdAtRound: number;
  expiresAtRound?: number;
  charges?: number;
  priority: number;
  data?: Record<string, unknown>;
}

export interface ActiveEffect {
  type: 'buff' | 'debuff' | 'seal';
  target: 'player' | 'bot' | 'all';
  stat: 'attack' | 'defense' | 'ability';
  value: number;
  roundsLeft: number;
  sourceAbility: AbilityType;
}

export interface GameState {
  playerDeck: Card[];
  botDeck: Card[];
  currentRound: number;
  totalRounds: number;
  playerScore: number;
  botScore: number;
  roundResults: RoundResult[];
  difficulty: 1 | 2 | 3 | 4 | 5;
  abilitiesEnabled: boolean;
  activeEffects: Effect[];
  playerAbilities: AbilityState[];
  botAbilities: AbilityState[];
  usedAbilities: AbilityType[];
}

export interface AbilityState {
  type: AbilityType;
  used: boolean;
}

export interface RoundResult {
  round: number;
  playerCard: Card;
  botCard: Card;
  playerDamage: number;
  botDamage: number;
  playerBaseDamage: number;
  botBaseDamage: number;
  playerElementAdvantage: ElementAdvantage;
  botElementAdvantage: ElementAdvantage;
  winner: 'player' | 'bot' | 'draw';
}

export const RACE_EMOJI: Record<Race, string> = {
  human: '\u{1F464}',
  elf: '\u{1F9DD}',
  orc: '\u{1F479}',
  dragon: '\u{1F409}',
  demon: '\u{1F608}',
  undead: '\u{1F480}',
  monster: '\u{1F47E}',
  robot: '\u{1F916}',
};

export const CLASS_EMOJI: Record<CardClass, string> = {
  warrior: '\u2694\ufe0f',
  knight: '\u{1F6E1}\ufe0f',
  mage: '\u{1F52E}',
  archer: '\u{1F3F9}',
  berserker: '\u{1F5E1}\ufe0f',
  paladin: '\u{1F4AA}',
};

export const ELEMENT_EMOJI: Record<Element, string> = {
  fire: '\u{1F525}',
  ice: '\u2744\ufe0f',
  water: '\u{1F4A7}',
  earth: '\u{1F30D}',
  lightning: '\u26a1',
  wind: '\u{1F4A8}',
};

export const ELEMENT_COLORS: Record<Element, string> = {
  fire: '#ef4444',
  ice: '#38bdf8',
  water: '#3b82f6',
  earth: '#a3e635',
  lightning: '#facc15',
  wind: '#a78bfa',
};

export type ElementAdvantage = 'strong' | 'weak' | 'neutral';

export const ELEMENT_MULTIPLIER = {
  strong: 1.25,
  weak: 0.75,
  neutral: 1.0,
};

export const ELEMENT_ADVANTAGES: Record<Element, Element[]> = {
  fire: ['ice'],
  ice: ['earth'],
  earth: ['fire'],
  water: [],
  lightning: [],
  wind: [],
};

export const ELEMENT_WEAKNESSES: Record<Element, Element[]> = {
  fire: ['earth'],
  ice: ['fire'],
  earth: ['ice'],
  water: [],
  lightning: [],
  wind: [],
};
