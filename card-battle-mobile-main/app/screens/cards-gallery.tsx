import React, { useState, useEffect } from 'react';
import {
  View, TouchableOpacity, StyleSheet, ScrollView, Modal,
  TextInput, Switch, Text as RNText, Image, Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText as Text } from '@/components/ui/ThemedText';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { LuxuryBackground } from '@/components/game/luxury-background';
import { LuxuryCharacterCardAnimated } from '@/components/game/luxury-character-card-animated';
import { RotateHintScreen } from '@/components/game/RotateHintScreen';
import { ALL_CARDS } from '@/lib/game/cards-data-exports';
import { Card } from '@/lib/game/types';
import { getRarityConfig } from '@/lib/game/card-rarity';
import { useLandscapeLayout, useCardSize, LAYOUT_PADDING } from '@/utils/layout';
import { ArrowLeft, Minus, Plus, Image as ImageIcon, X, ChevronUp, ChevronDown } from 'lucide-react-native';
import { saveImage, loadImage, deleteImage } from '@/lib/game/image-storage';

export const CARD_EDITS_KEY = 'card_edits_v1';

const UNIQUE_CARDS: Card[] = Object.values(
  ALL_CARDS.reduce<Record<string, Card>>((acc, card) => {
    acc[card.id] = card;
    return acc;
  }, {})
);

const RARITY_ORDER: Record<string, number> = {
  legendary: 0, epic: 1, rare: 2, common: 3,
};

type CardEdits = {
  nameAr: string;
  stars: number;
  hasAbility: boolean;
  specialAbility: string;
  attack: number;
  defense: number;
  customImage?: string;
  imageOffsetY: number;
  fitInsideBorder: boolean;
};

function toEdits(card: Card & { customImage?: string; imageOffsetY?: number; fitInsideBorder?: boolean }): CardEdits {
  return {
    nameAr: card.nameAr ?? '',
    stars: card.stars ?? 0,
    hasAbility: !!card.specialAbility,
    specialAbility: card.specialAbility ?? '',
    attack: card.attack,
    defense: card.defense,
    customImage: card.customImage,
    imageOffsetY: card.imageOffsetY ?? 0,
    fitInsideBorder: card.fitInsideBorder ?? false,
  };
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <View style={ep.starRow}>
      <TouchableOpacity onPress={() => onChange(0)} activeOpacity={0.7} style={[ep.clearBtn, value === 0 && ep.clearBtnActive]}>
        <RNText style={[ep.clearBtnTxt, value === 0 && { color: '#f87171' }]}>✕</RNText>
      </TouchableOpacity>
      {[1, 2, 3, 4, 5].map(n => (
        <TouchableOpacity key={n} onPress={() => onChange(n)} activeOpacity={0.7} style={ep.starBtn}>
          <RNText style={[ep.starIcon, { color: n <= value ? '#FFD700' : '#2a2a2a' }]}>★</RNText>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function StatStepper({ icon, label, value, color, onChange }: {
  icon: string; label: string; value: number; color: string; onChange: (v: number) => void;
}) {
  return (
    <View style={ep.statCol}>
      <RNText style={ep.statIcon}>{icon}</RNText>
      <View style={ep.statRow}>
        <TouchableOpacity onPress={() => onChange(clamp(value - 1, 0, 999))} style={[ep.stepBtn, { borderColor: color + '55' }]} activeOpacity={0.7}>
          <Minus size={12} color={color} />
        </TouchableOpacity>
        <TextInput
          style={[ep.statInput, { color, borderColor: color + '44' }]}
          value={String(value)}
          keyboardType="numeric"
          onChangeText={t => { const n = parseInt(t); if (!isNaN(n)) onChange(clamp(n, 0, 999)); }}
        />
        <TouchableOpacity onPress={() => onChange(clamp(value + 1, 0, 999))} style={[ep.stepBtn, { borderColor: color + '55' }]} activeOpacity={0.7}>
          <Plus size={12} color={color} />
        </TouchableOpacity>
      </View>
      <RNText style={[ep.statLabel, { color: color + '99' }]}>{label}</RNText>
    </View>
  );
}

function ImagePickerSection({ value, rarityColor, onChange }: {
  value?: string; rarityColor: string; onChange: (uri: string | undefined) => void;
}) {
  const handlePick = () => {
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e: Event) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => { if (typeof reader.result === 'string') onChange(reader.result); };
        reader.readAsDataURL(file);
      };
      input.click();
    }
  };
  return (
    <View style={ep.imgSection}>
      {value ? (
        <View style={ep.imgPreviewWrap}>
          <Image source={{ uri: value }} style={ep.imgPreview} resizeMode="contain" />
          <TouchableOpacity style={ep.imgRemoveBtn} onPress={() => onChange(undefined)} activeOpacity={0.8}>
            <X size={12} color="#fff" />
          </TouchableOpacity>
        </View>
      ) : null}
      <TouchableOpacity style={[ep.imgPickBtn, { borderColor: rarityColor + '66' }]} onPress={handlePick} activeOpacity={0.8}>
        <ImageIcon size={14} color={rarityColor} />
        <RNText style={[ep.imgPickTxt, { color: rarityColor }]}>{value ? 'تغيير الصورة' : 'اختر صورة من الجهاز'}</RNText>
      </TouchableOpacity>
    </View>
  );
}

function ImageOffsetAdjuster({ value, rarityColor, onChange }: {
  value: number; rarityColor: string; onChange: (v: number) => void;
}) {
  const STEP = 10;
  return (
    <View style={ep.offsetRow}>
      <TouchableOpacity style={[ep.offsetBtn, { borderColor: rarityColor + '55' }]} onPress={() => onChange(value - STEP)} activeOpacity={0.7}>
        <ChevronUp size={14} color={rarityColor} />
        <RNText style={[ep.offsetBtnTxt, { color: rarityColor }]}>لأعلى</RNText>
      </TouchableOpacity>
      <View style={ep.offsetValueBox}>
        <RNText style={[ep.offsetValue, { color: rarityColor }]}>{value > 0 ? `+${value}` : value}</RNText>
        <RNText style={ep.offsetHint}>px</RNText>
      </View>
      <TouchableOpacity style={[ep.offsetBtn, { borderColor: rarityColor + '55' }]} onPress={() => onChange(value + STEP)} activeOpacity={0.7}>
        <ChevronDown size={14} color={rarityColor} />
        <RNText style={[ep.offsetBtnTxt, { color: rarityColor }]}>لأسفل</RNText>
      </TouchableOpacity>
      <TouchableOpacity style={[ep.offsetResetBtn, { borderColor: '#44444466' }]} onPress={() => onChange(0)} activeOpacity={0.7}>
        <RNText style={ep.offsetResetTxt}>إعادة</RNText>
      </TouchableOpacity>
    </View>
  );
}

export default function CardsGalleryScreen() {
  const router = useRouter();
  const [savedMap, setSavedMap] = useState<Record<string, Partial<Card & { customImage?: string; imageOffsetY?: number; fitInsideBorder?: boolean }>>>({});
  const [cards, setCards] = useState<(Card & { customImage?: string; imageOffsetY?: number; fitInsideBorder?: boolean })[]>(UNIQUE_CARDS);
  const [selectedCard, setSelectedCard] = useState<(Card & { customImage?: string; imageOffsetY?: number; fitInsideBorder?: boolean }) | null>(null);
  const [edits, setEdits] = useState<CardEdits | null>(null);
  const [previewCard, setPreviewCard] = useState<(Card & { customImage?: string; imageOffsetY?: number; fitInsideBorder?: boolean }) | null>(null);
  const { isLandscape, size } = useLandscapeLayout();
  const [activeFilter, setActiveFilter] = useState('All');

  const { cardW: galleryCardW, cardH: galleryCardH } = useCardSize('gallery');
  const { cardW: modalCardW,   cardH: modalCardH   } = useCardSize('modal');
  const padding = LAYOUT_PADDING[size];
  const gridGap = size === 'sm' ? 10 : size === 'md' ? 14 : size === 'lg' ? 18 : 22;

  useEffect(() => {
    AsyncStorage.getItem(CARD_EDITS_KEY).then(async raw => {
      if (!raw) return;
      try {
        const map: Record<string, any> = JSON.parse(raw);
        const entries = await Promise.all(
          Object.entries(map).map(async ([id, edits]) => {
            if (edits.hasCustomImage) {
              const img = await loadImage(`card_img_${id}`);
              if (img) edits.customImage = img;
            }
            return [id, edits] as [string, any];
          })
        );
        const fullMap = Object.fromEntries(entries);
        setSavedMap(fullMap);
        setCards(UNIQUE_CARDS.map((c: Card) => fullMap[c.id] ? { ...c, ...fullMap[c.id] } : c));
      } catch {}
    });
  }, []);

  useEffect(() => {
    if (!selectedCard || !edits) { setPreviewCard(null); return; }
    setPreviewCard({
      ...selectedCard,
      nameAr: edits.nameAr || selectedCard.nameAr,
      stars: edits.stars,
      specialAbility: edits.hasAbility ? (edits.specialAbility || undefined) : undefined,
      attack: edits.attack,
      defense: edits.defense,
      customImage: edits.customImage,
      imageOffsetY: edits.imageOffsetY,
      fitInsideBorder: edits.fitInsideBorder,
      ...(edits.customImage ? { finalImage: { uri: edits.customImage } as any } : {}),
    });
  }, [edits, selectedCard]);

  const handleCardPress = (card: Card & { customImage?: string; imageOffsetY?: number; fitInsideBorder?: boolean }) => {
    setSelectedCard(card);
    setEdits(toEdits(card));
  };

  const handleSave = async () => {
    if (!selectedCard || !edits) { handleClose(); return; }

    if (edits.customImage) {
      await saveImage(`card_img_${selectedCard.id}`, edits.customImage);
    } else {
      await deleteImage(`card_img_${selectedCard.id}`);
    }

    const overrides = {
      nameAr: edits.nameAr || selectedCard.nameAr,
      stars: edits.stars,
      specialAbility: edits.hasAbility ? (edits.specialAbility || undefined) : undefined,
      attack: edits.attack,
      defense: edits.defense,
      hasCustomImage: !!edits.customImage,
      customImage: edits.customImage,
      imageOffsetY: edits.imageOffsetY,
      fitInsideBorder: edits.fitInsideBorder,
      ...(edits.customImage ? { finalImage: { uri: edits.customImage } as any } : {}),
    };

    const { customImage: _drop, finalImage: _drop2, ...storeSafe } = overrides as any;
    const newMap = { ...savedMap, [selectedCard.id]: { ...storeSafe, customImage: undefined } };

    setSavedMap({ ...savedMap, [selectedCard.id]: overrides });
    await AsyncStorage.setItem(CARD_EDITS_KEY, JSON.stringify(newMap));
    setCards(prev => prev.map(c => c.id === selectedCard.id ? { ...c, ...overrides } : c));
    handleClose();
  };

  const handleClose = () => { setSelectedCard(null); setEdits(null); setPreviewCard(null); };
  const patch = (p: Partial<CardEdits>) => setEdits(prev => prev ? { ...prev, ...p } : prev);

  if (!isLandscape) return <RotateHintScreen />;

  const filteredCards = cards.filter(card => {
    if (activeFilter === 'All') return true;
    const rarity = (card.rarity ?? 'common').toLowerCase();
    const filterMap: Record<string, string> = { 'Common': 'common', 'Rare': 'rare', 'ملحمية': 'epic', 'أسطورية': 'legendary' };
    return rarity === (filterMap[activeFilter] ?? activeFilter.toLowerCase());
  });

  const sortedCards = [...filteredCards].sort((a, b) => {
    const ra = RARITY_ORDER[a.rarity ?? 'common'] ?? 4;
    const rb = RARITY_ORDER[b.rarity ?? 'common'] ?? 4;
    if (ra !== rb) return ra - rb;
    return (a.nameAr || a.name).localeCompare(b.nameAr || b.name, 'ar');
  });

  const FILTER_TABS = [
    { label: 'All',      cls: 'border-orange-500 text-orange-500 bg-orange-500/10' },
    { label: 'Common',   cls: 'border-emerald-500 text-emerald-500 bg-emerald-500/10' },
    { label: 'Rare',     cls: 'border-blue-500 text-blue-500 bg-blue-500/10' },
    { label: 'ملحمية',  cls: 'border-purple-500 text-purple-500 bg-purple-500/10' },
    { label: 'أسطورية', cls: 'border-amber-500 text-amber-500 bg-amber-500/10' },
  ];

  const rarityColor = selectedCard ? getRarityConfig(selectedCard.rarity).badgeColor : '#d4af37';

  return (
    <ScreenContainer edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.bg}><LuxuryBackground /></View>

      <TouchableOpacity
        onPress={() => router.back()}
        className="absolute top-6 left-6 z-50 flex-row items-center gap-2 px-4 py-2 bg-slate-800/80 backdrop-blur-md rounded-xl border border-white/10"
        activeOpacity={0.7}
      >
        <ArrowLeft size={16} color="#fff" />
        <Text className="text-white text-sm font-bold">رجوع</Text>
      </TouchableOpacity>

      <View style={styles.container} className="pt-4 pb-2">
        <View className="mb-2 mt-4 items-center">
          <Text style={styles.title}>Card Collection</Text>
          <Text style={styles.subtitle}>{sortedCards.length} cards</Text>
        </View>

        <View className="flex-row flex-wrap justify-center gap-2 mb-4 px-4 mt-2">
          {FILTER_TABS.map(tab => {
            const active = activeFilter === tab.label;
            return (
              <TouchableOpacity key={tab.label} onPress={() => setActiveFilter(tab.label)} className={`px-4 py-1.5 rounded-full border border-white/10 bg-[#0f172a]/80 ${active ? tab.cls.split(' ').slice(0, 3).join(' ') : ''}`} activeOpacity={0.7}>
                <Text className={`text-sm font-bold ${active ? tab.cls.split(' ')[1] : 'text-gray-400'}`}>{tab.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={[styles.grid, { gap: gridGap, paddingHorizontal: padding }]}>
            {sortedCards.map(card => (
              <TouchableOpacity key={card.id} onPress={() => handleCardPress(card)} activeOpacity={0.85}>
                <LuxuryCharacterCardAnimated
                  card={card}
                  imageOffsetY={card.imageOffsetY ?? 0}
                  fitInsideBorder={card.fitInsideBorder ?? false}
                  style={{ width: galleryCardW, height: galleryCardH }}
                />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <Modal visible={!!selectedCard} animationType="fade" transparent onRequestClose={handleClose}>
        <View style={styles.overlay}>
          {selectedCard && edits && previewCard && (
            <View style={styles.modalRow}>
              <View pointerEvents="none">
                <LuxuryCharacterCardAnimated
                  card={previewCard}
                  imageOffsetY={edits.imageOffsetY}
                  fitInsideBorder={edits.fitInsideBorder}
                  style={{ width: modalCardW, height: modalCardH }}
                />
              </View>

              <View style={[ep.panel, { borderColor: rarityColor + '77' }]}>
                <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                  <RNText style={[ep.title, { color: rarityColor }]}>{edits.nameAr || selectedCard.nameAr || selectedCard.name}</RNText>
                  <RNText style={ep.sub}>{selectedCard.name}</RNText>
                  <View style={ep.divider} />

                  {/* حقل تعديل الاسم العربي */}
                  <RNText style={ep.label}>✏️ الاسم العربي</RNText>
                  <TextInput
                    style={[ep.nameArInput, { borderColor: rarityColor + '55', color: rarityColor }]}
                    value={edits.nameAr}
                    onChangeText={t => patch({ nameAr: t })}
                    placeholder="الاسم بالعربي..."
                    placeholderTextColor="#444"
                    textAlign="right"
                    writingDirection="rtl"
                  />
                  <View style={ep.divider} />

                  <RNText style={ep.label}>⭐ عدد النجوم</RNText>
                  <StarPicker value={edits.stars} onChange={n => patch({ stars: n })} />
                  {edits.stars === 0 && <RNText style={ep.hint}>الكرت بدون نجوم</RNText>}
                  <View style={ep.divider} />

                  <View style={ep.switchRow}>
                    <RNText style={ep.label}>❆ يملك قدرة خاصة</RNText>
                    <Switch value={edits.hasAbility} onValueChange={v => patch({ hasAbility: v })} trackColor={{ false: '#1e1e1e', true: rarityColor + '66' }} thumbColor={edits.hasAbility ? rarityColor : '#555'} />
                  </View>

                  {edits.hasAbility && (
                    <View style={ep.abilityBox}>
                      <TextInput
                        style={[ep.abilityInput, { borderColor: rarityColor + '55' }]}
                        value={edits.specialAbility}
                        onChangeText={t => patch({ specialAbility: t })}
                        placeholder="اكتب القدرة الخاصة هنا..."
                        placeholderTextColor="#444"
                        multiline
                        textAlign="right"
                        textAlignVertical="top"
                        scrollEnabled
                      />
                    </View>
                  )}
                  <View style={ep.divider} />

                  <RNText style={ep.label}>⚙️ الطاقات</RNText>
                  <View style={ep.steppers}>
                    <StatStepper icon="⚔️" label="هجوم" value={edits.attack}   color="#f87171" onChange={v => patch({ attack: v })} />
                    <StatStepper icon="🛡️" label="درع"  value={edits.defense} color="#60a5fa" onChange={v => patch({ defense: v })} />
                  </View>
                  <View style={ep.divider} />

                  <RNText style={ep.label}>🖼️ صورة الكرت</RNText>
                  <ImagePickerSection value={edits.customImage} rarityColor={rarityColor} onChange={uri => patch({ customImage: uri, imageOffsetY: 0, fitInsideBorder: false })} />

                  {edits.customImage && (
                    <>
                      <View style={ep.divider} />
                      <View style={ep.switchRow}>
                        <RNText style={ep.label}>📄 احتواء داخل الحدود</RNText>
                        <Switch
                          value={edits.fitInsideBorder}
                          onValueChange={v => patch({ fitInsideBorder: v })}
                          trackColor={{ false: '#1e1e1e', true: rarityColor + '66' }}
                          thumbColor={edits.fitInsideBorder ? rarityColor : '#555'}
                        />
                      </View>
                      <View style={ep.divider} />
                      <RNText style={ep.label}>🔄 موضع الصورة عمودياً</RNText>
                      <ImageOffsetAdjuster value={edits.imageOffsetY} rarityColor={rarityColor} onChange={v => patch({ imageOffsetY: v })} />
                    </>
                  )}
                  <View style={ep.divider} />

                  <View style={ep.actionRow}>
                    <TouchableOpacity style={[ep.actionBtn, { borderColor: '#444' }]} onPress={handleClose} activeOpacity={0.8}>
                      <RNText style={{ color: '#888', fontWeight: '700', fontSize: 13 }}>إلغاء</RNText>
                    </TouchableOpacity>
                    <TouchableOpacity style={[ep.actionBtn, { borderColor: rarityColor + '88', backgroundColor: rarityColor + '18' }]} onPress={handleSave} activeOpacity={0.8}>
                      <RNText style={{ color: rarityColor, fontWeight: '800', fontSize: 13 }}>✔ حفظ</RNText>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </View>
            </View>
          )}
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const ep = StyleSheet.create({
  panel: { backgroundColor: 'rgba(10,10,16,0.97)', padding: 18, borderRadius: 20, borderWidth: 1.5, width: 290, maxHeight: 520 },
  title:   { fontSize: 19, fontWeight: '800', textAlign: 'center', marginBottom: 2 },
  sub:     { fontSize: 11, color: '#555', textAlign: 'center', marginBottom: 2 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginVertical: 10 },
  label:   { fontSize: 11, color: '#999', fontWeight: '700', marginBottom: 7, textAlign: 'right' },
  hint:    { fontSize: 10, color: '#f87171', textAlign: 'center', marginTop: 3, opacity: 0.8 },
  nameArInput: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'right',
    writingDirection: 'rtl',
    marginBottom: 2,
  },
  starRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 3, marginBottom: 2 },
  starBtn: { padding: 3 },
  starIcon: { fontSize: 26 },
  clearBtn: { width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: '#333', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.04)' },
  clearBtnActive: { borderColor: '#f87171', backgroundColor: 'rgba(248,113,113,0.1)' },
  clearBtnTxt: { fontSize: 13, color: '#555', fontWeight: '800' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  abilityBox: { marginTop: 6 },
  abilityInput: { backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderRadius: 10, padding: 10, color: '#e2e8f0', fontSize: 12, minHeight: 58, maxHeight: 110, writingDirection: 'rtl' },
  steppers:  { flexDirection: 'row', justifyContent: 'space-around', gap: 10 },
  statCol:   { alignItems: 'center', gap: 4, flex: 1 },
  statIcon:  { fontSize: 18 },
  statRow:   { flexDirection: 'row', alignItems: 'center', gap: 5 },
  stepBtn:   { width: 26, height: 26, borderRadius: 7, borderWidth: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.05)' },
  statInput: { width: 46, height: 32, borderRadius: 8, borderWidth: 1, textAlign: 'center', fontSize: 15, fontWeight: '800', backgroundColor: 'rgba(255,255,255,0.04)' },
  statLabel: { fontSize: 10, fontWeight: '600' },
  actionRow: { flexDirection: 'row', gap: 10, justifyContent: 'center', marginBottom: 2 },
  actionBtn: { flex: 1, paddingVertical: 10, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.03)' },
  imgSection:     { gap: 8 },
  imgPreviewWrap: {
    position: 'relative', alignSelf: 'center',
    width: 110, height: 140,
    borderRadius: 10, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    overflow: 'hidden',
  },
  imgPreview:     { width: '100%', height: '100%' },
  imgRemoveBtn:   { position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: 10, backgroundColor: '#f87171', alignItems: 'center', justifyContent: 'center' },
  imgPickBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8, borderRadius: 12, borderWidth: 1, backgroundColor: 'rgba(255,255,255,0.04)' },
  imgPickTxt:     { fontSize: 12, fontWeight: '700' },
  offsetRow:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  offsetBtn:      { flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1, backgroundColor: 'rgba(255,255,255,0.04)', minWidth: 52 },
  offsetBtnTxt:   { fontSize: 9, fontWeight: '700' },
  offsetValueBox: { alignItems: 'center', minWidth: 44 },
  offsetValue:    { fontSize: 16, fontWeight: '800' },
  offsetHint:     { fontSize: 9, color: '#555' },
  offsetResetBtn: { paddingHorizontal: 8, paddingVertical: 6, borderRadius: 8, borderWidth: 1, backgroundColor: 'rgba(255,255,255,0.04)' },
  offsetResetTxt: { fontSize: 10, color: '#666', fontWeight: '600' },
});

const styles = StyleSheet.create({
  bg:            { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 },
  container:     { flex: 1, zIndex: 1, alignItems: 'center', width: '100%' },
  title:         { fontSize: 32, fontWeight: 'bold', color: '#d4af37', textAlign: 'center' },
  subtitle:      { fontSize: 13, color: '#a0a0a0', marginTop: 4, textAlign: 'center' },
  scroll:        { flex: 1, width: '100%' },
  scrollContent: { alignItems: 'center', paddingBottom: 20 },
  grid:          { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', maxWidth: 1100 },
  overlay:       { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'center', alignItems: 'center' },
  modalRow:      { flexDirection: 'row', alignItems: 'center', gap: 26 },
});
