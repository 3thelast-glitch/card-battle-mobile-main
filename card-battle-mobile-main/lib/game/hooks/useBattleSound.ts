/**
 * useBattleSound
 * ─────────────────────────────────────────────────────────────────────────
 * Hook يُدير أصوات المعركة باستخدام expo-av.
 * - يحمّل الأصوات مسبقاً عند mount.
 * - يحترم إعداد soundEnabled من GameSettings.
 * - يُنظّف (unload) الأصوات عند unmount تلقائياً.
 *
 * الاستخدام:
 *   const sound = useBattleSound(settings.soundEnabled);
 *   sound.playAttack();
 */
import { useEffect, useRef, useCallback } from 'react';
import { Audio } from 'expo-av';

// ── مسارات ملفات الصوت ──────────────────────────────────────────────────────
// غيّر هذه المسارات بعد إضافة ملفات .mp3 فعلية داخل assets/sounds/
const SOUND_FILES = {
  attack:    require('@/assets/sounds/attack.mp3'),
  win:       require('@/assets/sounds/win.mp3'),
  loss:      require('@/assets/sounds/loss.mp3'),
  ability:   require('@/assets/sounds/ability.mp3'),
  nextRound: require('@/assets/sounds/next_round.mp3'),
  draw:      require('@/assets/sounds/draw.mp3'),
} as const;

type SoundKey = keyof typeof SOUND_FILES;

export function useBattleSound(enabled: boolean) {
  const sounds = useRef<Partial<Record<SoundKey, Audio.Sound>>>({});
  const loaded = useRef(false);

  // تحميل مسبق لجميع الأصوات
  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    const load = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
        });

        const entries = Object.entries(SOUND_FILES) as [SoundKey, any][];
        for (const [key, file] of entries) {
          if (cancelled) break;
          try {
            const { sound } = await Audio.Sound.createAsync(file, { shouldPlay: false, volume: 0.7 });
            sounds.current[key] = sound;
          } catch {
            // تجاهل خطأ ملف مفقود بصمت
          }
        }
        if (!cancelled) loaded.current = true;
      } catch {
        // expo-av غير متاح (web أو بيئة بدون صوت)
      }
    };

    load();

    return () => {
      cancelled = true;
      // تنظيف الأصوات عند unmount
      Object.values(sounds.current).forEach(s => {
        s?.unloadAsync().catch(() => {});
      });
      sounds.current = {};
      loaded.current = false;
    };
  }, [enabled]);

  // دالة تشغيل داخلية
  const play = useCallback(async (key: SoundKey) => {
    if (!enabled || !loaded.current) return;
    try {
      const s = sounds.current[key];
      if (!s) return;
      await s.setPositionAsync(0);
      await s.playAsync();
    } catch {
      // تجاهل أخطاء التشغيل بصمت
    }
  }, [enabled]);

  return {
    playAttack:    () => play('attack'),
    playWin:       () => play('win'),
    playLoss:      () => play('loss'),
    playAbility:   () => play('ability'),
    playNextRound: () => play('nextRound'),
    playDraw:      () => play('draw'),
  };
}
