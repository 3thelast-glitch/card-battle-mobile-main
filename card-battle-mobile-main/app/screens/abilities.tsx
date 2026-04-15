import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View, StyleSheet, ScrollView, SafeAreaView,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { ThemedText } from '@/components/ui/ThemedText';
import { AbilityCard } from '@/components/game/ability-card';
import { useRouter } from 'expo-router';
import { ArrowLeft, Save } from 'lucide-react-native';
import * as AbilitiesData from '@/data/abilities';
import {
  getDisabledAbilityIds,
  saveDisabledAbilityIds,
} from '@/lib/game/abilities-store';

type FilterType = 'All' | 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Special';

// ─── إعدادات كل فلتر: اللون النشط + اسمه ─────────────────────────────────
const FILTER_CONFIG: Record<
  FilterType,
  { labelAr: string; activeColor: string; activeBg: string; activeBorder: string }
> = {
  All: {
    labelAr: 'الكل',
    activeColor: '#f97316',
    activeBg: 'rgba(249,115,22,0.15)',
    activeBorder: 'rgba(249,115,22,0.55)',
  },
  Common: {
    labelAr: 'عادي',
    activeColor: '#34d399',
    activeBg: 'rgba(52,211,153,0.12)',
    activeBorder: 'rgba(52,211,153,0.5)',
  },
  Rare: {
    labelAr: 'نادر',
    activeColor: '#60a5fa',
    activeBg: 'rgba(96,165,250,0.12)',
    activeBorder: 'rgba(96,165,250,0.5)',
  },
  Epic: {
    labelAr: 'ملحمي',
    activeColor: '#c084fc',
    activeBg: 'rgba(192,132,252,0.12)',
    activeBorder: 'rgba(192,132,252,0.5)',
  },
  Legendary: {
    labelAr: 'أسطوري',
    activeColor: '#fbbf24',
    activeBg: 'rgba(251,191,36,0.12)',
    activeBorder: 'rgba(251,191,36,0.5)',
  },
  Special: {
    labelAr: 'خاص ✦',
    activeColor: '#e879f9',
    activeBg: 'rgba(232,121,249,0.14)',
    activeBorder: 'rgba(232,121,249,0.6)',
  },
};

const FILTER_ORDER: FilterType[] = ['All', 'Common', 'Rare', 'Epic', 'Legendary', 'Special'];

export default function AbilitiesScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterType>('All');
  const [saveText, setSaveText] = useState('حفظ التعديلات');
  const [saving, setSaving] = useState(false);
  const [disabledIds, setDisabledIds] = useState<Set<number>>(new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getDisabledAbilityIds().then(ids => {
      setDisabledIds(ids);
      setLoaded(true);
    });
  }, []);

  const allAbilities = useMemo(() => {
    const data = AbilitiesData as any;
    if (data.commonAbilities || data.rareAbilities || data.epicAbilities || data.legendaryAbilities) {
      return [
        ...(data.commonAbilities || []),
        ...(data.rareAbilities || []),
        ...(data.epicAbilities || []),
        ...(data.legendaryAbilities || []),
        ...(data.specialAbilities || []),
      ];
    }
    return data.abilities || [];
  }, []);

  const filteredAbilities = useMemo(() => {
    if (filter === 'All') return allAbilities;
    return allAbilities.filter((a: any) => a.rarity === filter);
  }, [allAbilities, filter]);

  const toggleCard = useCallback((id: number) => {
    setDisabledIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    await saveDisabledAbilityIds(disabledIds);
    setSaving(false);
    setSaveText('Saved ✓');
    setTimeout(() => setSaveText('حفظ التعديلات'), 2000);
  }, [disabledIds]);

  if (!loaded) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator color="#f97316" size="large" />
        </View>
      </SafeAreaView>
    );
  }

  const activeConfig = FILTER_CONFIG[filter];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={{ flex: 1, paddingHorizontal: 16 }}>

        {/* ─── Back Button ─── */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <ArrowLeft size={16} color="#fff" />
          <ThemedText style={styles.backText}>رجوع</ThemedText>
        </TouchableOpacity>

        {/* ─── Title ─── */}
        <View style={styles.titleContainer}>
          <ThemedText
            style={[
              styles.title,
              { color: activeConfig.activeColor, textShadowColor: activeConfig.activeColor + 'CC' },
            ]}
          >
            القدرات
          </ThemedText>
          {/* عداد الكروت الظاهرة */}
          <View style={[styles.countBadge, { backgroundColor: activeConfig.activeBg, borderColor: activeConfig.activeBorder }]}>
            <ThemedText style={[styles.countText, { color: activeConfig.activeColor }]}>
              {filteredAbilities.length}
            </ThemedText>
          </View>
        </View>

        {/* ─── Filter Tabs ─── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
          style={{ flexGrow: 0 }}
        >
          {FILTER_ORDER.map((tab) => {
            const cfg = FILTER_CONFIG[tab];
            const isActive = filter === tab;
            const isSpecial = tab === 'Special';
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => setFilter(tab)}
                activeOpacity={0.75}
                style={[
                  styles.filterTab,
                  isActive
                    ? {
                        backgroundColor: cfg.activeBg,
                        borderColor: cfg.activeBorder,
                        // توهج خفيف للندرة الخاصة
                        ...(isSpecial && {
                          shadowColor: cfg.activeColor,
                          shadowOpacity: 0.6,
                          shadowRadius: 10,
                          elevation: 8,
                        }),
                      }
                    : styles.filterTabInactive,
                ]}
              >
                {/* نقطة لون بجانب النص */}
                {isActive && (
                  <View
                    style={[
                      styles.filterDot,
                      { backgroundColor: cfg.activeColor },
                    ]}
                  />
                )}
                <ThemedText
                  style={[
                    styles.filterLabel,
                    { color: isActive ? cfg.activeColor : 'rgba(255,255,255,0.45)' },
                    isActive && { fontWeight: '700' },
                    // Special له حجم نص أكبر قليلاً
                    isSpecial && { letterSpacing: 0.5 },
                  ]}
                >
                  {cfg.labelAr}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ─── فاصل ─── */}
        <View
          style={[
            styles.divider,
            { backgroundColor: activeConfig.activeBorder },
          ]}
        />

        {/* ─── Cards Grid ─── */}
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.grid}
        >
          {filteredAbilities.length > 0 ? (
            <View style={styles.cardsWrap}>
              {filteredAbilities.map((item: any, index: number) => {
                const isDisabled = disabledIds.has(item.id);
                return (
                  <TouchableOpacity
                    key={item.id ?? `ability-${index}`}
                    onPress={() => toggleCard(item.id)}
                    activeOpacity={0.85}
                    style={styles.cardSlot}
                  >
                    <AbilityCard
                      ability={{ ...item, isActive: !isDisabled }}
                      showActionButtons={false}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <ThemedText style={styles.emptyText}>لا توجد قدرات في هذا القسم</ThemedText>
            </View>
          )}
        </ScrollView>

        {/* ─── Floating Save Button ─── */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          style={styles.saveBtn}
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Save size={18} color="#fff" />
          )}
          <ThemedText style={styles.saveBtnText}>{saveText}</ThemedText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#020617',
  },

  backBtn: {
    position: 'absolute',
    top: 24,
    left: 0,
    zIndex: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: 'rgba(30,41,59,0.8)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  backText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },

  titleContainer: {
    marginTop: 72,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  title: {
    fontSize: 38,
    fontWeight: '900',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countText: {
    fontSize: 13,
    fontWeight: '800',
  },

  filterScroll: {
    paddingHorizontal: 4,
    paddingVertical: 4,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 30,
    borderWidth: 1.5,
  },
  filterTabInactive: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderColor: 'rgba(255,255,255,0.08)',
  },
  filterDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '500',
  },

  divider: {
    height: 1.5,
    borderRadius: 2,
    marginTop: 12,
    marginBottom: 16,
    opacity: 0.4,
  },

  grid: {
    alignItems: 'center',
    paddingBottom: 100,
  },
  cardsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    width: '100%',
  },
  cardSlot: {
    width: 220,
    height: 330,
  },

  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 17,
    color: 'rgba(255,255,255,0.35)',
    textAlign: 'center',
  },

  saveBtn: {
    position: 'absolute',
    bottom: 32,
    right: 0,
    zIndex: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 22,
    paddingVertical: 13,
    backgroundColor: '#059669',
    borderRadius: 30,
    shadowColor: '#10b981',
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 8,
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});
