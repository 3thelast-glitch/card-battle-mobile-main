import { Card, Element, ElementAdvantage, Effect, ELEMENT_ADVANTAGES, ELEMENT_WEAKNESSES, ELEMENT_MULTIPLIER } from './types';


export const ALL_CARDS: Card[] = [

  // ════════════════════════════════════════════
  // Naruto Universe
  // ════════════════════════════════════════════
  {
    id: 'naruto-uzumaki',
    name: 'Naruto Uzumaki',
    nameAr: 'ناروتو أوزوماكي',
    finalImage: require('../../assets/cards/final/human-warrior.png'),
    attack: 38, defense: 20,
    race: 'human', cardClass: 'warrior', element: 'wind',
    tags: ['sword'], emoji: '🍥',
    rarity: 'legendary', stars: 5,
    specialAbility: 'راسينغان — يُطلق كرة دوّارة تخترق دفاع الخصم',
    animationPreset: 'fire',
    cardEffects: ['charge'],
  },
  {
    id: 'sasuke-uchiha',
    name: 'Sasuke Uchiha',
    nameAr: 'ساسكي أوتشيها',
    finalImage: require('../../assets/cards/final/demon-warrior.png'),
    attack: 40, defense: 18,
    race: 'human', cardClass: 'mage', element: 'lightning',
    tags: ['sword', 'magic'], emoji: '🔥',
    rarity: 'legendary', stars: 5,
    specialAbility: 'شيرينغان — يتوقع حركة الخصم ويتجنب أول ضربة',
    animationPreset: 'lightning',
    cardEffects: ['stealth', 'charge'],
  },
  {
    id: 'sakura-haruno',
    name: 'Sakura Haruno',
    nameAr: 'ساكورا هارونو',
    finalImage: require('../../assets/cards/final/elf-mage.png'),
    attack: 24, defense: 32,
    race: 'human', cardClass: 'paladin', element: 'earth',
    tags: ['magic', 'shield'], emoji: '🌸',
    rarity: 'epic', stars: 4,
    specialAbility: 'الدرع الداخلي — تمتص أول هجوم بالكامل',
    animationPreset: 'default',
    cardEffects: ['divine_shield'],
  },
  {
    id: 'kakashi-hatake',
    name: 'Kakashi Hatake',
    nameAr: 'كاكاشي هاتاكي',
    finalImage: require('../../assets/cards/final/human-knight.png'),
    attack: 35, defense: 25,
    race: 'human', cardClass: 'knight', element: 'lightning',
    tags: ['sword', 'magic'], emoji: '⚡',
    rarity: 'epic', stars: 4,
    specialAbility: 'رايكيري — يخترق الدفاع ويتجاوز الدروع',
    animationPreset: 'lightning',
    cardEffects: ['charge'],
  },

  // ════════════════════════════════════════════
  // Dragon Ball Universe
  // ════════════════════════════════════════════
  {
    id: 'goku',
    name: 'Son Goku',
    nameAr: 'سون غوكو',
    finalImage: require('../../assets/cards/final/human-paladin.png'),
    attack: 45, defense: 22,
    race: 'human', cardClass: 'warrior', element: 'lightning',
    tags: ['sword', 'crown'], emoji: '🐉',
    rarity: 'legendary', stars: 5,
    specialAbility: 'كاميهاميها — يضاعف الهجوم في الجولة الأخيرة',
    animationPreset: 'lightning',
    cardEffects: ['charge', 'divine_shield'],
  },
  {
    id: 'vegeta',
    name: 'Vegeta',
    nameAr: 'فيجيتا',
    finalImage: require('../../assets/cards/final/orc-warrior.png'),
    attack: 42, defense: 20,
    race: 'human', cardClass: 'warrior', element: 'fire',
    tags: ['sword', 'crown'], emoji: '👑',
    rarity: 'legendary', stars: 5,
    specialAbility: 'أنهائية — يهجم أولاً دائماً في كل جولة',
    animationPreset: 'fire',
    cardEffects: ['charge', 'taunt'],
  },
  {
    id: 'piccolo',
    name: 'Piccolo',
    nameAr: 'بيكولو',
    finalImage: require('../../assets/cards/final/orc-mage.png'),
    attack: 30, defense: 28,
    race: 'orc', cardClass: 'mage', element: 'earth',
    tags: ['magic', 'shield'], emoji: '👾',
    rarity: 'rare', stars: 3,
    animationPreset: 'default',
  },
  {
    id: 'frieza',
    name: 'Frieza',
    nameAr: 'فريزر',
    finalImage: require('../../assets/cards/final/demon-mage.png'),
    attack: 44, defense: 16,
    race: 'demon', cardClass: 'berserker', element: 'ice',
    tags: ['magic', 'crown'], emoji: '❄️',
    rarity: 'legendary', stars: 5,
    specialAbility: 'الموت يأتي من البرد — يُجمّد دفاع الخصم لجولة كاملة',
    animationPreset: 'ice',
    cardEffects: ['poison', 'charge'],
  },

  // ════════════════════════════════════════════
  // One Piece Universe
  // ════════════════════════════════════════════
  {
    id: 'luffy',
    name: 'Monkey D. Luffy',
    nameAr: 'مونكي دي لوفي',
    finalImage: require('../../assets/cards/final/human-warrior.png'),
    attack: 36, defense: 22,
    race: 'human', cardClass: 'warrior', element: 'wind',
    tags: ['sword'], emoji: '🎩',
    rarity: 'legendary', stars: 5,
    specialAbility: 'جير الخامس — يتحوّل ويضاعف هجومه مرتين',
    animationPreset: 'fire',
    cardEffects: ['charge', 'divine_shield'],
  },
  {
    id: 'zoro',
    name: 'Roronoa Zoro',
    nameAr: 'رورونوا زورو',
    finalImage: require('../../assets/cards/final/human-knight.png'),
    attack: 40, defense: 18,
    race: 'human', cardClass: 'warrior', element: 'wind',
    tags: ['sword'], emoji: '⚔️',
    rarity: 'epic', stars: 4,
    specialAbility: 'ثلاثة سيوف — يضرب ثلاث مرات في نفس الجولة',
    animationPreset: 'default',
    cardEffects: ['charge'],
  },
  {
    id: 'nami',
    name: 'Nami',
    nameAr: 'نامي',
    finalImage: require('../../assets/cards/final/elf-archer.png'),
    attack: 22, defense: 20,
    race: 'elf', cardClass: 'archer', element: 'lightning',
    tags: ['bow', 'magic'], emoji: '🌩️',
    rarity: 'rare', stars: 3,
    animationPreset: 'lightning',
  },
  {
    id: 'ace',
    name: 'Portgas D. Ace',
    nameAr: 'بورتغاس دي آيس',
    finalImage: require('../../assets/cards/final/demon-berserker.png'),
    attack: 42, defense: 14,
    race: 'demon', cardClass: 'mage', element: 'fire',
    tags: ['magic', 'crown'], emoji: '🔥',
    rarity: 'epic', stars: 4,
    specialAbility: 'مشت — يحرق دفاع الخصم بمقدار 3 لكل جولة',
    animationPreset: 'fire',
    cardEffects: ['poison'],
  },

  // ════════════════════════════════════════════
  // Attack on Titan Universe
  // ════════════════════════════════════════════
  {
    id: 'eren-yeager',
    name: 'Eren Yeager',
    nameAr: 'إيرين ييغر',
    finalImage: require('../../assets/cards/final/orc-berserker.png'),
    attack: 38, defense: 15,
    race: 'orc', cardClass: 'berserker', element: 'earth',
    tags: ['sword'], emoji: '⚔️',
    rarity: 'epic', stars: 4,
    specialAbility: 'التيتان — يُضاعف هجومه عند الضربة الأولى',
    animationPreset: 'default',
    cardEffects: ['charge'],
  },
  {
    id: 'levi-ackerman',
    name: 'Levi Ackerman',
    nameAr: 'ليفي أكيرمان',
    finalImage: require('../../assets/cards/final/elf-knight.png'),
    attack: 44, defense: 20,
    race: 'elf', cardClass: 'knight', element: 'wind',
    tags: ['sword', 'shield'], emoji: '🗡️',
    rarity: 'legendary', stars: 5,
    specialAbility: 'أسرع بشري — يضرب قبل أي خصم ويتجنب الهجوم المعاكس',
    animationPreset: 'default',
    cardEffects: ['charge', 'stealth'],
  },
  {
    id: 'mikasa-ackerman',
    name: 'Mikasa Ackerman',
    nameAr: 'ميكاسا أكيرمان',
    finalImage: require('../../assets/cards/final/human-paladin.png'),
    attack: 35, defense: 28,
    race: 'human', cardClass: 'warrior', element: 'wind',
    tags: ['sword', 'shield'], emoji: '🌸',
    rarity: 'epic', stars: 4,
    specialAbility: 'الحماية — تمتص الضربة التي تستهدف حليفها',
    animationPreset: 'default',
    cardEffects: ['divine_shield'],
  },
  {
    id: 'reiner-braun',
    name: 'Reiner Braun',
    nameAr: 'رينر براون',
    finalImage: require('../../assets/cards/final/human-knight.png'),
    attack: 28, defense: 36,
    race: 'human', cardClass: 'knight', element: 'earth',
    tags: ['shield', 'crown'], emoji: '🛡️',
    rarity: 'rare', stars: 3,
    animationPreset: 'default',
    cardEffects: ['taunt'],
  },

  // ════════════════════════════════════════════
  // Demon Slayer Universe
  // ════════════════════════════════════════════
  {
    id: 'tanjiro-kamado',
    name: 'Tanjiro Kamado',
    nameAr: 'تانجيرو كامادو',
    finalImage: require('../../assets/cards/final/dragon-knight.png'),
    attack: 34, defense: 24,
    race: 'dragon', cardClass: 'warrior', element: 'water',
    tags: ['sword'], emoji: '💧',
    rarity: 'epic', stars: 4,
    specialAbility: 'نفس الماء — يُعيد إحياء قدر 5 من الدفاع بعد كل جولة',
    animationPreset: 'default',
    cardEffects: ['divine_shield'],
  },
  {
    id: 'nezuko-kamado',
    name: 'Nezuko Kamado',
    nameAr: 'نيزوكو كامادو',
    finalImage: require('../../assets/cards/final/elf-mage.png'),
    attack: 30, defense: 22,
    race: 'demon', cardClass: 'mage', element: 'fire',
    tags: ['magic'], emoji: '🌸',
    rarity: 'rare', stars: 3,
    animationPreset: 'fire',
  },
  {
    id: 'inosuke-hashibira',
    name: 'Inosuke Hashibira',
    nameAr: 'إينوسوكي هاشيبيرا',
    finalImage: require('../../assets/cards/final/orc-berserker.png'),
    attack: 40, defense: 12,
    race: 'orc', cardClass: 'berserker', element: 'wind',
    tags: ['sword'], emoji: '🐗',
    rarity: 'rare', stars: 3,
    animationPreset: 'default',
    cardEffects: ['charge'],
  },
  {
    id: 'zenitsu-agatsuma',
    name: 'Zenitsu Agatsuma',
    nameAr: 'زينيتسو أغاتسوما',
    finalImage: require('../../assets/cards/final/elf-archer.png'),
    attack: 46, defense: 10,
    race: 'elf', cardClass: 'archer', element: 'lightning',
    tags: ['sword'], emoji: '⚡',
    rarity: 'epic', stars: 4,
    specialAbility: 'الرعد — يضرب بسرعة البرق مرة واحدة قاتلة',
    animationPreset: 'lightning',
    cardEffects: ['charge'],
  },

  // ════════════════════════════════════════════
  // My Hero Academia Universe
  // ════════════════════════════════════════════
  {
    id: 'deku',
    name: 'Izuku Midoriya',
    nameAr: 'إيزوكو ميدوريا',
    finalImage: require('../../assets/cards/final/dragon-mage.png'),
    attack: 38, defense: 20,
    race: 'dragon', cardClass: 'warrior', element: 'lightning',
    tags: ['sword', 'magic'], emoji: '💥',
    rarity: 'epic', stars: 4,
    specialAbility: 'للأمام - النسر كامل — يُطلق قوة شاملة تتجاوز أي دفاع',
    animationPreset: 'lightning',
    cardEffects: ['charge'],
  },
  {
    id: 'bakugo',
    name: 'Katsuki Bakugo',
    nameAr: 'كاتسوكي باكوغو',
    finalImage: require('../../assets/cards/final/demon-berserker.png'),
    attack: 44, defense: 14,
    race: 'demon', cardClass: 'berserker', element: 'fire',
    tags: ['magic'], emoji: '💣',
    rarity: 'epic', stars: 4,
    specialAbility: 'انفجار — يُحرق دفاع الخصم ويُضيف دمجاً نارياً',
    animationPreset: 'fire',
    cardEffects: ['poison', 'charge'],
  },
  {
    id: 'todoroki',
    name: 'Shoto Todoroki',
    nameAr: 'شوتو تودوروكي',
    finalImage: require('../../assets/cards/final/dragon-archer.png'),
    attack: 40, defense: 22,
    race: 'dragon', cardClass: 'mage', element: 'ice',
    tags: ['magic', 'shield'], emoji: '🌓',
    rarity: 'epic', stars: 4,
    specialAbility: 'النصفين — يهجم بالنار والجليد معاً لمضاعفة الضرر',
    animationPreset: 'ice',
    cardEffects: ['charge'],
  },
  {
    id: 'all-might',
    name: 'All Might',
    nameAr: 'أول مايت',
    finalImage: require('../../assets/cards/final/human-paladin.png'),
    attack: 50, defense: 18,
    race: 'human', cardClass: 'warrior', element: 'lightning',
    tags: ['sword', 'crown', 'magic'], emoji: '💪',
    rarity: 'legendary', stars: 5,
    specialAbility: 'لقد جئت — يُلغي أي قدرة خاصة للخصم ويهزمه في ضربة واحدة',
    animationPreset: 'lightning',
    cardEffects: ['charge', 'divine_shield', 'taunt'],
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
    if (effect.kind === 'statModifier') {
      const data = effect.data as { stat?: 'attack' | 'defense'; amount?: number };
      const amount = data?.amount ?? 0;
      const stat = data?.stat ?? 'defense';
      if (stat === 'attack') modifiedCard.attack += amount;
      else modifiedCard.defense += amount;
    }
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
