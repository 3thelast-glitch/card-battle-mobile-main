import { Card, Element, ElementAdvantage, Effect, ELEMENT_ADVANTAGES, ELEMENT_WEAKNESSES, ELEMENT_MULTIPLIER } from './types';


export const ALL_CARDS: Card[] = [
  // ════════════════════════════════════════════
  // البشر — Humans (4 cards)
  // ════════════════════════════════════════════
  {
    id: 'human-warrior',
    name: 'Human Warrior',
    nameAr: 'المحارب البشري',
    finalImage: require('../../assets/cards/final/human-warrior.png'),
    attack: 28, defense: 18,
    race: 'human', cardClass: 'warrior', element: 'fire',
    tags: ['sword'], emoji: '⚔️',
    rarity: 'common', stars: 2,
    animationPreset: 'fire',
  },
  {
    id: 'human-knight',
    name: 'Human Knight',
    nameAr: 'الفارس البشري',
    finalImage: require('../../assets/cards/final/human-knight.png'),
    attack: 25, defense: 25,
    race: 'human', cardClass: 'knight', element: 'earth',
    tags: ['sword', 'shield'], emoji: '🛡️',
    rarity: 'rare', stars: 3,
    animationPreset: 'default',
  },
  {
    id: 'human-paladin',
    name: 'Human Paladin',
    nameAr: 'البالادين البشري',
    finalImage: require('../../assets/cards/final/human-paladin.png'),
    attack: 30, defense: 22,
    race: 'human', cardClass: 'paladin', element: 'lightning',
    tags: ['sword', 'shield', 'magic'], emoji: '⚡',
    rarity: 'epic', stars: 4,
    specialAbility: 'الدرع الإلهي — يمتص أول ضربة من الخصم',
    animationPreset: 'lightning',
    cardEffects: ['divine_shield'],
  },
  {
    id: 'human-mage',
    name: 'Human Mage',
    nameAr: 'الساحر البشري',
    finalImage: require('../../assets/cards/final/human-mage.png'),
    attack: 22, defense: 12,
    race: 'human', cardClass: 'mage', element: 'ice',
    tags: ['magic'], emoji: '❄️',
    rarity: 'common', stars: 2,
    animationPreset: 'ice',
  },

  // ════════════════════════════════════════════
  // الجن — Elves (4 cards)
  // ════════════════════════════════════════════
  {
    id: 'elf-archer',
    name: 'Elf Archer',
    nameAr: 'الرامي الجني',
    finalImage: require('../../assets/cards/final/elf-archer.png'),
    attack: 32, defense: 12,
    race: 'elf', cardClass: 'archer', element: 'wind',
    tags: ['bow'], emoji: '🏹',
    rarity: 'rare', stars: 3,
    animationPreset: 'default',
  },
  {
    id: 'elf-mage',
    name: 'Elf Mage',
    nameAr: 'الساحر الجني',
    finalImage: require('../../assets/cards/final/elf-mage.png'),
    attack: 20, defense: 10,
    race: 'elf', cardClass: 'mage', element: 'lightning',
    tags: ['magic'], emoji: '🔮',
    rarity: 'common', stars: 1,
    animationPreset: 'lightning',
  },
  {
    id: 'elf-knight',
    name: 'Elf Knight',
    nameAr: 'الفارس الجني',
    finalImage: require('../../assets/cards/final/elf-knight.png'),
    attack: 24, defense: 20,
    race: 'elf', cardClass: 'knight', element: 'water',
    tags: ['sword', 'shield'], emoji: '💧',
    rarity: 'rare', stars: 3,
    animationPreset: 'default',
  },
  {
    id: 'elf-berserker',
    name: 'Elf Berserker',
    nameAr: 'البيرسركر الجني',
    finalImage: require('../../assets/cards/final/elf-archer.png'),
    attack: 38, defense: 8,
    race: 'elf', cardClass: 'berserker', element: 'wind',
    tags: ['sword'], emoji: '💨',
    rarity: 'epic', stars: 4,
    specialAbility: 'الشحنة — يضرب قبل الخصم في الجولة الأولى',
    animationPreset: 'default',
    cardEffects: ['charge'],
  },

  // ════════════════════════════════════════════
  // الأورك — Orcs (4 cards)
  // ════════════════════════════════════════════
  {
    id: 'orc-berserker',
    name: 'Orc Berserker',
    nameAr: 'البيرسركر الأورك',
    finalImage: require('../../assets/cards/final/orc-berserker.png'),
    attack: 35, defense: 10,
    race: 'orc', cardClass: 'berserker', element: 'fire',
    tags: ['sword'], emoji: '🗡️',
    rarity: 'rare', stars: 3,
    animationPreset: 'fire',
  },
  {
    id: 'orc-warrior',
    name: 'Orc Warrior',
    nameAr: 'المحارب الأورك',
    finalImage: require('../../assets/cards/final/orc-warrior.png'),
    attack: 30, defense: 15,
    race: 'orc', cardClass: 'warrior', element: 'earth',
    tags: ['sword', 'shield'], emoji: '⚔️',
    rarity: 'common', stars: 2,
    animationPreset: 'default',
  },
  {
    id: 'orc-mage',
    name: 'Orc Shaman',
    nameAr: 'الشامان الأورك',
    finalImage: require('../../assets/cards/final/orc-mage.png'),
    attack: 26, defense: 14,
    race: 'orc', cardClass: 'mage', element: 'wind',
    tags: ['magic'], emoji: '🌪️',
    rarity: 'common', stars: 1,
    animationPreset: 'default',
  },
  {
    id: 'orc-knight',
    name: 'Orc Warlord',
    nameAr: 'أمير الحرب الأورك',
    finalImage: require('../../assets/cards/final/orc-warrior.png'),
    attack: 26, defense: 28,
    race: 'orc', cardClass: 'knight', element: 'earth',
    tags: ['sword', 'shield', 'crown'], emoji: '👑',
    rarity: 'epic', stars: 4,
    specialAbility: 'الاستفزاز — يجبر الخصم على اختياره',
    animationPreset: 'default',
    cardEffects: ['taunt'],
  },

  // ════════════════════════════════════════════
  // التنانين — Dragons (4 cards)
  // ════════════════════════════════════════════
  {
    id: 'dragon-mage',
    name: 'Dragon Mage',
    nameAr: 'ساحر التنين',
    finalImage: require('../../assets/cards/final/dragon-mage.png'),
    attack: 38, defense: 14,
    race: 'dragon', cardClass: 'mage', element: 'fire',
    tags: ['magic', 'crown'], emoji: '🐉',
    rarity: 'epic', stars: 4,
    specialAbility: 'الشحنة — يضرب أولاً في الراوند',
    animationPreset: 'fire',
    cardEffects: ['charge'],
  },
  {
    id: 'dragon-knight',
    name: 'Dragon Knight',
    nameAr: 'فارس التنين',
    finalImage: require('../../assets/cards/final/dragon-knight.png'),
    attack: 28, defense: 28,
    race: 'dragon', cardClass: 'knight', element: 'fire',
    tags: ['sword', 'shield', 'crown'], emoji: '🐲',
    rarity: 'rare', stars: 3,
    animationPreset: 'fire',
  },
  {
    id: 'dragon-archer',
    name: 'Dragon Archer',
    nameAr: 'رامي التنين',
    finalImage: require('../../assets/cards/final/dragon-archer.png'),
    attack: 34, defense: 10,
    race: 'dragon', cardClass: 'archer', element: 'lightning',
    tags: ['bow'], emoji: '⚡',
    rarity: 'rare', stars: 3,
    animationPreset: 'lightning',
  },
  {
    id: 'phoenix-lord',
    name: 'Phoenix Lord',
    nameAr: 'سيد الفينيق',
    finalImage: require('../../assets/cards/final/dragon-mage.png'),
    attack: 42, defense: 12,
    race: 'dragon', cardClass: 'mage', element: 'fire',
    tags: ['magic', 'crown'], emoji: '🔥',
    rarity: 'legendary', stars: 5,
    specialAbility: 'البعث — عند الهزيمة يعود للحياة مرة واحدة بنصف الإحصاءات',
    animationPreset: 'fire',
    cardEffects: ['divine_shield', 'charge'],
  },

  // ════════════════════════════════════════════
  // الشياطين — Demons (4 cards)
  // ════════════════════════════════════════════
  {
    id: 'demon-berserker',
    name: 'Demon Berserker',
    nameAr: 'البيرسركر الشيطاني',
    finalImage: require('../../assets/cards/final/demon-berserker.png'),
    attack: 40, defense: 8,
    race: 'demon', cardClass: 'berserker', element: 'fire',
    tags: ['sword'], emoji: '😈',
    rarity: 'epic', stars: 4,
    specialAbility: 'السُّم — كل ضربة تُضعف دفاع الخصم بمقدار 1',
    animationPreset: 'fire',
    cardEffects: ['poison'],
  },
  {
    id: 'demon-mage',
    name: 'Demon Mage',
    nameAr: 'الساحر الشيطاني',
    finalImage: require('../../assets/cards/final/demon-mage.png'),
    attack: 36, defense: 6,
    race: 'demon', cardClass: 'mage', element: 'lightning',
    tags: ['magic'], emoji: '👿',
    rarity: 'rare', stars: 3,
    animationPreset: 'lightning',
  },
  {
    id: 'demon-warrior',
    name: 'Demon Warrior',
    nameAr: 'المحارب الشيطاني',
    finalImage: require('../../assets/cards/final/demon-warrior.png'),
    attack: 32, defense: 18,
    race: 'demon', cardClass: 'warrior', element: 'earth',
    tags: ['sword', 'shield'], emoji: '🗡️',
    rarity: 'common', stars: 2,
    animationPreset: 'shadow',
  },
  {
    id: 'shadow-king',
    name: 'Shadow King',
    nameAr: 'ملك الظلام',
    finalImage: require('../../assets/cards/final/demon-archer.png'),
    attack: 44, defense: 10,
    race: 'demon', cardClass: 'berserker', element: 'ice',
    tags: ['sword', 'magic', 'crown'], emoji: '👑',
    rarity: 'legendary', stars: 5,
    specialAbility: 'الاختفاء — يتجنب أول هجوم. السُّم — يُضعف الخصم في كل جولة',
    animationPreset: 'shadow',
    cardEffects: ['stealth', 'poison'],
  },

  // ════════════════════════════════════════════
  // الموتى الأحياء — Undead (4 cards)
  // ════════════════════════════════════════════
  {
    id: 'undead-knight',
    name: 'Undead Knight',
    nameAr: 'الفارس الميت',
    finalImage: require('../../assets/cards/final/human-knight.png'),
    attack: 22, defense: 30,
    race: 'undead', cardClass: 'knight', element: 'ice',
    tags: ['sword', 'shield'], emoji: '💀',
    rarity: 'rare', stars: 3,
    animationPreset: 'ice',
  },
  {
    id: 'undead-paladin',
    name: 'Undead Paladin',
    nameAr: 'البالادين الميت',
    finalImage: require('../../assets/cards/final/human-paladin.png'),
    attack: 25, defense: 22,
    race: 'undead', cardClass: 'paladin', element: 'ice',
    tags: ['sword', 'shield', 'magic'], emoji: '👻',
    rarity: 'common', stars: 2,
    animationPreset: 'ice',
  },
  {
    id: 'undead-mage',
    name: 'Undead Necromancer',
    nameAr: 'محيي الموتى',
    finalImage: require('../../assets/cards/final/elf-mage.png'),
    attack: 34, defense: 8,
    race: 'undead', cardClass: 'mage', element: 'ice',
    tags: ['magic', 'crown'], emoji: '☠️',
    rarity: 'epic', stars: 4,
    specialAbility: 'السُّم — يُضعف دفاع الخصم بمقدار 1 في كل جولة',
    animationPreset: 'ice',
    cardEffects: ['poison'],
  },
  {
    id: 'storm-titan',
    name: 'Storm Titan',
    nameAr: 'جبار العاصفة',
    finalImage: require('../../assets/cards/final/orc-berserker.png'),
    attack: 40, defense: 5,
    race: 'undead', cardClass: 'berserker', element: 'lightning',
    tags: ['sword', 'crown'], emoji: '🌩️',
    rarity: 'legendary', stars: 5,
    specialAbility: 'الشحنة + الاستفزاز — يهجم أولاً ويجبر الخصم على مواجهته',
    animationPreset: 'lightning',
    cardEffects: ['charge', 'taunt'],
  },
];

export function getRandomCards(count: number): Card[] {
  const shuffled = [...ALL_CARDS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function calculateBaseDamage(attacker: Card, defender: Card): number {
  const damage = attacker.attack - defender.defense;
  return Math.max(0, damage);
}

export function getElementAdvantage(attackerElement: Element, defenderElement: Element): ElementAdvantage {
  if (ELEMENT_ADVANTAGES[attackerElement]?.includes(defenderElement)) return 'strong';
  if (ELEMENT_WEAKNESSES[attackerElement]?.includes(defenderElement)) return 'weak';
  return 'neutral';
}

export function applyActiveEffects(
  card: Card,
  effects: Effect[] = [],
  abilitiesEnabled = true
): Card {
  let modifiedCard = { ...card };
  if (!abilitiesEnabled || !effects || effects.length === 0) return modifiedCard;
  const orderedEffects = [...effects].sort((a, b) => b.priority - a.priority);
  orderedEffects.forEach(effect => {
    // statModifier → defense فقط
    if (effect.kind === 'statModifier') {
      const data = effect.data as { stat?: 'attack' | 'defense'; amount?: number };
      const amount = data?.amount ?? 0;
      const stat = data?.stat ?? 'defense';
      if (stat === 'attack') modifiedCard.attack += amount;
      else modifiedCard.defense += amount;
    }
    // halvePoints → attack و defense فقط
    if (effect.kind === 'halvePoints') {
      const data = effect.data as { multiplier?: number };
      const multiplier = data?.multiplier ?? 0.5;
      modifiedCard.attack = Math.round(modifiedCard.attack * multiplier);
      modifiedCard.defense = Math.round(modifiedCard.defense * multiplier);
    }
  });
  modifiedCard.attack = Math.max(0, modifiedCard.attack);
  modifiedCard.defense = Math.max(0, modifiedCard.defense);
  return modifiedCard;
}

export function calculateDamage(attacker: Card, defender: Card): { damage: number; baseDamage: number; advantage: ElementAdvantage } {
  const baseDamage = calculateBaseDamage(attacker, defender);
  const advantage = getElementAdvantage(attacker.element, defender.element);
  const multiplier = ELEMENT_MULTIPLIER[advantage];
  const damage = Math.round(baseDamage * multiplier);
  return { damage, baseDamage, advantage };
}

export function determineRoundWinner(
  playerCard: Card, botCard: Card,
  playerEffects: Effect[] = [], botEffects: Effect[] = [],
  abilitiesEnabled = true
): {
  winner: 'player' | 'bot' | 'draw';
  playerDamage: number; botDamage: number;
  playerBaseDamage: number; botBaseDamage: number;
  playerElementAdvantage: ElementAdvantage; botElementAdvantage: ElementAdvantage;
} {
  const modifiedPlayerCard = applyActiveEffects(playerCard, playerEffects, abilitiesEnabled);
  const modifiedBotCard = applyActiveEffects(botCard, botEffects, abilitiesEnabled);
  const playerResult = calculateDamage(modifiedPlayerCard, modifiedBotCard);
  const botResult = calculateDamage(modifiedBotCard, modifiedPlayerCard);
  let winner: 'player' | 'bot' | 'draw';
  if (playerResult.damage > botResult.damage) winner = 'player';
  else if (botResult.damage > playerResult.damage) winner = 'bot';
  else winner = 'draw';
  const playerStarAdvantage = playerEffects.some(e => e.kind === 'starAdvantage');
  const botStarAdvantage = botEffects.some(e => e.kind === 'starAdvantage');
  if (winner === 'draw' && playerStarAdvantage !== botStarAdvantage)
    winner = playerStarAdvantage ? 'player' : 'bot';
  return {
    winner,
    playerDamage: playerResult.damage, botDamage: botResult.damage,
    playerBaseDamage: playerResult.baseDamage, botBaseDamage: botResult.baseDamage,
    playerElementAdvantage: playerResult.advantage, botElementAdvantage: botResult.advantage,
  };
}
