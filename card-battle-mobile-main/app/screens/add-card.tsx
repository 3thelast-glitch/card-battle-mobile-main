/**
 * add-card.tsx — شاشة إضافة كرت جديد من داخل التطبيق
 * تحفظ الكارت في AsyncStorage وتعرض كوده الجاهز
 */
import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  StyleSheet, Alert, Platform, KeyboardAvoidingView,
  Clipboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { saveCustomCard, generateCardCode } from '@/lib/game/custom-cards-store';
import { Card, CardRarity, Race, CardClass, Element, Tag } from '@/lib/game/types';

// ─── ثوابت الخيارات ───────────────────────────────────────────
const RARITIES: CardRarity[]   = ['common', 'rare', 'epic', 'legendary', 'special'];
const RACES:    Race[]         = ['human', 'elf', 'orc', 'dragon', 'demon', 'undead', 'monster', 'robot'];
const CLASSES:  CardClass[]    = ['warrior', 'knight', 'mage', 'archer', 'berserker', 'paladin'];
const ELEMENTS: Element[]      = ['fire', 'ice', 'water', 'earth', 'lightning', 'wind'];
const TAGS:     Tag[]          = ['sword', 'shield', 'magic', 'bow', 'crown'];

const RARITY_COLORS: Record<CardRarity, string> = {
  common: '#9CA3AF', rare: '#CD7F32', epic: '#A855F7',
  legendary: '#FFD700', special: '#C0C0C0',
};
const ELEMENT_COLORS: Record<Element, string> = {
  fire: '#ef4444', ice: '#38bdf8', water: '#3b82f6',
  earth: '#a3e635', lightning: '#facc15', wind: '#a78bfa',
};

// ─── نموذج افتراضي ──────────────────────────────────────────────
const defaultForm = {
  nameAr: '', nameEn: '', attack: '18', defense: '16',
  hp: '16', stars: '3', specialAbility: '', imageUrl: '',
};

// ─── مكون Chip للاختيار ─────────────────────────────────────────
const Chip = ({ label, selected, color, onPress }: {
  label: string; selected: boolean; color?: string; onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.chip, selected && { borderColor: color ?? '#FFD700', backgroundColor: (color ?? '#FFD700') + '22' }]}
  >
    <Text style={[styles.chipText, selected && { color: color ?? '#FFD700' }]}>{label}</Text>
  </TouchableOpacity>
);

// ─── Main ────────────────────────────────────────────────────────
export default function AddCardScreen() {
  const router = useRouter();
  const [form, setForm]       = useState(defaultForm);
  const [rarity,  setRarity]  = useState<CardRarity>('common');
  const [race,    setRace]    = useState<Race>('human');
  const [cls,     setCls]     = useState<CardClass>('warrior');
  const [element, setElement] = useState<Element>('fire');
  const [tags,    setTags]    = useState<Tag[]>(['sword']);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [saving, setSaving]   = useState(false);

  const toggleTag = (t: Tag) =>
    setTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  const handleSave = useCallback(async () => {
    if (!form.nameAr.trim()) { Alert.alert('أدخل اسم الكارت بالعربي'); return; }
    if (!form.nameEn.trim()) { Alert.alert('أدخل اسم الكارت بالإنجليزي'); return; }
    setSaving(true);
    const id = `custom_${Date.now()}`;
    const card: Card = {
      id,
      name:    form.nameEn.trim(),
      nameAr:  form.nameAr.trim(),
      attack:  Math.max(1, Math.min(99, parseInt(form.attack)  || 18)),
      defense: Math.max(1, Math.min(99, parseInt(form.defense) || 16)),
      hp:      Math.max(1, Math.min(99, parseInt(form.hp)      || 16)),
      race, cardClass: cls, element,
      tags: tags.length ? tags : ['sword'],
      rarity,
      stars: Math.max(1, Math.min(5, parseInt(form.stars) || 3)),
      specialAbility: form.specialAbility.trim() || undefined,
      imageUrl: form.imageUrl.trim() || undefined,
    };
    await saveCustomCard(card);
    setGeneratedCode(generateCardCode(card));
    setSaving(false);
  }, [form, rarity, race, cls, element, tags]);

  const copyCode = () => {
    if (!generatedCode) return;
    Clipboard.setString(generatedCode);
    Alert.alert('✅ تم النسخ', 'الكود جاهز للصق في cards-batch');
  };

  // ── واجهة عرض الكود المولّد ──────────────────────────────────
  if (generatedCode) {
    return (
      <SafeAreaView style={styles.root}>
        <LinearGradient colors={['#0a0a0e', '#111827']} style={StyleSheet.absoluteFill} />
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
          <Text style={styles.title}>✅ تم حفظ الكارت!</Text>
          <Text style={styles.subtitle}>
            الكارت محفوظ في التطبيق.{`\n`}كود TypeScript جاهز — انسخه والصقه في cards-batch:
          </Text>
          <View style={styles.codeBox}>
            <Text style={styles.codeText} selectable>{generatedCode}</Text>
          </View>
          <TouchableOpacity style={styles.btnPrimary} onPress={copyCode}>
            <LinearGradient colors={['#1d4ed8', '#1e40af']} style={styles.btnGrad}>
              <Text style={styles.btnText}>📋 نسخ الكود</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnSecondary}
            onPress={() => { setGeneratedCode(null); setForm(defaultForm); }}>
            <Text style={styles.btnTextSec}>➕ إضافة كارت آخر</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btnSecondary, { marginTop: 8 }]} onPress={() => router.back()}>
            <Text style={styles.btnTextSec}>🔙 رجوع</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── واجهة إدخال البيانات ─────────────────────────────────────
  return (
    <SafeAreaView style={styles.root}>
      <LinearGradient colors={['#0a0a0e', '#111827']} style={StyleSheet.absoluteFill} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 80 }} keyboardShouldPersistTaps="handled">

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Text style={styles.backTxt}>← رجوع</Text>
            </TouchableOpacity>
            <Text style={styles.title}>➕ إضافة كارت</Text>
          </View>

          {/* الأسماء */}
          <Text style={styles.sectionLabel}>الاسم بالعربي *</Text>
          <TextInput
            style={styles.input} placeholder="مثال: ناروتو أوزوماكي"
            placeholderTextColor="#555" value={form.nameAr}
            onChangeText={t => setForm(f => ({ ...f, nameAr: t }))}
            textAlign="right"
          />

          <Text style={styles.sectionLabel}>الاسم بالإنجليزي *</Text>
          <TextInput
            style={styles.input} placeholder="e.g. Naruto Uzumaki"
            placeholderTextColor="#555" value={form.nameEn}
            onChangeText={t => setForm(f => ({ ...f, nameEn: t }))}
          />

          {/* الإحصائيات */}
          <Text style={styles.sectionLabel}>الإحصائيات</Text>
          <View style={styles.statsRow}>
            {([
              { label: '⚔️ هجوم', key: 'attack'  },
              { label: '🛡️ دفاع', key: 'defense' },
              { label: '❤️ HP',   key: 'hp'      },
              { label: '⭐ نجوم', key: 'stars'   },
            ] as const).map(({ label, key }) => (
              <View key={key} style={styles.statBox}>
                <Text style={styles.statLabel}>{label}</Text>
                <TextInput
                  style={styles.statInput}
                  keyboardType="number-pad" maxLength={2}
                  value={form[key]}
                  onChangeText={t => setForm(f => ({ ...f, [key]: t }))}
                  textAlign="center"
                />
              </View>
            ))}
          </View>

          {/* الندرة */}
          <Text style={styles.sectionLabel}>الندرة</Text>
          <View style={styles.chipRow}>
            {RARITIES.map(r => (
              <Chip key={r} label={r} selected={rarity === r} color={RARITY_COLORS[r]} onPress={() => setRarity(r)} />
            ))}
          </View>

          {/* العنصر */}
          <Text style={styles.sectionLabel}>العنصر</Text>
          <View style={styles.chipRow}>
            {ELEMENTS.map(e => (
              <Chip key={e} label={e} selected={element === e} color={ELEMENT_COLORS[e]} onPress={() => setElement(e)} />
            ))}
          </View>

          {/* الجنس */}
          <Text style={styles.sectionLabel}>الجنس (Race)</Text>
          <View style={styles.chipRow}>
            {RACES.map(r => (
              <Chip key={r} label={r} selected={race === r} onPress={() => setRace(r)} />
            ))}
          </View>

          {/* الفئة */}
          <Text style={styles.sectionLabel}>الفئة (Class)</Text>
          <View style={styles.chipRow}>
            {CLASSES.map(c => (
              <Chip key={c} label={c} selected={cls === c} onPress={() => setCls(c)} />
            ))}
          </View>

          {/* التاغات */}
          <Text style={styles.sectionLabel}>Tags (اختر واحد أو أكثر)</Text>
          <View style={styles.chipRow}>
            {TAGS.map(t => (
              <Chip key={t} label={t} selected={tags.includes(t)} onPress={() => toggleTag(t)} />
            ))}
          </View>

          {/* القدرة الخاصة */}
          <Text style={styles.sectionLabel}>القدرة الخاصة (اختياري)</Text>
          <TextInput
            style={[styles.input, { minHeight: 64, textAlignVertical: 'top' }]}
            placeholder="اكتب وصف القدرة..."
            placeholderTextColor="#555" multiline
            value={form.specialAbility}
            onChangeText={t => setForm(f => ({ ...f, specialAbility: t }))}
            textAlign="right"
          />

          {/* الصورة — URL فقط */}
          <Text style={styles.sectionLabel}>رابط صورة الكارت (اختياري)</Text>
          <TextInput
            style={styles.input}
            placeholder="https://example.com/image.jpg"
            placeholderTextColor="#555"
            value={form.imageUrl}
            onChangeText={t => setForm(f => ({ ...f, imageUrl: t }))}
            autoCapitalize="none"
            keyboardType="url"
          />

          {/* زر الحفظ */}
          <TouchableOpacity
            style={[styles.btnPrimary, saving && { opacity: 0.6 }]}
            onPress={handleSave}
            disabled={saving}
          >
            <LinearGradient colors={['#d97706', '#b45309']} style={styles.btnGrad}>
              <Text style={styles.btnText}>
                {saving ? 'جاري الحفظ...' : '💾 حفظ الكارت وتوليد الكود'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root:         { flex: 1, backgroundColor: '#0a0a0e' },
  header:       { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 12 },
  backBtn:      { padding: 6 },
  backTxt:      { color: '#9CA3AF', fontSize: 14 },
  title:        { color: '#FFD700', fontSize: 20, fontWeight: '800', flex: 1, textAlign: 'center' },
  subtitle:     { color: '#9CA3AF', fontSize: 13, textAlign: 'center', marginBottom: 14, lineHeight: 20 },
  sectionLabel: { color: '#E5E7EB', fontSize: 13, fontWeight: '700', marginTop: 16, marginBottom: 6, textAlign: 'right' },
  input: {
    backgroundColor: '#1a1a2e', borderWidth: 1, borderColor: '#374151',
    borderRadius: 10, color: '#fff', fontSize: 14,
    paddingHorizontal: 14, paddingVertical: 11, marginBottom: 2,
  },
  statsRow:   { flexDirection: 'row', gap: 8, marginTop: 4 },
  statBox:    { flex: 1, alignItems: 'center' },
  statLabel:  { color: '#9CA3AF', fontSize: 11, marginBottom: 4 },
  statInput: {
    backgroundColor: '#1a1a2e', borderWidth: 1, borderColor: '#374151',
    borderRadius: 8, color: '#FFD700', fontSize: 18, fontWeight: '800',
    paddingVertical: 8, width: '100%',
  },
  chipRow:  { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 4 },
  chip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    borderWidth: 1.5, borderColor: '#374151',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  chipText: { color: '#9CA3AF', fontSize: 12, fontWeight: '600' },
  btnPrimary:   { marginTop: 28, borderRadius: 12, overflow: 'hidden' },
  btnGrad:      { paddingVertical: 15, alignItems: 'center' },
  btnText:      { color: '#fff', fontWeight: '800', fontSize: 16 },
  btnSecondary: {
    marginTop: 14, borderRadius: 12, borderWidth: 1.5,
    borderColor: '#374151', paddingVertical: 13, alignItems: 'center',
  },
  btnTextSec: { color: '#9CA3AF', fontWeight: '700', fontSize: 15 },
  codeBox: {
    backgroundColor: '#0d1117', borderRadius: 10, padding: 16,
    marginBottom: 20, borderWidth: 1, borderColor: '#374151',
  },
  codeText: {
    color: '#7DD3FC', fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    lineHeight: 20,
  },
});
