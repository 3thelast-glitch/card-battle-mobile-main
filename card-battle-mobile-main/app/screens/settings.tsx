/**
 * SettingsScreen — إعدادات اللعبة
 * يُخزَّن كل شيء في AsyncStorage تحت مفتاح GAME_SETTINGS_KEY
 */
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Switch, Modal, Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { LuxuryBackground } from '@/components/game/luxury-background';
import { ArrowLeft } from 'lucide-react-native';
import { CARD_EDITS_KEY } from '@/app/screens/cards-gallery';

export const GAME_SETTINGS_KEY = 'game_settings_v1';

export type GameSettings = {
  soundEnabled: boolean;
  musicEnabled: boolean;
  animationsEnabled: boolean;
  battleSpeed: 'slow' | 'normal' | 'fast';
  language: 'ar' | 'en';
  showAbilityHints: boolean;
  showDamageNumbers: boolean;
  vibration: boolean;
};

const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: true,
  musicEnabled: true,
  animationsEnabled: true,
  battleSpeed: 'normal',
  language: 'ar',
  showAbilityHints: true,
  showDamageNumbers: true,
  vibration: true,
};

export async function loadSettings(): Promise<GameSettings> {
  try {
    const raw = await AsyncStorage.getItem(GAME_SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function saveSettings(s: GameSettings): Promise<void> {
  await AsyncStorage.setItem(GAME_SETTINGS_KEY, JSON.stringify(s));
}

// ── مكوّن صف toggle ────────────────────────────────────────────────────────
function ToggleRow({
  icon, title, subtitle, value, color = '#d4af37', onChange,
}: {
  icon: string; title: string; subtitle?: string;
  value: boolean; color?: string; onChange: (v: boolean) => void;
}) {
  return (
    <View style={row.wrap}>
      <View style={row.left}>
        <Text style={row.icon}>{icon}</Text>
        <View style={row.texts}>
          <Text style={row.title}>{title}</Text>
          {subtitle ? <Text style={row.sub}>{subtitle}</Text> : null}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: '#2a2a2a', true: color + '66' }}
        thumbColor={value ? color : '#666'}
      />
    </View>
  );
}

// ── مكوّن اختيار متعدد ─────────────────────────────────────────────────────
function ChoiceRow<T extends string>({
  icon, title, options, value, color = '#d4af37', onChange,
}: {
  icon: string; title: string;
  options: { value: T; label: string }[];
  value: T; color?: string;
  onChange: (v: T) => void;
}) {
  return (
    <View style={ch.wrap}>
      <View style={ch.header}>
        <Text style={ch.icon}>{icon}</Text>
        <Text style={ch.title}>{title}</Text>
      </View>
      <View style={ch.pills}>
        {options.map(opt => {
          const active = opt.value === value;
          return (
            <TouchableOpacity
              key={opt.value}
              onPress={() => onChange(opt.value)}
              activeOpacity={0.75}
              style={[
                ch.pill,
                { borderColor: active ? color : color + '33',
                  backgroundColor: active ? color + '22' : 'rgba(255,255,255,0.03)' },
              ]}
            >
              <Text style={[ch.pillTxt, { color: active ? color : color + '88' }]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ── Section header ─────────────────────────────────────────────────────────
function SectionHeader({ label }: { label: string }) {
  return (
    <View style={sh.wrap}>
      <View style={sh.line} />
      <Text style={sh.txt}>{label}</Text>
      <View style={sh.line} />
    </View>
  );
}

// ── زر خطر (إعادة التعيين / حذف) ──────────────────────────────────────────
function DangerBtn({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={dg.btn} onPress={onPress} activeOpacity={0.8}>
      <Text style={dg.txt}>{label}</Text>
    </TouchableOpacity>
  );
}

// ── شاشة التأكيد ────────────────────────────────────────────────────────────
function ConfirmModal({
  visible, title, body, confirmLabel, onConfirm, onCancel,
}: {
  visible: boolean; title: string; body: string;
  confirmLabel: string;
  onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={cm.overlay}>
        <View style={cm.box}>
          <Text style={cm.title}>{title}</Text>
          <Text style={cm.body}>{body}</Text>
          <View style={cm.row}>
            <TouchableOpacity style={[cm.btn, cm.cancel]} onPress={onCancel} activeOpacity={0.8}>
              <Text style={cm.cancelTxt}>إلغاء</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[cm.btn, cm.confirm]} onPress={onConfirm} activeOpacity={0.8}>
              <Text style={cm.confirmTxt}>{confirmLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ── الشاشة الرئيسية ─────────────────────────────────────────────────────────
export default function SettingsScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);
  const [confirmReset, setConfirmReset] = useState<null | 'settings' | 'cards' | 'stats'>(
    null
  );
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings().then(s => { setSettings(s); setLoaded(true); });
  }, []);

  const patch = useCallback((p: Partial<GameSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...p };
      saveSettings(next);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
      return next;
    });
  }, []);

  const handleReset = async (type: 'settings' | 'cards' | 'stats') => {
    setConfirmReset(null);
    if (type === 'settings') {
      await saveSettings(DEFAULT_SETTINGS);
      setSettings({ ...DEFAULT_SETTINGS });
    } else if (type === 'cards') {
      await AsyncStorage.removeItem(CARD_EDITS_KEY);
      // حذف صور الكروت من IndexedDB
      try {
        indexedDB.deleteDatabase('card_images_db');
      } catch {}
    } else if (type === 'stats') {
      await AsyncStorage.removeItem('player_stats');
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const CONFIRM_DATA = {
    settings: { title: '↺ إعادة تعيين الإعدادات', body: 'سيتم إعادة جميع الإعدادات إلى الوضع الافتراضي.', label: 'إعادة تعيين' },
    cards:    { title: '🗑️ حذف تعديلات الكروت',   body: 'سيتم حذف جميع الصور والتعديلات المخصصة لكروتك.',  label: 'حذف' },
    stats:    { title: '🗑️ مسح الإحصائيات',        body: 'سيتم مسح سجل انتصاراتك وإحصائياتك كاملاً.',        label: 'مسح' },
  };

  if (!loaded) return null;

  return (
    <ScreenContainer edges={['top', 'bottom', 'left', 'right']}>
      <View style={s.bg}><LuxuryBackground /></View>

      {/* زر رجوع */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={s.backBtn}
        activeOpacity={0.7}
      >
        <ArrowLeft size={16} color="#fff" />
        <Text style={s.backTxt}>رجوع</Text>
      </TouchableOpacity>

      {/* عنوان */}
      <View style={s.header}>
        <Text style={s.title}>⚙️ الإعدادات</Text>
        {saved && <Text style={s.savedBadge}>✔ تم الحفظ</Text>}
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── الصوت ─── */}
        <SectionHeader label="🔊 الصوت" />
        <View style={s.card}>
          <ToggleRow
            icon="🔔" title="مؤثرات الصوت" subtitle="أصوات الضربات والنتائج"
            value={settings.soundEnabled} onChange={v => patch({ soundEnabled: v })}
          />
          <View style={s.sep} />
          <ToggleRow
            icon="🎵" title="الموسيقى" subtitle="موسيقى الخلفية أثناء اللعب"
            value={settings.musicEnabled} onChange={v => patch({ musicEnabled: v })}
          />
          <View style={s.sep} />
          <ToggleRow
            icon="📳" title="الاهتزاز" subtitle="اهتزاز الجهاز عند الأحداث"
            value={settings.vibration} onChange={v => patch({ vibration: v })}
          />
        </View>

        {/* ─── المرئيات ─── */}
        <SectionHeader label="🎨 المرئيات" />
        <View style={s.card}>
          <ToggleRow
            icon="✨" title="الحركات والتأثيرات" subtitle="تعطيل لأداء أفضل على الأجهزة القديمة"
            value={settings.animationsEnabled} color="#a78bfa"
            onChange={v => patch({ animationsEnabled: v })}
          />
          <View style={s.sep} />
          <ToggleRow
            icon="💢" title="أرقام الضرر" subtitle="عرض قيمة الضرر فوق الكرت"
            value={settings.showDamageNumbers} color="#f87171"
            onChange={v => patch({ showDamageNumbers: v })}
          />
          <View style={s.sep} />
          <ToggleRow
            icon="💡" title="تلميحات القدرات" subtitle="شرح القدرات الخاصة خلال المعركة"
            value={settings.showAbilityHints} color="#60a5fa"
            onChange={v => patch({ showAbilityHints: v })}
          />
        </View>

        {/* ─── المعركة ─── */}
        <SectionHeader label="⚔️ المعركة" />
        <View style={s.card}>
          <ChoiceRow
            icon="⚡" title="سرعة المعركة"
            options={[
              { value: 'slow',   label: '🐢 بطيء' },
              { value: 'normal', label: '⚡ عادي' },
              { value: 'fast',   label: '🚀 سريع' },
            ]}
            value={settings.battleSpeed}
            onChange={v => patch({ battleSpeed: v })}
          />
        </View>

        {/* ─── اللغة ─── */}
        <SectionHeader label="🌐 اللغة" />
        <View style={s.card}>
          <ChoiceRow
            icon="🌍" title="لغة الواجهة"
            options={[
              { value: 'ar', label: '🇸🇦 العربية' },
              { value: 'en', label: '🇺🇸 English' },
            ]}
            value={settings.language}
            color="#34d399"
            onChange={v => patch({ language: v })}
          />
        </View>

        {/* ─── خطر / إعادة تعيين ─── */}
        <SectionHeader label="⚠️ بيانات اللعبة" />
        <View style={s.card}>
          <DangerBtn label="↺ إعادة تعيين الإعدادات" onPress={() => setConfirmReset('settings')} />
          <View style={s.sep} />
          <DangerBtn label="🗑️ حذف تعديلات الكروت" onPress={() => setConfirmReset('cards')} />
          <View style={s.sep} />
          <DangerBtn label="🗑️ مسح الإحصائيات" onPress={() => setConfirmReset('stats')} />
        </View>

        <Text style={s.version}>Card Clash v2.0 — الإعدادات تُحفظ تلقائياً</Text>
      </ScrollView>

      {/* Modal التأكيد */}
      {confirmReset && (
        <ConfirmModal
          visible
          title={CONFIRM_DATA[confirmReset].title}
          body={CONFIRM_DATA[confirmReset].body}
          confirmLabel={CONFIRM_DATA[confirmReset].label}
          onConfirm={() => handleReset(confirmReset)}
          onCancel={() => setConfirmReset(null)}
        />
      )}
    </ScreenContainer>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────
const GOLD = '#d4af37';

const s = StyleSheet.create({
  bg:          { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 },
  backBtn:     { position: 'absolute', top: 20, left: 16, zIndex: 50, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: 'rgba(15,23,42,0.8)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  backTxt:     { color: '#fff', fontSize: 13, fontWeight: '700' },
  header:      { paddingTop: 70, paddingHorizontal: 20, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12, zIndex: 1 },
  title:       { fontSize: 24, fontWeight: '800', color: GOLD, letterSpacing: 0.5 },
  savedBadge:  { fontSize: 12, color: '#34d399', fontWeight: '700', backgroundColor: 'rgba(52,211,153,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1, borderColor: '#34d39944' },
  scroll:      { flex: 1, zIndex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 48, gap: 10 },
  card:        { backgroundColor: 'rgba(10,10,20,0.88)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(212,175,55,0.18)', padding: 6 },
  sep:         { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginHorizontal: 8 },
  version:     { color: 'rgba(255,255,255,0.15)', fontSize: 11, textAlign: 'center', paddingVertical: 8 },
});

const row = StyleSheet.create({
  wrap:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 12 },
  left:  { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  icon:  { fontSize: 20 },
  texts: { flex: 1 },
  title: { color: '#e2e8f0', fontSize: 14, fontWeight: '700' },
  sub:   { color: '#64748b', fontSize: 11, marginTop: 2 },
});

const ch = StyleSheet.create({
  wrap:   { paddingHorizontal: 12, paddingVertical: 12, gap: 10 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  icon:   { fontSize: 20 },
  title:  { color: '#e2e8f0', fontSize: 14, fontWeight: '700' },
  pills:  { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  pill:   { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5 },
  pillTxt:{ fontSize: 12, fontWeight: '800' },
});

const sh = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  line: { flex: 1, height: 1, backgroundColor: 'rgba(212,175,55,0.2)' },
  txt:  { color: GOLD, fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
});

const dg = StyleSheet.create({
  btn: { paddingHorizontal: 14, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: '#ef444444', backgroundColor: 'rgba(239,68,68,0.07)', alignItems: 'center' },
  txt: { color: '#f87171', fontSize: 13, fontWeight: '700' },
});

const cm = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.88)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  box:     { backgroundColor: '#0f0f1a', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(239,68,68,0.4)', padding: 24, width: '100%', maxWidth: 360, gap: 12 },
  title:   { color: '#f87171', fontSize: 16, fontWeight: '800', textAlign: 'center' },
  body:    { color: '#94a3b8', fontSize: 13, textAlign: 'center', lineHeight: 20 },
  row:     { flexDirection: 'row', gap: 10 },
  btn:     { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  cancel:  { borderColor: '#334155', backgroundColor: 'rgba(255,255,255,0.04)' },
  cancelTxt: { color: '#94a3b8', fontWeight: '700', fontSize: 13 },
  confirm:   { borderColor: '#ef444488', backgroundColor: 'rgba(239,68,68,0.15)' },
  confirmTxt:{ color: '#f87171', fontWeight: '800', fontSize: 13 },
});
