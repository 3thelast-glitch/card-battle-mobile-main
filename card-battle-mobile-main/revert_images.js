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

let changedCount = 0;

batchFiles.forEach(file => {
  const fullPath = path.join(projectRoot, file);
  if (!fs.existsSync(fullPath)) return;
  
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Replace finalImage with fallback logic by matching each card object
  let newContent = content.replace(/\{([^{}]+)\}/g, (match, body) => {
    const raceMatch = body.match(/race:\s*['"]([^'"]+)['"]/);
    const classMatch = body.match(/cardClass:\s*['"]([^'"]+)['"]/);
    
    if (raceMatch && classMatch && body.includes('finalImage:')) {
      const race = raceMatch[1];
      const cardClass = classMatch[1];
      
      let fallback = '';
      if (race === 'dragon') fallback = 'dragon-knight.png';
      else if (race === 'elf') fallback = 'elf-knight.png';
      else if (race === 'undead') fallback = 'human-knight.png';
      else if (race === 'demon') fallback = 'demon-warrior.png';
      else if (race === 'human' && cardClass === 'warrior') fallback = 'human-warrior.png';
      else if (race === 'orc' && cardClass === 'warrior') fallback = 'orc-warrior.png';
      else fallback = `${race}-${cardClass}.png`;

      const newFinalImage = `finalImage: require('../../assets/cards/final/${fallback}')`;
      
      const replacedBody = body.replace(/finalImage:\s*require\([^\)]+\)/, newFinalImage);
      
      if (replacedBody !== body) {
        changedCount++;
        return `{${replacedBody}}`;
      }
    }
    return match;
  });

  if (newContent !== content) {
    fs.writeFileSync(fullPath, newContent, 'utf8');
    console.log(`Reverted images in ${file}`);
  }
});

console.log(`Reversion complete. Total images updated: ${changedCount}`);
