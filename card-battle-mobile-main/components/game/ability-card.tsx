import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Image, TouchableOpacity,
} from 'react-native';
import { ThemedText } from '@/components/ui/ThemedText';
import * as LucideIcons from 'lucide-react-native';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withRepeat, withSequence, withTiming, Easing,
} from 'react-native-reanimated';

export interface AbilityData {
  id: string | number;
  nameEn: string;
  nameAr: string;
  description: string;
  descriptionWarning?: string;
  icon: any;
  rarity: string;
  imageUrl?: string;
  isActive?: boolean;
}

interface Props {
  ability: AbilityData;
  showActionButtons?: boolean;
  onToggleDisabled?: (nowDisabled: boolean) => void;
}

const CARD_W = 200;
const CARD_H = 300;
const ART_H  = 130;

// ─── Art map ────────────────────────────────────────────────────────────────
export const ABILITY_IMAGES: Record<string, any> = {
  'default': require('../../assets/abilities/Add_Element_Art.png'),
  'Add_Element_Art': require('../../assets/abilities/Add_Element_Art.png'),
  'Arise_Art': require('../../assets/abilities/Arise_Art.png'),
  'Avatar_Art': require('../../assets/abilities/Avatar_Art.png'),
  'Cancel_Ability_Art': require('../../assets/abilities/Cancel_Ability_Art.png'),
  'Compensation_Art': require('../../assets/abilities/Compensation_Art.png'),
  'Consecutive_Loss_Buff_Art': require('../../assets/abilities/Consecutive_Loss_Buff_Art.png'),
  'Conversion_Art': require('../../assets/abilities/Conversion_Art.png'),
  'Convert_Debuffs_Art': require('../../assets/abilities/Convert_Debuffs_Art.png'),
  'Deprivation_(Ability)_Art': require('../../assets/abilities/Deprivation_(Ability)_Art.png'),
  'Dilemma_Art': require('../../assets/abilities/Dilemma_Art.png'),
  'Disaster_Art': require('../../assets/abilities/Disaster_Art.png'),
  'Double_Or_Nothing_Art': require('../../assets/abilities/Double Or Nothing_Art.png'),
  'Double_Points_Art': require('../../assets/abilities/Double Points_Art.png'),
  'Double_Your_Buffs_Art': require('../../assets/abilities/Double Your Buffs_Art.png'),
  'Double_Next_Cards_Art': require('../../assets/abilities/Double_Next_Cards_Art.png'),
  'Eclipse_Art': require('../../assets/abilities/Eclipse_Art.png'),
  'Elemental_Mastery_Art': require('../../assets/abilities/Elemental Mastery_Art.png'),
  'Explosion_Art': require('../../assets/abilities/Explosion_Art.png'),
  'Greed_Art': require('../../assets/abilities/Greed_Art.png'),
  'Halve_Points_Art': require('../../assets/abilities/Halve_Points_Art.png.png'),
  'LOGICAL_ENCOUNTER_Art': require('../../assets/abilities/LOGICAL ENCOUNTER_Art.png'),
  'Lifesteal_Art': require('../../assets/abilities/Lifesteal_Art.png'),
  'Merge_Art': require('../../assets/abilities/Merge_Art.png'),
  'Misdirection_Art': require('../../assets/abilities/Misdirection_Art.png'),
  'Penetration_Art': require('../../assets/abilities/Penetration_Art.png'),
  'Pool_Art': require('../../assets/abilities/Pool_Art.png'),
  'Propaganda_Art': require('../../assets/abilities/Propaganda_Art.png'),
  'Protection_Art': require('../../assets/abilities/Protection_Art.png'),
  'Purge_Art': require('../../assets/abilities/Purge_Art.png'),
  'Recall_Art': require('../../assets/abilities/Recall_Art.png'),
  'Reduction_Art': require('../../assets/abilities/Reduction_Art.png'),
  'Reinforcement_Art': require('../../assets/abilities/Reinforcement_Art.png'),
  'Rescue_Art': require('../../assets/abilities/Rescue_Art.png'),
  'Revenge_Art': require('../../assets/abilities/Revenge_Art.png'),
  'Revive_Art': require('../../assets/abilities/Revive_Art.png'),
  'Sacrifice_Art': require('../../assets/abilities/Sacrifice_Art.png'),
  'Seal_Art': require('../../assets/abilities/Seal_Art.png'),
  'Shield_Art': require('../../assets/abilities/Shield_Art.png'),
  'Skip_Art': require('../../assets/abilities/Skip_Art.png'),
  'Sniping_Art': require('../../assets/abilities/Sniping_Art.png'),
  'Star_Superiority_Art': require('../../assets/abilities/Star Superiority_Art.png'),
  'Steal_Ability_Art': require('../../assets/abilities/Steal Ability_Art.png'),
  'Subhan_Art': require('../../assets/abilities/Subhan_Art.png'),
  'Suicide_Art': require('../../assets/abilities/Suicide_Art.png'),
  'Take_It_Art': require('../../assets/abilities/Take It_Art.png'),
  'Trap_Art': require('../../assets/abilities/Trap_Art.png'),
  'Weakening_Art': require('../../assets/abilities/Weakening_Art.png'),
  'Wipe_Art': require('../../assets/abilities/Wipe_Art.png'),
};

// ─── Rarity config ────────────────────────────────────────────────────────────────
const RARITY_THEMES: Record<string, {
  primary: string;
  border: string;
  badgeBg: string;
  label: string;
  labelAr: string;
  borderWidth: number;
  shimmer: boolean;
  stars: number;
  glowPeak: number;
}> = {
  Common:    { primary: '#10b981', border: '#10b981',  badgeBg: 'rgba(16,185,129,0.18)',   label: 'COMMON',    labelAr: 'عادي',    borderWidth: 1.5, shimmer: false, stars: 1, glowPeak: 0.5 },
  Rare:      { primary: '#3b82f6', border: '#3b82f6',  badgeBg: 'rgba(59,130,246,0.18)',   label: 'RARE',      labelAr: 'نادر',    borderWidth: 2,   shimmer: false, stars: 2, glowPeak: 0.6 },
  Epic:      { primary: '#a855f7', border: '#a855f7',  badgeBg: 'rgba(168,85,247,0.20)',   label: 'EPIC',      labelAr: 'ملحمي',   borderWidth: 2,   shimmer: false, stars: 3, glowPeak: 0.7 },
  Legendary: { primary: '#f59e0b', border: '#f59e0b',  badgeBg: 'rgba(245,158,11,0.22)',   label: 'LEGENDARY', labelAr: 'أسطوري',  borderWidth: 2.5, shimmer: true,  stars: 4, glowPeak: 0.9 },
  Special:   { primary: '#e879f9', border: '#e879f9',  badgeBg: 'rgba(232,121,249,0.22)',  label: 'SPECIAL',   labelAr: 'خاص ✦',   borderWidth: 2.5, shimmer: true,  stars: 4, glowPeak: 0.95 },
};

// ─── Shimmer animation ───
function ShimmerSweep({ color }: { color: string }) {
  const x = useSharedValue(-CARD_W);
  useEffect(() => {
    x.value = withRepeat(
      withSequence(
        withTiming(CARD_W * 1.5, { duration: 1800, easing: Easing.inOut(Easing.quad) }),
        withTiming(-CARD_W, { duration: 0 }),
      ), -1,
    );
  }, []);
  const style = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, style, { overflow: 'hidden', zIndex: 9, borderRadius: 18 }]}>
      <View style={[styles.shimmerLine, { backgroundColor: color + '18', borderColor: color + '40' }]} />
    </Animated.View>
  );
}

// ─── Stars ───
function Stars({ count, color }: { count: number; color: string }) {
  return (
    <View style={styles.starsRow}>
      {Array.from({ length: 4 }).map((_, i) => (
        <Text key={i} style={{ fontSize: 9, color: i < count ? color : color + '28' }}>★</Text>
      ))}
    </View>
  );
}

// ─── Main ───
export function AbilityCard({ ability, showActionButtons = true, onToggleDisabled }: Props) {
  const IconComponent = ability.icon;
  const [localRarity, setLocalRarity] = useState(ability.rarity);
  const [isDisabled, setIsDisabled]   = useState(ability.isActive === false);

  useEffect(() => { setIsDisabled(ability.isActive === false); }, [ability.isActive]);

  const theme = RARITY_THEMES[localRarity] ?? RARITY_THEMES.Common;

  const cycleRarity = () => {
    const list = ['Common', 'Rare', 'Epic', 'Legendary', 'Special'];
    setLocalRarity(list[(list.indexOf(localRarity) + 1) % list.length]);
  };
  const handleToggle = () => {
    const next = !isDisabled;
    setIsDisabled(next);
    onToggleDisabled?.(next);
  };

  const key = ability.nameEn.replaceAll(' ', '_') + '_Art';
  const img = ABILITY_IMAGES[key] ?? ABILITY_IMAGES['default'];

  // ─── Pulsing border glow ───
  const glow = useSharedValue(theme.glowPeak * 0.4);
  useEffect(() => {
    glow.value = withRepeat(
      withSequence(
        withTiming(theme.glowPeak,          { duration: 1600, easing: Easing.inOut(Easing.sin) }),
        withTiming(theme.glowPeak * 0.35,   { duration: 1600, easing: Easing.inOut(Easing.sin) }),
      ), -1, true,
    );
  }, [localRarity]);
  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: glow.value,
    shadowColor:   theme.primary,
  }));

  const warningText = (ability as any).descriptionWarning as string | undefined;

  return (
    <Animated.View style={[
      styles.shell,
      { shadowColor: theme.primary, shadowRadius: 18, shadowOffset: { width: 0, height: 0 } },
      glowStyle,
      isDisabled && styles.disabledShell,
    ]}>

      {/* ─── Card body ─── */}
      <View style={[styles.card, { borderColor: theme.border + 'AA', borderWidth: theme.borderWidth }]}>

        {/* ─── Top accent line (lون الندرة) ─── */}
        <View style={[styles.accentLine, { backgroundColor: theme.primary }]} />

        {/* ─── Art zone ─── */}
        <View style={styles.artZone}>
          <Image source={img} style={styles.artImage} resizeMode="cover" />
          {/* gradient overlay من أسفل */}
          <View style={styles.artGradient} />
          {/* Badge ندرة فوق الصورة */}
          <View style={[styles.rarityBadge, { backgroundColor: theme.badgeBg, borderColor: theme.border + '88' }]}>
            <Text style={[styles.rarityText, { color: theme.primary }]}>{theme.label}</Text>
          </View>
          {/* أيقونة القدرة — دائرة في منتصف أسفل الصورة */}
          <View style={[styles.iconBadge, { backgroundColor: '#0a0a0a', borderColor: theme.primary }]}>
            {IconComponent
              ? <IconComponent size={18} color={theme.primary} strokeWidth={2} />
              : <LucideIcons.Zap size={18} color={theme.primary} strokeWidth={2} />}
          </View>
        </View>

        {/* ─── Body ─── */}
        <View style={styles.body}>

          {/* ─── Names ─── */}
          <Text style={[styles.nameAr, { color: theme.primary }]} numberOfLines={1}>
            {ability.nameAr}
          </Text>
          <Text style={styles.nameEn} numberOfLines={1}>
            {ability.nameEn}
          </Text>

          {/* ─── فاصل ─── */}
          <View style={[styles.divider, { backgroundColor: theme.primary + '55' }]} />

          {/* ─── Description ─── */}
          <Text style={styles.desc} numberOfLines={3}>{ability.description}</Text>
          {warningText
            ? <Text style={styles.warning} numberOfLines={2}>⚠️ {warningText}</Text>
            : null}
        </View>

        {/* ─── Footer bar ─── */}
        <View style={[styles.footer, { borderTopColor: theme.border + '55' }]}>
          <Stars count={theme.stars} color={theme.primary} />
          <Text style={[styles.footerLabel, { color: theme.primary + 'BB' }]}>{theme.labelAr}</Text>
        </View>

        {/* ─── Shimmer ─── */}
        {theme.shimmer && <ShimmerSweep color={theme.primary} />}

        {/* ─── Disabled overlay ─── */}
        {isDisabled && (
          <View style={styles.disabledOverlay}>
            <View style={styles.disabledStamp}>
              <Text style={styles.disabledText}>DEACTIVATED</Text>
            </View>
          </View>
        )}

        {/* ─── Controls ─── */}
        {showActionButtons && (
          <View style={styles.controls}>
            <TouchableOpacity
              onPress={handleToggle}
              style={[styles.ctrlBtn, isDisabled && styles.ctrlBtnRed]}
            >
              <LucideIcons.Power size={9} color={isDisabled ? '#ef4444' : '#94a3b8'} />
            </TouchableOpacity>
            {__DEV__ && (
              <TouchableOpacity onPress={cycleRarity} style={styles.ctrlBtn}>
                <LucideIcons.RefreshCw size={9} color="#38bdf8" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </Animated.View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  shell: {
    width: CARD_W, height: CARD_H,
    elevation: 16,
  },
  disabledShell: { opacity: 0.42 },

  card: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: '#080808',
    overflow: 'hidden',
  },

  // ─── خط علوي ملون
  accentLine: {
    height: 3,
    borderRadius: 2,
  },

  // ─── منطقة الصورة
  artZone: {
    width: '100%',
    height: ART_H,
    backgroundColor: '#111',
    overflow: 'hidden',
  },
  artImage: {
    width: '100%',
    height: '100%',
  },
  // gradient أسفل الصورة
  artGradient: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: 50,
    backgroundColor: 'transparent',
    // محاكاة gradient بـ shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 1,
    shadowRadius: 20,
  },
  // شريط أسود متدرج حقيقي (Web-safe)
  // نستبدل artGradient بـ View ملون
  rarityBadge: {
    position: 'absolute',
    top: 8, left: 8,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    zIndex: 10,
  },
  rarityText: {
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  // دائرة الأيقونة في منتصف أسفل الصورة
  iconBadge: {
    position: 'absolute',
    bottom: -18,
    alignSelf: 'center',
    width: 38, height: 38,
    borderRadius: 19,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    // ظل أسود خلف الأيقونة
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 8,
  },

  // ─── Body
  body: {
    flex: 1,
    paddingTop: 24,     // مسافة للـ iconBadge
    paddingHorizontal: 12,
    paddingBottom: 4,
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 4,
  },
  nameAr: {
    fontSize: 15,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 0.4,
  },
  nameEn: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748b',
    textAlign: 'center',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  divider: {
    width: 40, height: 1.5,
    borderRadius: 1,
    marginVertical: 4,
  },
  desc: {
    fontSize: 9.5,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 14,
    writingDirection: 'rtl',
  },
  warning: {
    fontSize: 8.5,
    color: '#f87171',
    textAlign: 'center',
    lineHeight: 13,
    marginTop: 4,
  },

  // ─── Footer
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderTopWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  starsRow: { flexDirection: 'row', gap: 2 },
  footerLabel: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },

  // ─── Shimmer
  shimmerLine: {
    position: 'absolute', top: 0, bottom: 0,
    width: 24,
    borderLeftWidth: 1, borderRightWidth: 1,
    transform: [{ skewX: '-16deg' }],
  },

  // ─── Disabled
  disabledOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 40,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledStamp: {
    backgroundColor: 'rgba(220,38,38,0.9)',
    paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 2, borderColor: '#f87171',
    transform: [{ rotate: '-10deg' }],
  },
  disabledText: {
    color: '#fff', fontWeight: '900',
    fontSize: 9, letterSpacing: 2.5,
  },

  // ─── Controls
  controls: {
    position: 'absolute',
    top: 8, right: 8,
    zIndex: 50,
    flexDirection: 'row', gap: 4,
  },
  ctrlBtn: {
    width: 20, height: 20, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  ctrlBtnRed: {
    backgroundColor: 'rgba(239,68,68,0.2)',
    borderColor: 'rgba(239,68,68,0.5)',
  },
});
