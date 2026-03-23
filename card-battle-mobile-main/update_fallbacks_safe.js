const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve('a:/020/card-battle-mobile-main/card-battle-mobile-main');
const batchFiles = [
  'lib/game/cards-batch-1-fixed.ts',
  'lib/game/cards-batch-2-fixed.ts',
  'lib/game/cards-batch-3-fixed.ts',
  'lib/game/cards-batch-4-fixed.ts',
  'lib/game/cards-batch-5-fixed.ts',
  'lib/game/cards-batch-6-fixed.ts'
];

const ALLOWED_IMAGES = [
  'human-warrior.png',
  'human-knight.png',
  'human-mage.png',
  'orc-warrior.png',
  'elf-knight.png',
  'elf-archer.png',
  'dragon-knight.png',
  'demon-warrior.png',
  'orc-berserker.png'
];

function determineFallback(race, cardClass) {
  let fallback = `${race}-${cardClass}.png`;

  // Special explicitly defined rules
  if (race === 'dragon') fallback = 'dragon-knight.png';
  if (race === 'undead') fallback = 'human-knight.png';
  if (race === 'demon') fallback = 'demon-warrior.png';
  
  // Previous rule said: elf -> elf-knight.png
  // New allowed list has 'elf-knight.png' and 'elf-archer.png'
  if (race === 'elf' && cardClass !== 'archer') fallback = 'elf-knight.png';

  // Final strict check against the allowed list perfectly
  if (!ALLOWED_IMAGES.includes(fallback)) {
    fallback = 'human-warrior.png'; // default fallback for all unseen combo's
  }

  return fallback;
}

let totalChanged = 0;

batchFiles.forEach(file => {
  const fullPath = path.join(projectRoot, file);
  if (!fs.existsSync(fullPath)) return;
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let newContent = content.replace(/\{([^{}]+)\}/g, (match, body) => {
    const raceMatch = body.match(/race:\s*['"]([^'"]+)['"]/);
    const classMatch = body.match(/cardClass:\s*['"]([^'"]+)['"]/);
    
    if (raceMatch && classMatch && body.includes('finalImage:')) {
      const race = raceMatch[1];
      const cardClass = classMatch[1];
      
      const fallback = determineFallback(race, cardClass);
      const newFinalImage = `finalImage: require('../../assets/cards/final/${fallback}')`;
      
      const replacedBody = body.replace(/finalImage:\s*require\([^\)]+\)/, newFinalImage);
      
      if (replacedBody !== body) {
        totalChanged++;
        return `{${replacedBody}}`;
      }
    }
    return match;
  });

  if (newContent !== content) {
    fs.writeFileSync(fullPath, newContent, 'utf8');
    console.log(`Successfully reverted fallbacks in ${file}`);
  }
});

console.log(`Process complete. Modified ${totalChanged} cards exactly according to strict fallback rules.`);
