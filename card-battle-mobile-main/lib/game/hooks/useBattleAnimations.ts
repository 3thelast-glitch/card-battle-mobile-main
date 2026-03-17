import { useSharedValue, useAnimatedStyle, withTiming, withDelay } from 'react-native-reanimated';

export interface UseBattleAnimationsReturn {
  playerCardAnimatedStyle: ReturnType<typeof useAnimatedStyle>;
  botCardAnimatedStyle: ReturnType<typeof useAnimatedStyle>;
  resultOpacity: ReturnType<typeof useSharedValue<number>>;
  resetAnimations: () => void;
  playEntranceAnimation: () => void;
  playResultAnimation: () => void;
}

export function useBattleAnimations(): UseBattleAnimationsReturn {
  const playerCardScale = useSharedValue(0);
  const botCardScale = useSharedValue(0);
  const vsOpacity = useSharedValue(0);
  const resultOpacity = useSharedValue(0);

  const playerCardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: playerCardScale.value }],
  }));

  const botCardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: botCardScale.value }],
  }));

  // إعادة تعيين جميع القيم
  const resetAnimations = () => {
    playerCardScale.value = 0;
    botCardScale.value = 0;
    vsOpacity.value = 0;
    resultOpacity.value = 0;
  };

  // أنيمشن ظهور البطاقات
  const playEntranceAnimation = () => {
    playerCardScale.value = withDelay(100, withTiming(1, { duration: 300 }));
    botCardScale.value = withDelay(300, withTiming(1, { duration: 300 }));
    vsOpacity.value = withDelay(500, withTiming(1, { duration: 200 }));
  };

  // أنيمشن ظهور النتيجة
  const playResultAnimation = () => {
    resultOpacity.value = withTiming(1, { duration: 300 });
  };

  return {
    playerCardAnimatedStyle,
    botCardAnimatedStyle,
    resultOpacity,
    resetAnimations,
    playEntranceAnimation,
    playResultAnimation,
  };
}
