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
  let lines = content.split('\n');
  let modified = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Match the finalImage line, expecting a require with the assets/characters path
    const match = line.match(/finalImage:\s*require\(['"]\.\.\/\.\.\/(assets\/characters\/.*\.png)['"]\)(,?)/);
    
    if (match) {
      const relImagePath = match[1]; // assets/characters/{rarity}/{id}.png
      const comma = match[2];
      const absoluteImagePath = path.join(projectRoot, relImagePath);
      
      if (!fs.existsSync(absoluteImagePath)) {
        // Replace with fallback
        lines[i] = line.replace(/finalImage:\s*require\([^)]+\),?/, `finalImage: require('../../assets/cards/final/human-warrior.png')${comma} // TODO: missing image`);
        modified = true;
        changedCount++;
      }
    }
  }

  if (modified) {
    fs.writeFileSync(fullPath, lines.join('\n'), 'utf8');
    console.log(`Updated missing images in ${file}`);
  }
});

console.log(`Total missing images reverted: ${changedCount}`);
