const fs = require('fs');
const path = require('path');

const basePath = path.resolve('a:/020/card-battle-mobile-main/card-battle-mobile-main');
const files = [
  'lib/game/cards-batch-1-fixed.ts',
  'lib/game/cards-batch-2-fixed.ts',
  'lib/game/cards-batch-3-fixed.ts',
  'lib/game/cards-batch-4-fixed.ts',
  'lib/game/cards-batch-5-fixed.ts',
  'lib/game/cards-batch-6-fixed.ts',
];

files.forEach(relativePath => {
  const fullPath = path.join(basePath, relativePath);
  if (!fs.existsSync(fullPath)) {
    console.log(`File not found: ${fullPath}`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let lines = content.split('\n');
  
  let currentId = null;
  let currentRarity = null;
  let finalImageLineIdx = -1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.includes('{')) {
      currentId = null;
      currentRarity = null;
      finalImageLineIdx = -1;
    }
    
    const idMatch = line.match(/\bid:\s*['"]([^'"]+)['"]/);
    if (idMatch) currentId = idMatch[1];
    
    const rarityMatch = line.match(/\brarity:\s*['"]([^'"]+)['"]/);
    if (rarityMatch) currentRarity = rarityMatch[1];
    
    if (line.match(/finalImage:\s*require\([^\)]+\)/)) {
      finalImageLineIdx = i;
    }
    
    if (line.match(/^\s*\},?\s*$/)) {
      if (currentId && currentRarity && finalImageLineIdx !== -1) {
        lines[finalImageLineIdx] = lines[finalImageLineIdx].replace(
          /finalImage:\s*require\([^\)]+\)/, 
          `finalImage: require('../../assets/characters/${currentRarity}/${currentId}.png')`
        );
      }
      currentId = null;
      currentRarity = null;
      finalImageLineIdx = -1;
    }
  }
  
  fs.writeFileSync(fullPath, lines.join('\n'), 'utf8');
  console.log(`Updated ${relativePath}`);
});
