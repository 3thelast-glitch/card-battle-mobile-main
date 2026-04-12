/**
 * add-card.tsx
 * شاشة إضافة كارت مخصص — الصورة/الفيديو يُحفظ base64 داخل AsyncStorage
 * الكارت يظهر فوراً في cards-gallery مرتّباً حسب الندرة
 */
import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  StyleSheet, Alert, Platform, KeyboardAvoidingView,
  Clipboard, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { saveCustomCard, generateCardCode } from '@/lib/game/custom-cards-store';
import { saveImage } from '@/lib/game/image-storage';
import { Card, CardRarity, Race, CardClass, Element, Tag } from '@/lib/game/types';
import { CARD_EDITS_KEY } from '@/app/screens/cards-gallery';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── ثوابت الخيارات ───────────────────────────────────────────
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
const ELEMENTS: { value: Element; color: string }[] = [
  { value: 'fire',      color: '#ef4444' },
  { value: 'ice',       color: '#38bdf8' },
  { value: 'water',     color: '#3b82f6' },
  { value: 'earth',     color: '#a3e635' },
  { value: 'lightning', color: '#facc15' },
  { value: 'wind',      color: '#a78bfa' },
];
const TAGS: Tag[] = ['sword','shield','magic','bow','crown'];

const defaultForm = {
  nameAr: '', nameEn: '', attack: '18', defense: '16', hp: '16', stars: '3', specialAbility: '',
};

// ─── Chip ────────────────────────────────────────────────────────
const Chip = ({ label, selected, color, onPress }: {
  label: string; selected: boolean; color?: string; onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={[S.chip, selected && { borderColor: color ?? '#FFD700', backgroundColor: (color ?? '#FFD700') + '22' }]}
  >
    <Text style={[S.chipText, selected && { color: color ?? '#FFD700' }]}>{label}</Text>
  </TouchableOpacity>
);

// ─── رافع الملف (Web + Android stub) ────────────────────────────
function pickFileAsBase64(accept: string): Promise<{ base64: string; isVideo: boolean } | null> {
  return new Promise(resolve => {
    if (Platform.OS !== 'web') { resolve(null); return; }
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) { resolve(null); return; }
      const reader = new FileReader();
      reader.onload = () => resolve({
        base64: reader.result as string,
        isVideo: file.type.startsWith('video/'),
      });
      reader.readAsDataURL(file);
    };
    input.click();
  });
}

// ─── Main ────────────────────────────────────────────────────────
export default function AddCardScreen() {
  const router = useRouter();
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
  const toggleTag   = (t: Tag) =>
    setTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  const handlePickMedia = async (accept: string) => {
    const result = await pickFileAsBase64(accept);
    if (result) { setMediaB64(result.base64); setIsVideo(result.isVideo); }
  };

  // ─ حفظ الكارت في AsyncStorage وكروت-غاليري ─
  const handleSave = useCallback(async () => {
    if (!form.nameAr.trim()) { Alert.alert('أدخل الاسم العربي'); return; }
    if (!form.nameEn.trim()) { Alert.alert('أدخل الاسم الإنجليزي'); return; }
    setSaving(true);
    try {
      const id = `custom_${Date.now()}`;
      const stars = RARITY_STARS[rarity];

      const card: Card = {
        id,
        name:    form.nameEn.trim(),
        nameAr:  form.nameAr.trim(),
        attack:  Math.max(1, Math.min(99, parseInt(form.attack)  || 18)),
        defense: Math.max(1, Math.min(99, parseInt(form.defense) || 16)),
        hp:      Math.max(1, Math.min(99, parseInt(form.hp)      || 16)),
        race, cardClass: cls, element,
        tags: tags.length ? tags : ['sword'],
        rarity, stars,
        specialAbility: form.specialAbility.trim() || undefined,
      };

      // 1) حفظ في custom-cards-store
      await saveCustomCard(card);

      // 2) حفظ الصورة/الفيديو في image-storage (نفس نظام cards-gallery)
      if (mediaB64) {
        await saveImage(`card_img_${id}`, mediaB64);
      }

      // 3) حقن الكارت في CARD_EDITS_KEY حتى يظهر في cards-gallery فوراً
      const rawEdits = await AsyncStorage.getItem(CARD_EDITS_KEY);
      const editsMap: Record<string, any> = rawEdits ? JSON.parse(rawEdits) : {};
      editsMap[id] = {
        nameAr:   card.nameAr,
        stars,
        rarity,
        attack:   card.attack,
        defense:  card.defense,
        hasAbility:     !!card.specialAbility,
        specialAbility: card.specialAbility ?? '',
        hasCustomImage: !!mediaB64,
        isVideo,
        imageOffsetY:    0,
        fitInsideBorder: false,
        // حقل تعريف الكارت الجديد كامل
        _isCustom: true,
        name:      card.name,
        race, cardClass: cls, element,
        tags: card.tags,
        hp:   card.hp,
      };
      await AsyncStorage.setItem(CARD_EDITS_KEY, JSON.stringify(editsMap));

      setGeneratedCode(generateCardCode(card));
    } finally {
      setSaving(false);
    }
  }, [form, rarity, race, cls, element, tags, mediaB64, isVideo]);

  const copyCode = () => {
    if (!generatedCode) return;
    Clipboard.setString(generatedCode);
    Alert.alert('✅ تم النسخ', 'الكود جاهز للصق في cards-batch');
  };

  // ─── شاشة الكود المولّد ───────────────────────────────────────
  if (generatedCode) {
    return (
      <SafeAreaView style={S.root}>
        <LinearGradient colors={['#0a0a0e','#111827']} style={StyleSheet.absoluteFill} />
        <ScrollView contentContainerStyle={{ padding: 22, paddingBottom: 60 }}>
          <Text style={S.title}>✅ تم حفظ الكارت!</Text>
          <Text style={S.subtitle}>الكارت يظهر الآن في المعرض.{`\n`}كود TypeScript جاهز للصق في cards-batch:</Text>
          <View style={S.codeBox}>
            <Text style={S.codeText} selectable>{generatedCode}</Text>
          </View>
          <TouchableOpacity style={S.btnWrap} onPress={copyCode}>
            <LinearGradient colors={['#1d4ed8','#1e40af']} style={S.btnGrad}>
              <Text style={S.btnTxt}>📋 نسخ الكود</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={S.btnSec}
            onPress={() => { setGeneratedCode(null); setForm(defaultForm); setMediaB64(undefined); }}>
            <Text style={S.btnSecTxt}>➕ إضافة كارت آخر</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[S.btnSec, { marginTop: 8 }]} onPress={() => router.back()}>
            <Text style={S.btnSecTxt}>🔙 رجوع للمعرض</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ─── شاشة الإدخال ────────────────────────────────────────────
  return (
    <SafeAreaView style={S.root}>
      <LinearGradient colors={['#0a0a0e','#111827']} style={StyleSheet.absoluteFill} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 80 }} keyboardShouldPersistTaps="handled">

          {/* Header */}
          <View style={S.header}>
            <TouchableOpacity onPress={() => router.back()} style={S.backBtn}>
              <Text style={S.backTxt}>← رجوع</Text>
            </TouchableOpacity>
            <Text style={S.title}>➕ كارت جديد</Text>
          </View>

          {/* الأسماء */}
          <Text style={S.label}>الاسم بالعربي *</Text>
          <TextInput style={S.input} placeholder="مثال: ناروتو أوزوماكي" placeholderTextColor="#555"
            value={form.nameAr} onChangeText={t => setForm(f => ({ ...f, nameAr: t }))} textAlign="right" />

          <Text style={S.label}>الاسم بالإنجليزي *</Text>
          <TextInput style={S.input} placeholder="e.g. Naruto Uzumaki" placeholderTextColor="#555"
            value={form.nameEn} onChangeText={t => setForm(f => ({ ...f, nameEn: t }))} />

          {/* الإحصائيات */}
          <Text style={S.label}>الإحصائيات</Text>
          <View style={S.statsRow}>
            {([
              { label: '⚔️ هجوم', key: 'attack' },
              { label: '🛡️ دفاع', key: 'defense' },
              { label: '❤️ HP',   key: 'hp' },
            ] as const).map(({ label, key }) => (
              <View key={key} style={S.statBox}>
                <Text style={S.statLbl}>{label}</Text>
                <TextInput
                  style={[S.statInput, { borderColor: rarityColor + '66', color: rarityColor }]}
                  keyboardType="number-pad" maxLength={2}
                  value={form[key]}
                  onChangeText={t => setForm(f => ({ ...f, [key]: t }))}
                  textAlign="center"
                />
              </View>
            ))}
          </View>

          {/* الندرة */}
          <Text style={S.label}>الندرة</Text>
          <View style={S.chipRow}>
            {RARITIES.map(r => (
              <Chip key={r.value} label={r.label} selected={rarity === r.value}
                color={r.color} onPress={() => setRarity(r.value)} />
            ))}
          </View>

          {/* العنصر */}
          <Text style={S.label}>العنصر</Text>
          <View style={S.chipRow}>
            {ELEMENTS.map(e => (
              <Chip key={e.value} label={e.value} selected={element === e.value}
                color={e.color} onPress={() => setElement(e.value)} />
            ))}
          </View>

          {/* الجنس */}
          <Text style={S.label}>الجنس (Race)</Text>
          <View style={S.chipRow}>
            {RACES.map(r => <Chip key={r} label={r} selected={race === r} onPress={() => setRace(r)} />)}
          </View>

          {/* الفئة */}
          <Text style={S.label}>الفئة (Class)</Text>
          <View style={S.chipRow}>
            {CLASSES.map(c => <Chip key={c} label={c} selected={cls === c} onPress={() => setCls(c)} />)}
          </View>

          {/* التاغات */}
          <Text style={S.label}>Tags</Text>
          <View style={S.chipRow}>
            {TAGS.map(t => <Chip key={t} label={t} selected={tags.includes(t)} onPress={() => toggleTag(t)} />)}
          </View>

          {/* القدرة الخاصة */}
          <Text style={S.label}>القدرة الخاصة (اختياري)</Text>
          <TextInput
            style={[S.input, { minHeight: 60, textAlignVertical: 'top' }]}
            placeholder="اكتب وصف القدرة..." placeholderTextColor="#555" multiline
            value={form.specialAbility}
            onChangeText={t => setForm(f => ({ ...f, specialAbility: t }))}
            textAlign="right"
          />

          {/* الصورة / الفيديو */}
          <Text style={S.label}>صورة / فيديو الكارت (اختياري)</Text>
          <View style={S.mediaRow}>
            <TouchableOpacity style={[S.mediaPick, { borderColor: rarityColor + '66' }]}
              onPress={() => handlePickMedia('image/*')}>
              <Text style={[S.mediaPickTxt, { color: rarityColor }]}>🖼️ صورة</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[S.mediaPick, { borderColor: '#a78bfa66' }]}
              onPress={() => handlePickMedia('video/mp4,video/webm,video/*')}>
              <Text style={[S.mediaPickTxt, { color: '#a78bfa' }]}>🎬 فيديو</Text>
            </TouchableOpacity>
            {mediaB64 ? (
              <TouchableOpacity style={S.mediaRemove} onPress={() => { setMediaB64(undefined); setIsVideo(false); }}>
                <Text style={{ color: '#f87171', fontSize: 11, fontWeight: '700' }}>✕ حذف</Text>
              </TouchableOpacity>
            ) : null}
          </View>
          {mediaB64 && !isVideo && (
            <Image source={{ uri: mediaB64 }} style={S.imgPreview} resizeMode="contain" />
          )}
          {mediaB64 && isVideo && (
            <View style={S.videoThumb}>
              <Text style={{ fontSize: 28 }}>🎦</Text>
              <Text style={{ color: '#a78bfa', fontSize: 12, fontWeight: '700' }}>فيديو محفوظ</Text>
            </View>
          )}

          {/* زر الحفظ */}
          <TouchableOpacity
            style={[S.btnWrap, { marginTop: 28 }, saving && { opacity: 0.6 }]}
            onPress={handleSave} disabled={saving}
          >
            <LinearGradient colors={['#d97706','#b45309']} style={S.btnGrad}>
              <Text style={S.btnTxt}>{saving ? 'جاري الحفظ...' : '💾 حفظ الكارت وتوليد الكود'}</Text>
            </LinearGradient>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const S = StyleSheet.create({
  root:        { flex: 1, backgroundColor: '#0a0a0e' },
  header:      { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 12 },
  backBtn:     { padding: 6 },
  backTxt:     { color: '#9CA3AF', fontSize: 14 },
  title:       { color: '#FFD700', fontSize: 20, fontWeight: '800', flex: 1, textAlign: 'center' },
  subtitle:    { color: '#9CA3AF', fontSize: 13, textAlign: 'center', marginBottom: 14, lineHeight: 20 },
  label:       { color: '#E5E7EB', fontSize: 12, fontWeight: '700', marginTop: 16, marginBottom: 6, textAlign: 'right' },
  input:       { backgroundColor: '#1a1a2e', borderWidth: 1, borderColor: '#374151', borderRadius: 10, color: '#fff', fontSize: 14, paddingHorizontal: 14, paddingVertical: 11, marginBottom: 2 },
  statsRow:    { flexDirection: 'row', gap: 10, marginTop: 4 },
  statBox:     { flex: 1, alignItems: 'center' },
  statLbl:     { color: '#9CA3AF', fontSize: 11, marginBottom: 4 },
  statInput:   { backgroundColor: '#1a1a2e', borderWidth: 1, borderRadius: 8, fontSize: 20, fontWeight: '800', paddingVertical: 8, width: '100%' },
  chipRow:     { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 4 },
  chip:        { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1.5, borderColor: '#374151', backgroundColor: 'rgba(255,255,255,0.04)' },
  chipText:    { color: '#9CA3AF', fontSize: 12, fontWeight: '600' },
  mediaRow:    { flexDirection: 'row', gap: 10, marginBottom: 10, flexWrap: 'wrap', alignItems: 'center' },
  mediaPick:   { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 12, borderWidth: 1.5, backgroundColor: 'rgba(255,255,255,0.04)' },
  mediaPickTxt:{ fontSize: 13, fontWeight: '700' },
  mediaRemove: { paddingHorizontal: 10, paddingVertical: 9, borderRadius: 12, borderWidth: 1.5, borderColor: '#f8717166', backgroundColor: 'rgba(248,113,113,0.06)' },
  imgPreview:  { width: '100%', height: 140, borderRadius: 10, borderWidth: 1, borderColor: '#374151', marginBottom: 6, backgroundColor: '#111' },
  videoThumb:  { alignItems: 'center', justifyContent: 'center', height: 80, borderRadius: 10, borderWidth: 1, borderColor: '#374151', backgroundColor: '#111', marginBottom: 6, gap: 4 },
  btnWrap:     { borderRadius: 12, overflow: 'hidden' },
  btnGrad:     { paddingVertical: 15, alignItems: 'center' },
  btnTxt:      { color: '#fff', fontWeight: '800', fontSize: 16 },
  btnSec:      { marginTop: 14, borderRadius: 12, borderWidth: 1.5, borderColor: '#374151', paddingVertical: 13, alignItems: 'center' },
  btnSecTxt:   { color: '#9CA3AF', fontWeight: '700', fontSize: 15 },
  codeBox:     { backgroundColor: '#0d1117', borderRadius: 10, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#374151' },
  codeText:    { color: '#7DD3FC', fontSize: 12, fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace', lineHeight: 20 },
});
