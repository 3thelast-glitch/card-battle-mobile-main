/**
 * add-card.tsx — تخطيط عمودين: شكل الكارت يسار + الحقول يمين
 */
import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  StyleSheet, Alert, Platform, KeyboardAvoidingView,
  Clipboard, Image, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { saveCustomCard, generateCardCode } from '@/lib/game/custom-cards-store';
import { saveImage } from '@/lib/game/image-storage';
import { Card, CardRarity, Race, CardClass, Element, Tag } from '@/lib/game/types';
import { CARD_EDITS_KEY } from '@/app/screens/cards-gallery';
import { LuxuryCharacterCardAnimated } from '@/components/game/luxury-character-card-animated';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RACE_AR: Record<Race, string> = {
  human: 'بشري', elf: 'إلف', orc: 'أورك',
  dragon: 'تنين', demon: 'شيطان', undead: 'حي ميت',
  monster: 'وحش', robot: 'روبوت',
};
const CLASS_AR: Record<CardClass, string> = {
  warrior: 'محارب', knight: 'فارس', mage: 'ساحر',
  archer: 'رامي', berserker: 'برسيركر', paladin: 'بالادين',
};
const ELEMENT_AR: Record<Element, string> = {
  fire: 'نار', ice: 'جليد', water: 'ماء',
  earth: 'أرض', lightning: 'برق', wind: 'ريح',
};
const TAG_AR: Record<Tag, string> = {
  sword: 'سيف', shield: 'درع', magic: 'سحر', bow: 'قوس', crown: 'تاج',
};

const RARITIES: { value: CardRarity; label: string; color: string }[] = [
  { value: 'common',    label: 'عادي',   color: '#6366f1' },
  { value: 'rare',      label: 'نادر',   color: '#f59e0b' },
  { value: 'epic',      label: 'ملحمي',  color: '#8b5cf6' },
  { value: 'legendary', label: 'أسطوري', color: '#ef4444' },
  { value: 'special',   label: 'خاص',    color: '#ec4899' },
];
const RARITY_STARS: Record<CardRarity, number> = {
  common: 1, rare: 3, epic: 4, legendary: 5, special: 5,
};
const RACES:    Race[]      = ['human','elf','orc','dragon','demon','undead','monster','robot'];
const CLASSES:  CardClass[] = ['warrior','knight','mage','archer','berserker','paladin'];
const ELEMENTS: Element[]   = ['fire','ice','water','earth','lightning','wind'];
const ELEMENT_COLORS: Record<Element, string> = {
  fire: '#ef4444', ice: '#38bdf8', water: '#3b82f6',
  earth: '#a3e635', lightning: '#facc15', wind: '#a78bfa',
};
const TAGS: Tag[] = ['sword','shield','magic','bow','crown'];

const defaultForm = { nameAr: '', nameEn: '', attack: '18', defense: '16', specialAbility: '' };

function pickFileAsBase64(accept: string): Promise<{ base64: string; isVideo: boolean } | null> {
  return new Promise(resolve => {
    if (Platform.OS !== 'web') { resolve(null); return; }
    const input = document.createElement('input');
    input.type = 'file'; input.accept = accept;
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) { resolve(null); return; }
      const reader = new FileReader();
      reader.onload = () => resolve({ base64: reader.result as string, isVideo: file.type.startsWith('video/') });
      reader.readAsDataURL(file);
    };
    input.click();
  });
}

// ─ Chip ──────────────────────────────────────────────────────────────────
const Chip = ({ label, selected, color, onPress }: {
  label: string; selected: boolean; color?: string; onPress: () => void;
}) => (
  <TouchableOpacity onPress={onPress}
    style={[S.chip, selected && { borderColor: color ?? '#FFD700', backgroundColor: (color ?? '#FFD700') + '25' }]}>
    <Text style={[S.chipTxt, selected && { color: color ?? '#FFD700' }]}>{label}</Text>
  </TouchableOpacity>
);

// ─ معاينة الكارت ─────────────────────────────────────────────────────────
function CardPreview({ card, mediaB64, isVideo }: { card: Partial<Card>; mediaB64?: string; isVideo: boolean }) {
  const previewCard: Card = {
    id: 'preview',
    name:      card.name      ?? 'New Card',
    nameAr:    card.nameAr   ?? 'كارت جديد',
    attack:    card.attack   ?? 18,
    defense:   card.defense  ?? 16,
    hp:        card.defense  ?? 16,
    race:      card.race     ?? 'human',
    cardClass: card.cardClass ?? 'warrior',
    element:   card.element  ?? 'fire',
    tags:      card.tags     ?? ['sword'],
    rarity:    card.rarity   ?? 'common',
    stars:     card.stars    ?? 1,
    specialAbility: card.specialAbility,
    customImage: mediaB64,
    isVideo,
  } as any;

  return (
    <View style={S.previewWrap} pointerEvents="none">
      <LuxuryCharacterCardAnimated
        card={previewCard}
        imageOffsetY={0}
        fitInsideBorder={false}
        style={{ width: 170, height: 240 }}
      />
    </View>
  );
}

// ─ Main ──────────────────────────────────────────────────────────────────
export default function AddCardScreen() {
  const router   = useRouter();
  const [form, setForm]       = useState(defaultForm);
  const [rarity,  setRarity]  = useState<CardRarity>('common');
  const [race,    setRace]    = useState<Race>('human');
  const [cls,     setCls]     = useState<CardClass>('warrior');
  const [element, setElement] = useState<Element>('fire');
  const [tags,    setTags]    = useState<Tag[]>(['sword']);
  const [mediaB64, setMediaB64] = useState<string | undefined>();
  const [isVideo,  setIsVideo]  = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const rarityColor = RARITIES.find(r => r.value === rarity)?.color ?? '#FFD700';
  const stars       = RARITY_STARS[rarity];
  const toggleTag   = (t: Tag) =>
    setTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  const handlePickMedia = async (accept: string) => {
    const res = await pickFileAsBase64(accept);
    if (res) { setMediaB64(res.base64); setIsVideo(res.isVideo); }
  };

  const handleSave = useCallback(async () => {
    if (!form.nameAr.trim()) { Alert.alert('أدخل الاسم العربي'); return; }
    if (!form.nameEn.trim()) { Alert.alert('أدخل الاسم الإنجليزي'); return; }
    setSaving(true);
    try {
      const id = `custom_${Date.now()}`;
      const card: Card = {
        id,
        name:    form.nameEn.trim(),
        nameAr:  form.nameAr.trim(),
        attack:  Math.max(1, Math.min(99, parseInt(form.attack)  || 18)),
        defense: Math.max(1, Math.min(99, parseInt(form.defense) || 16)),
        hp:      Math.max(1, Math.min(99, parseInt(form.defense) || 16)),
        race, cardClass: cls, element,
        tags: tags.length ? tags : ['sword'],
        rarity, stars,
        specialAbility: form.specialAbility.trim() || undefined,
      };
      await saveCustomCard(card);
      if (mediaB64) await saveImage(`card_img_${id}`, mediaB64);
      const rawEdits = await AsyncStorage.getItem(CARD_EDITS_KEY);
      const editsMap: Record<string, any> = rawEdits ? JSON.parse(rawEdits) : {};
      editsMap[id] = {
        nameAr: card.nameAr, stars, rarity,
        attack: card.attack, defense: card.defense,
        hasAbility: !!card.specialAbility, specialAbility: card.specialAbility ?? '',
        hasCustomImage: !!mediaB64, isVideo, imageOffsetY: 0, fitInsideBorder: false,
        _isCustom: true, name: card.name,
        race, cardClass: cls, element, tags: card.tags, hp: card.hp,
      };
      await AsyncStorage.setItem(CARD_EDITS_KEY, JSON.stringify(editsMap));
      setGeneratedCode(generateCardCode(card));
    } finally { setSaving(false); }
  }, [form, rarity, race, cls, element, tags, mediaB64, isVideo]);

  const copyCode = () => {
    if (!generatedCode) return;
    Clipboard.setString(generatedCode);
    Alert.alert('✅ تم النسخ');
  };

  // ── شاشة الكود الناتج ─────────────────────────────────────────────
  if (generatedCode) {
    return (
      <SafeAreaView style={S.root}>
        <LinearGradient colors={['#060610','#0f172a']} style={StyleSheet.absoluteFill} />
        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 60 }}>
          <Text style={[S.pageTitle, { marginBottom: 6 }]}>✅ تم حفظ الكارت!</Text>
          <Text style={S.subtitle}>الكارت يظهر في المعرض.{`\n`}كود TypeScript جاهز للصق في cards-batch:</Text>
          <View style={S.codeBox}><Text style={S.codeTxt} selectable>{generatedCode}</Text></View>
          <TouchableOpacity style={[S.btnFull, { backgroundColor: '#1d4ed8' }]} onPress={copyCode}>
            <Text style={S.btnFullTxt}>📋 نسخ الكود</Text>
          </TouchableOpacity>
          <TouchableOpacity style={S.btnOutline} onPress={() => { setGeneratedCode(null); setForm(defaultForm); setMediaB64(undefined); }}>
            <Text style={S.btnOutlineTxt}>➕ إضافة كارت آخر</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[S.btnOutline, { marginTop: 8 }]} onPress={() => router.back()}>
            <Text style={S.btnOutlineTxt}>🔙 رجوع للمعرض</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── شاشة الإدخال ────────────────────────────────────────────────
  const previewCardData: Partial<Card> = {
    nameAr:    form.nameAr   || 'كارت جديد',
    name:      form.nameEn   || 'New Card',
    attack:    parseInt(form.attack)  || 18,
    defense:   parseInt(form.defense) || 16,
    race, cardClass: cls, element,
    tags, rarity, stars,
    specialAbility: form.specialAbility || undefined,
  };

  return (
    <SafeAreaView style={S.root}>
      <LinearGradient colors={['#060610','#0f172a']} style={StyleSheet.absoluteFill} />

      {/* ─ شريط العنوان */}
      <View style={S.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={S.backBtn}>
          <Text style={S.backTxt}>← رجوع</Text>
        </TouchableOpacity>
        <Text style={S.pageTitle}>➕ كارت جديد</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* ─ تخطيط عمودين */}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={S.columns}>

          {/* ── عمود الكارت (يسار) */}
          <View style={S.leftCol}>
            <CardPreview card={previewCardData} mediaB64={mediaB64} isVideo={isVideo ?? false} />

            {/* صورة / فيديو */}
            <View style={S.mediaButtons}>
              <TouchableOpacity style={[S.mediaBtnSmall, { borderColor: rarityColor + '88' }]}
                onPress={() => handlePickMedia('image/*')}>
                <Text style={[S.mediaBtnTxt, { color: rarityColor }]}>🖼️ صورة</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[S.mediaBtnSmall, { borderColor: '#a78bfa88' }]}
                onPress={() => handlePickMedia('video/mp4,video/webm,video/*')}>
                <Text style={[S.mediaBtnTxt, { color: '#a78bfa' }]}>🎦 فيديو</Text>
              </TouchableOpacity>
            </View>
            {mediaB64 && (
              <TouchableOpacity style={S.removeMedia} onPress={() => { setMediaB64(undefined); setIsVideo(false); }}>
                <Text style={{ color: '#f87171', fontSize: 11, fontWeight: '700' }}>✕ حذف الوسيط</Text>
              </TouchableOpacity>
            )}

            {/* الندرة */}
            <Text style={S.secLabel}>الندرة</Text>
            <View style={S.chipCol}>
              {RARITIES.map(r => (
                <Chip key={r.value} label={r.label} selected={rarity === r.value}
                  color={r.color} onPress={() => setRarity(r.value)} />
              ))}
            </View>
          </View>

          {/* ── عمود الحقول (يمين) */}
          <ScrollView style={S.rightCol} contentContainerStyle={{ paddingBottom: 100 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

            {/* الأسماء */}
            <Text style={S.secLabel}>الاسم بالعربي *</Text>
            <TextInput style={[S.input, { borderColor: rarityColor + '55' }]}
              placeholder="مثال: ناروتو" placeholderTextColor="#444"
              value={form.nameAr} onChangeText={t => setForm(f => ({ ...f, nameAr: t }))}
              textAlign="right" />

            <Text style={S.secLabel}>الاسم بالإنجليزي *</Text>
            <TextInput style={[S.input, { borderColor: '#37415155' }]}
              placeholder="Naruto" placeholderTextColor="#444"
              value={form.nameEn} onChangeText={t => setForm(f => ({ ...f, nameEn: t }))} />

            {/* الإحصائيات */}
            <Text style={S.secLabel}>الإحصائيات</Text>
            <View style={S.statsRow}>
              {([
                { label: '⚔️ هجوم', key: 'attack', color: '#f87171' },
                { label: '🛡️ دفاع', key: 'defense', color: '#60a5fa' },
              ] as const).map(({ label, key, color }) => (
                <View key={key} style={S.statBox}>
                  <Text style={[S.statLbl, { color }]}>{label}</Text>
                  <TextInput
                    style={[S.statInput, { borderColor: color + '55', color }]}
                    keyboardType="number-pad" maxLength={2}
                    value={form[key]}
                    onChangeText={t => setForm(f => ({ ...f, [key]: t }))}
                    textAlign="center" />
                </View>
              ))}
            </View>

            {/* العنصر */}
            <Text style={S.secLabel}>العنصر</Text>
            <View style={S.chipRow}>
              {ELEMENTS.map(e => (
                <Chip key={e} label={ELEMENT_AR[e]} selected={element === e}
                  color={ELEMENT_COLORS[e]} onPress={() => setElement(e)} />
              ))}
            </View>

            {/* الجنس */}
            <Text style={S.secLabel}>الجنس</Text>
            <View style={S.chipRow}>
              {RACES.map(r => (
                <Chip key={r} label={RACE_AR[r]} selected={race === r} onPress={() => setRace(r)} />
              ))}
            </View>

            {/* الفئة */}
            <Text style={S.secLabel}>الفئة</Text>
            <View style={S.chipRow}>
              {CLASSES.map(c => (
                <Chip key={c} label={CLASS_AR[c]} selected={cls === c} onPress={() => setCls(c)} />
              ))}
            </View>

            {/* التاغات */}
            <Text style={S.secLabel}>التاغ</Text>
            <View style={S.chipRow}>
              {TAGS.map(t => (
                <Chip key={t} label={TAG_AR[t]} selected={tags.includes(t)} onPress={() => toggleTag(t)} />
              ))}
            </View>

            {/* القدرة الخاصة */}
            <Text style={S.secLabel}>القدرة الخاصة (اختياري)</Text>
            <TextInput
              style={[S.input, S.multiline, { borderColor: rarityColor + '33' }]}
              placeholder="اكتب وصف القدرة..." placeholderTextColor="#444"
              multiline value={form.specialAbility}
              onChangeText={t => setForm(f => ({ ...f, specialAbility: t }))}
              textAlign="right" />

            {/* زر الحفظ */}
            <TouchableOpacity
              style={[S.saveBtn, { backgroundColor: rarityColor, opacity: saving ? 0.6 : 1 }]}
              onPress={handleSave} disabled={saving}>
              <Text style={S.saveBtnTxt}>{saving ? 'جاري الحفظ...' : '💾 حفظ الكارت'}</Text>
            </TouchableOpacity>

          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const S = StyleSheet.create({
  root:          { flex: 1, backgroundColor: '#060610' },
  topBar:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  backBtn:       { width: 60 },
  backTxt:       { color: '#6B7280', fontSize: 13, fontWeight: '700' },
  pageTitle:     { color: '#FFD700', fontSize: 18, fontWeight: '900', textAlign: 'center', flex: 1 },
  subtitle:      { color: '#6B7280', fontSize: 12, textAlign: 'center', lineHeight: 20, marginBottom: 16 },

  // عمودان
  columns:       { flex: 1, flexDirection: 'row' },
  leftCol:       { width: 200, paddingHorizontal: 12, paddingTop: 16, alignItems: 'center', borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.06)' },
  rightCol:      { flex: 1, paddingHorizontal: 14, paddingTop: 12 },

  // معاينة الكارت
  previewWrap:   { marginBottom: 12 },
  mediaButtons:  { flexDirection: 'row', gap: 6, marginBottom: 6 },
  mediaBtnSmall: { flex: 1, paddingVertical: 7, borderRadius: 10, borderWidth: 1.5, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)' },
  mediaBtnTxt:   { fontSize: 12, fontWeight: '700' },
  removeMedia:   { alignSelf: 'center', paddingVertical: 4, marginBottom: 8 },

  // ندرة عمودية
  chipCol:       { flexDirection: 'column', gap: 5, width: '100%' },

  // تسميات
  secLabel:      { color: '#9CA3AF', fontSize: 11, fontWeight: '700', marginTop: 14, marginBottom: 5, textAlign: 'right' },
  input:         { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderRadius: 10, color: '#fff', fontSize: 14, paddingHorizontal: 12, paddingVertical: 9, marginBottom: 2 },
  multiline:     { minHeight: 64, textAlignVertical: 'top' },

  statsRow:      { flexDirection: 'row', gap: 10 },
  statBox:       { flex: 1, alignItems: 'center' },
  statLbl:       { fontSize: 12, fontWeight: '700', marginBottom: 4 },
  statInput:     { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderRadius: 8, fontSize: 22, fontWeight: '900', paddingVertical: 8, width: '100%' },

  chipRow:       { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 2 },
  chip:          { paddingHorizontal: 11, paddingVertical: 5, borderRadius: 20, borderWidth: 1.5, borderColor: '#2D3748', backgroundColor: 'rgba(255,255,255,0.03)' },
  chipTxt:       { color: '#6B7280', fontSize: 12, fontWeight: '700' },

  saveBtn:       { marginTop: 20, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  saveBtnTxt:    { color: '#fff', fontWeight: '900', fontSize: 15 },

  // كود
  codeBox:       { backgroundColor: '#0d1117', borderRadius: 10, padding: 16, marginVertical: 16, borderWidth: 1, borderColor: '#1F2937' },
  codeTxt:       { color: '#7DD3FC', fontSize: 12, fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace', lineHeight: 20 },
  btnFull:       { borderRadius: 12, paddingVertical: 13, alignItems: 'center', marginBottom: 10 },
  btnFullTxt:    { color: '#fff', fontWeight: '800', fontSize: 15 },
  btnOutline:    { borderRadius: 12, borderWidth: 1.5, borderColor: '#374151', paddingVertical: 12, alignItems: 'center', marginBottom: 8 },
  btnOutlineTxt: { color: '#9CA3AF', fontWeight: '700', fontSize: 14 },
});
