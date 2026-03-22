// utils/cardImageRegistry.ts
import { ImageSourcePropType } from 'react-native';

const CARD_IMAGE_REGISTRY: Record<string, ImageSourcePropType> = {
    // الصور القالبية (templates) — لا يوجد id خاص لكل بطاقة بعد
    'human-warrior': require('../assets/cards/final/human-warrior.png'),
    'human-knight': require('../assets/cards/final/human-knight.png'),
    'human-mage': require('../assets/cards/final/human-mage.png'),
    'orc-warrior': require('../assets/cards/final/orc-warrior.png'),
    'elf-knight': require('../assets/cards/final/elf-knight.png'),
    'elf-archer': require('../assets/cards/final/elf-archer.png'),
    'dragon-knight': require('../assets/cards/final/dragon-knight.png'),
    'demon-warrior': require('../assets/cards/final/demon-warrior.png'),
    'orc-berserker': require('../assets/cards/final/orc-berserker.png'),
};

export default CARD_IMAGE_REGISTRY;
