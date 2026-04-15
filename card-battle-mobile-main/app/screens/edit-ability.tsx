import React, { useState, useRef } from 'react';
import {
  View, StyleSheet, ScrollView, SafeAreaView,
  TouchableOpacity, TextInput, KeyboardAvoidingView,
  Platform, StatusBar, Image, Alert, Text,
} from 'react-native';
import { ThemedText } from '@/components/ui/ThemedText';
import {
  ArrowLeft, Save, Check, ImagePlus, X,
  Video, Film, Image as ImageIcon,
  Zap, Shield, Sword, Star, Flame, Snowflake,
  Wind, Droplets, Sun, Moon, Eye, Heart, Skull,
  Bolt, CircleDot, Trophy, Crown, Diamond,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { Rarity } from '@/data/abilities';

// ─── Rarity config ───
const RARITIES: {
  id: Rarity; label: string; labelAr: string;
  gradient: [string, string]; border: string; textColor: string;
  badgeBg: string; checkColor: string; glowColor: string;
}[] = [
  { id: 'Common',    label: 'Common',    labelAr: 'عادي',    gradient: ['#064e3b','#065f46'], border: '#10b981', textColor: '#34d399', badgeBg: 'rgba(16,185,129,0.15)',  checkColor: '#10b981', glowColor: 'rgba(16,185,129,0.25)'  },
  { id: 'Rare',      label: 'Rare',      labelAr: 'نادر',    gradient: ['#1e3a5f','#1e40af'], border: '#3b82f6', textColor: '#93c5fd', badgeBg: 'rgba(59,130,246,0.15)',  checkColor: '#3b82f6', glowColor: 'rgba(59,130,246,0.25)'  },
  { id: 'Epic',      label: 'Epic',      labelAr: 'ملحمي',   gradient: ['#3b0764','#6d28d9'], border: '#a855f7', textColor: '#d8b4fe', badgeBg: 'rgba(168,85,247,0.15)', checkColor: '#a855f7', glowColor: 'rgba(168,85,247,0.3)'   },
  { id: 'Legendary', label: 'Legendary', labelAr: 'أسطوري',  gradient: ['#78350f','#b45309'], border: '#f59e0b', textColor: '#fcd34d', badgeBg: 'rgba(245,158,11,0.15)',  checkColor: '#f59e0b', glowColor: 'rgba(245,158,11,0.35)'  },
  { id: 'Special',   label: 'Special',   labelAr: 'خاص ✦',   gradient: ['#0f172a','#701a75'], border: '#e879f9', textColor: '#f0abfc', badgeBg: 'rgba(232,121,249,0.18)', checkColor: '#e879f9', glowColor: 'rgba(232,121,249,0.45)' },
];

// ─── أيقونات القدرات المتاحة ───
const ABILITY_ICONS: { key: string; label: string; Icon: any }[] = [
  { key: 'Zap',       label: 'برق',    Icon: Zap       },
  { key: 'Shield',    label: 'درع',    Icon: Shield    },
  { key: 'Sword',     label: 'سيف',    Icon: Sword     },
  { key: 'Star',      label: 'نجمة',   Icon: Star      },
  { key: 'Flame',     label: 'نار',    Icon: Flame     },
  { key: 'Snowflake', label: 'جليد',   Icon: Snowflake },
  { key: 'Wind',      label: 'ريح',    Icon: Wind      },
  { key: 'Droplets',  label: 'ماء',    Icon: Droplets  },
  { key: 'Sun',       label: 'شمس',    Icon: Sun       },
  { key: 'Moon',      label: 'قمر',    Icon: Moon      },
  { key: 'Eye',       label: 'عين',    Icon: Eye       },
  { key: 'Heart',     label: 'قلب',    Icon: Heart     },
  { key: 'Skull',     label: 'جمجمة',  Icon: Skull     },
  { key: 'CircleDot', label: 'هدف',    Icon: CircleDot },
  { key: 'Trophy',    label: 'كأس',    Icon: Trophy    },
  { key: 'Crown',     label: 'تاج',    Icon: Crown     },
  { key: 'Diamond',   label: 'ألماس',  Icon: Diamond   },
];

// ─── نوع الميديا ───
type MediaType = 'image' | 'video' | 'gif' | null;

// ─── فتح ملف حسب النوع ───
const pickFileCrossPlatform = (
  accept: string,
  onPick: (uri: string, type: MediaType) => void,
  mediaType: MediaType,
) => {
  if (Platform.OS === 'web') {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.onchange = (e: any) => {
      const file = e.target?.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        if (result) onPick(result, mediaType);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  } else {
    Alert.alert('قريباً', 'هذه الخاصية تعمل على الويب حالياً. الموبايل قيد التطوير.', [{ text: 'حسناً' }]);
  }
};

// ─── Live Card Preview ───
function LiveCardPreview({
  nameEn, nameAr, description, warning,
  rarity, mediaUri, mediaType, iconKey,
}: {
  nameEn: string; nameAr: string; description: string; warning: string;
  rarity: Rarity; mediaUri: string | null; mediaType: MediaType; iconKey: string;
}) {
  const r = RARITIES.find((x) => x.id === rarity)!;
  const iconObj = ABILITY_ICONS.find((i) => i.key === iconKey);
  const IconComp = iconObj?.Icon ?? Zap;

  return (
    <View style={[previewStyles.card, { borderColor: r.border + 'AA', shadowColor: r.border }]}>
      {/* صورة/فيديو/GIF */}
      <View style={previewStyles.artZone}>
        {mediaUri ? (
          <Image source={{ uri: mediaUri }} style={previewStyles.artImage} resizeMode="cover" />
        ) : (
          <View style={previewStyles.artPlaceholder}>
            <ImageIcon size={28} color={r.border + '60'} />
          </View>
        )}
        {/* طبقة تعتيم */}
        <View style={previewStyles.artOverlay} />
        {/* badge */}
        <View style={[previewStyles.rarityBadge, { backgroundColor: r.badgeBg, borderColor: r.border + '80' }]}>
          <Text style={[previewStyles.rarityText, { color: r.textColor }]}>{r.label.toUpperCase()}</Text>
        </View>
        {/* أيقونة */}
        <View style={[previewStyles.iconBadge, { borderColor: r.border, shadowColor: r.border }]}>
          <IconComp size={16} color={r.textColor} strokeWidth={2} />
        </View>
      </View>

      {/* body */}
      <View style={previewStyles.body}>
        <Text style={[previewStyles.nameAr, { color: r.textColor }]} numberOfLines={1}>
          {nameAr || '—'}
        </Text>
        <Text style={previewStyles.nameEn} numberOfLines={1}>
          {nameEn || '—'}
        </Text>
        <View style={[previewStyles.divider, { backgroundColor: r.border + '55' }]} />
        <Text style={previewStyles.desc} numberOfLines={3}>
          {description || 'وصف القدرة...'}
        </Text>
        {warning ? (
          <Text style={previewStyles.warn} numberOfLines={2}>⚠️ {warning}</Text>
        ) : null}
      </View>

      {/* footer */}
      <View style={[previewStyles.footer, { borderTopColor: r.border + '44' }]}>
        <View style={previewStyles.starsRow}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Text key={i} style={{ fontSize: 8, color: i < (RARITIES.indexOf(r) + 1) ? r.textColor : r.textColor + '28' }}>★</Text>
          ))}
        </View>
        <Text style={[previewStyles.footerLabel, { color: r.textColor + 'BB' }]}>{r.labelAr}</Text>
      </View>
    </View>
  );
}

const previewStyles = StyleSheet.create({
  card: {
    width: 200, alignSelf: 'center',
    borderRadius: 18, borderWidth: 2,
    backgroundColor: '#000',
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.7, shadowRadius: 16, elevation: 12,
    overflow: 'hidden',
  },
  artZone:        { width: '100%', height: 120, backgroundColor: '#111', overflow: 'hidden' },
  artImage:       { width: '100%', height: '100%' },
  artPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#111' },
  artOverlay:     { position: 'absolute', bottom: 0, left: 0, right: 0, height: 40, backgroundColor: 'rgba(0,0,0,0.5)' },
  rarityBadge:    { position: 'absolute', top: 7, left: 7, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, borderWidth: 1 },
  rarityText:     { fontSize: 7, fontWeight: '900', letterSpacing: 1.2 },
  iconBadge: {
    position: 'absolute', bottom: -16, alignSelf: 'center',
    width: 34, height: 34, borderRadius: 17, borderWidth: 2,
    backgroundColor: '#080808',
    alignItems: 'center', justifyContent: 'center',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.9, shadowRadius: 5, elevation: 8,
  },
  body:       { paddingTop: 22, paddingHorizontal: 12, paddingBottom: 4, alignItems: 'center', gap: 3 },
  nameAr:     { fontSize: 14, fontWeight: '900', textAlign: 'center', letterSpacing: 0.3 },
  nameEn:     { fontSize: 8, fontWeight: '700', color: '#64748b', textAlign: 'center', letterSpacing: 1.2, textTransform: 'uppercase' },
  divider:    { width: 36, height: 1.5, borderRadius: 1, marginVertical: 4 },
  desc:       { fontSize: 9, color: '#94a3b8', textAlign: 'center', lineHeight: 13 },
  warn:       { fontSize: 8, color: '#f87171', textAlign: 'center', lineHeight: 12, marginTop: 3 },
  footer:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10, paddingVertical: 6, borderTopWidth: 1, backgroundColor: 'rgba(0,0,0,0.6)', marginTop: 8 },
  starsRow:   { flexDirection: 'row', gap: 2 },
  footerLabel:{ fontSize: 7, fontWeight: '800', letterSpacing: 0.6, textTransform: 'uppercase' },
});

// ─── Main Screen ───
export default function EditAbilityScreen() {
  const navigation = useNavigation();

  const [nameEn,   setNameEn]   = useState('');
  const [nameAr,   setNameAr]   = useState('');
  const [description, setDescription] = useState('');
  const [warning,  setWarning]  = useState('');
  const [rarity,   setRarity]   = useState<Rarity>('Common');
  const [iconKey,  setIconKey]  = useState('Zap');
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<MediaType>(null);

  const sel = RARITIES.find((r) => r.id === rarity)!;

  const handlePickImage = () =>
    pickFileCrossPlatform('image/png, image/jpeg, image/webp', (uri, t) => { setMediaUri(uri); setMediaType(t); }, 'image');

  const handlePickGif = () =>
    pickFileCrossPlatform('image/gif', (uri, t) => { setMediaUri(uri); setMediaType(t); }, 'gif');

  const handlePickVideo = () =>
    pickFileCrossPlatform('video/mp4, video/webm, video/mov', (uri, t) => { setMediaUri(uri); setMediaType(t); }, 'video');

  const handleRemoveMedia = () => { setMediaUri(null); setMediaType(null); };

  const handleSave = () => {
    if (!nameEn.trim() && !nameAr.trim()) {
      Alert.alert('تنبيه', 'أدخل اسم القدرة على الأقل.');
      return;
    }
    console.log('Save:', { nameEn, nameAr, description, warning, rarity, iconKey, mediaUri, mediaType });
    Alert.alert('تم الحفظ ✅', `"${nameAr || nameEn}" — ${sel.labelAr}`);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={20} color="#fff" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>تعديل القدرة</ThemedText>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* ─── LIVE PREVIEW ─── */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionLabel}>معاينة مباشرة / Live Preview</ThemedText>
            <LiveCardPreview
              nameEn={nameEn} nameAr={nameAr}
              description={description} warning={warning}
              rarity={rarity} mediaUri={mediaUri}
              mediaType={mediaType} iconKey={iconKey}
            />
          </View>

          {/* ─── RARITY ─── */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionLabel}>الندرة / Rarity</ThemedText>
            <View style={styles.rarityRow}>
              {RARITIES.slice(0, 2).map((r) => (
                <RarityCard key={r.id} r={r} isSelected={rarity === r.id} onPress={() => setRarity(r.id)} />
              ))}
            </View>
            <View style={[styles.rarityRow, { marginTop: 10 }]}>
              {RARITIES.slice(2, 4).map((r) => (
                <RarityCard key={r.id} r={r} isSelected={rarity === r.id} onPress={() => setRarity(r.id)} />
              ))}
            </View>
            <View style={[styles.rarityRow, { marginTop: 10 }]}>
              <SpecialRarityCard r={RARITIES[4]} isSelected={rarity === 'Special'} onPress={() => setRarity('Special')} />
            </View>
          </View>

          {/* ─── MEDIA (صورة / GIF / فيديو) ─── */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionLabel}>ميديا الكرت / Card Media</ThemedText>

            {mediaUri ? (
              <View style={styles.mediaPreviewWrapper}>
                {mediaType === 'video' ? (
                  <View style={[styles.videoPlaceholder, { borderColor: sel.border }]}>
                    <Film size={36} color={sel.textColor} />
                    <ThemedText style={[styles.videoLabel, { color: sel.textColor }]}>فيديو مُختار ✓</ThemedText>
                    <ThemedText style={styles.videoSub}>سيُشغَّل داخل الكرت عند اللعب</ThemedText>
                  </View>
                ) : (
                  <Image
                    source={{ uri: mediaUri }}
                    style={[styles.mediaPreview, { borderColor: sel.border }]}
                    resizeMode="cover"
                  />
                )}
                <View style={styles.mediaActions}>
                  <TouchableOpacity
                    onPress={handlePickImage}
                    style={[styles.mediaActionBtn, { backgroundColor: sel.badgeBg, borderColor: sel.border + '80' }]}
                  >
                    <ImageIcon size={13} color={sel.textColor} />
                    <ThemedText style={[styles.mediaActionText, { color: sel.textColor }]}>صورة</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handlePickGif}
                    style={[styles.mediaActionBtn, { backgroundColor: sel.badgeBg, borderColor: sel.border + '80' }]}
                  >
                    <Film size={13} color={sel.textColor} />
                    <ThemedText style={[styles.mediaActionText, { color: sel.textColor }]}>GIF</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handlePickVideo}
                    style={[styles.mediaActionBtn, { backgroundColor: sel.badgeBg, borderColor: sel.border + '80' }]}
                  >
                    <Video size={13} color={sel.textColor} />
                    <ThemedText style={[styles.mediaActionText, { color: sel.textColor }]}>فيديو</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleRemoveMedia} style={styles.mediaRemoveBtn}>
                    <X size={13} color="#f87171" />
                    <ThemedText style={styles.mediaRemoveText}>حذف</ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.mediaPickerRow}>
                <TouchableOpacity
                  onPress={handlePickImage}
                  style={[styles.mediaPickBox, { borderColor: sel.border + '55', backgroundColor: sel.badgeBg }]}
                >
                  <ImageIcon size={24} color={sel.textColor} />
                  <ThemedText style={[styles.mediaPickLabel, { color: sel.textColor }]}>صورة</ThemedText>
                  <ThemedText style={styles.mediaPickSub}>PNG / JPG</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handlePickGif}
                  style={[styles.mediaPickBox, { borderColor: sel.border + '55', backgroundColor: sel.badgeBg }]}
                >
                  <Film size={24} color={sel.textColor} />
                  <ThemedText style={[styles.mediaPickLabel, { color: sel.textColor }]}>GIF</ThemedText>
                  <ThemedText style={styles.mediaPickSub}>متحرك</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handlePickVideo}
                  style={[styles.mediaPickBox, { borderColor: sel.border + '55', backgroundColor: sel.badgeBg }]}
                >
                  <Video size={24} color={sel.textColor} />
                  <ThemedText style={[styles.mediaPickLabel, { color: sel.textColor }]}>فيديو</ThemedText>
                  <ThemedText style={styles.mediaPickSub}>MP4 / WebM</ThemedText>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* ─── ICON ─── */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionLabel}>أيقونة القدرة / Ability Icon</ThemedText>
            <View style={styles.iconsGrid}>
              {ABILITY_ICONS.map(({ key, label, Icon }) => {
                const isActive = iconKey === key;
                return (
                  <TouchableOpacity
                    key={key}
                    onPress={() => setIconKey(key)}
                    style={[
                      styles.iconCell,
                      isActive && { borderColor: sel.border, backgroundColor: sel.badgeBg },
                    ]}
                  >
                    <Icon size={20} color={isActive ? sel.textColor : '#475569'} strokeWidth={isActive ? 2.5 : 1.5} />
                    <ThemedText style={[styles.iconCellLabel, { color: isActive ? sel.textColor : '#475569' }]}>
                      {label}
                    </ThemedText>
                    {isActive && (
                      <View style={[styles.iconActiveCheck, { backgroundColor: sel.border }]}>
                        <Check size={8} color="#000" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* ─── INPUTS ─── */}
          <View style={styles.section}>
            <InputField label="English Name" value={nameEn} onChangeText={setNameEn} placeholder="e.g. Logical Encounter" textAlign="left" accentColor={sel.textColor} />
            <InputField label="الاسم العربي" value={nameAr} onChangeText={setNameAr} placeholder="مثال: مصادفة منطقية" textAlign="right" accentColor={sel.textColor} />
            <InputField label="الوصف / Description" value={description} onChangeText={setDescription} placeholder="وصف القدرة..." multiline textAlign="right" accentColor={sel.textColor} />
            <InputField label="⚠️ تحذير / Warning" value={warning} onChangeText={setWarning} placeholder="تحذير أو ملاحظة اختيارية..." multiline textAlign="right" accentColor="#f87171" />
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* FOOTER */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.cancelBtn}>
          <ThemedText style={styles.cancelText}>إلغاء</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleSave}
          style={[styles.saveBtn, { backgroundColor: sel.border, shadowColor: sel.glowColor }]}
        >
          <Save size={20} color="#000" />
          <ThemedText style={styles.saveText}>حفظ القدرة</ThemedText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── Sub-components ───
function RarityCard({ r, isSelected, onPress }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.rarityCard,
        {
          borderColor: isSelected ? r.border : 'rgba(255,255,255,0.08)',
          backgroundColor: isSelected ? r.gradient[1] + '40' : 'rgba(255,255,255,0.04)',
          shadowColor: isSelected ? r.glowColor : 'transparent',
          shadowRadius: isSelected ? 10 : 0, shadowOpacity: isSelected ? 1 : 0,
          elevation: isSelected ? 6 : 0,
        },
      ]}
    >
      <View style={styles.rarityCardTop}>
        <View style={[styles.rarityBadgePill, { backgroundColor: isSelected ? r.badgeBg : 'rgba(255,255,255,0.05)' }]}>
          <ThemedText style={[styles.rarityBadgeText, { color: isSelected ? r.textColor : '#64748b' }]}>{r.id.toUpperCase()}</ThemedText>
        </View>
        {isSelected && (
          <View style={[styles.checkCircle, { backgroundColor: r.badgeBg }]}>
            <Check size={11} color={r.checkColor} />
          </View>
        )}
      </View>
      <ThemedText style={[styles.rarityLabelAr, { color: isSelected ? '#fff' : '#475569' }]}>{r.labelAr}</ThemedText>
    </TouchableOpacity>
  );
}

function SpecialRarityCard({ r, isSelected, onPress }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.specialCard,
        {
          borderColor: isSelected ? r.border : 'rgba(255,255,255,0.08)',
          backgroundColor: isSelected ? 'rgba(232,121,249,0.08)' : 'rgba(255,255,255,0.03)',
          shadowColor: isSelected ? r.glowColor : 'transparent',
          shadowRadius: isSelected ? 18 : 0, shadowOpacity: isSelected ? 1 : 0,
          elevation: isSelected ? 10 : 0,
        },
      ]}
    >
      <View style={styles.specialCardInner}>
        <View style={styles.rarityCardTop}>
          <View style={[styles.rarityBadgePill, { backgroundColor: isSelected ? r.badgeBg : 'rgba(255,255,255,0.05)' }]}>
            <ThemedText style={[styles.rarityBadgeText, { color: isSelected ? r.textColor : '#64748b' }]}>SPECIAL</ThemedText>
          </View>
          {isSelected && (
            <View style={[styles.checkCircle, { backgroundColor: r.badgeBg }]}>
              <Check size={11} color={r.checkColor} />
            </View>
          )}
        </View>
        <ThemedText style={[styles.rarityLabelAr, { color: isSelected ? r.textColor : '#475569', fontSize: 15, letterSpacing: 1 }]}>{r.labelAr}</ThemedText>
        {isSelected && <ThemedText style={styles.specialHint}>نادرة جداً — لا تظهر في اللعب الاعتيادي</ThemedText>}
      </View>
    </TouchableOpacity>
  );
}

function InputField({ label, value, onChangeText, placeholder, multiline = false, textAlign = 'left', accentColor }: any) {
  return (
    <View style={styles.inputGroup}>
      <ThemedText style={[styles.inputLabel, { textAlign: textAlign === 'right' ? 'right' : 'left' }]}>{label}</ThemedText>
      <View style={[styles.inputBox, multiline && { minHeight: 90 }]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#475569"
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
          style={[styles.textInput, { textAlign: textAlign as any, color: accentColor || '#e2e8f0' }]}
        />
      </View>
    </View>
  );
}

// ─── Styles ───
const styles = StyleSheet.create({
  safeArea:    { flex: 1, backgroundColor: '#020617' },
  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)', backgroundColor: 'rgba(2,6,23,0.9)' },
  backBtn:     { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },
  scrollContent: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 20 },
  section:     { marginBottom: 28 },
  sectionLabel:{ fontSize: 12, fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 12, textAlign: 'right' },

  // Rarity
  rarityRow:       { flexDirection: 'row', gap: 10 },
  rarityCard:      { flex: 1, minHeight: 80, borderRadius: 14, borderWidth: 1.5, padding: 12, justifyContent: 'space-between' },
  rarityCardTop:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rarityBadgePill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  rarityBadgeText: { fontSize: 9, fontWeight: '800', letterSpacing: 1.5 },
  checkCircle:     { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  rarityLabelAr:   { fontSize: 13, fontWeight: '600', marginTop: 8, textAlign: 'left' },
  specialCard:     { flex: 1, borderRadius: 16, borderWidth: 2, padding: 16 },
  specialCardInner:{ gap: 6 },
  specialHint:     { fontSize: 10, color: '#94a3b8', marginTop: 4, textAlign: 'right' },

  // Media
  mediaPickerRow:    { flexDirection: 'row', gap: 10 },
  mediaPickBox:      { flex: 1, borderWidth: 2, borderStyle: 'dashed', borderRadius: 14, paddingVertical: 18, alignItems: 'center', gap: 6 },
  mediaPickLabel:    { fontSize: 12, fontWeight: '700' },
  mediaPickSub:      { fontSize: 9, color: 'rgba(255,255,255,0.3)' },
  mediaPreviewWrapper: { alignItems: 'center', gap: 12 },
  mediaPreview:      { width: '100%', height: 200, borderRadius: 16, borderWidth: 2 },
  videoPlaceholder:  { width: '100%', height: 120, borderRadius: 16, borderWidth: 2, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.03)' },
  videoLabel:        { fontSize: 14, fontWeight: '700' },
  videoSub:          { fontSize: 11, color: '#64748b' },
  mediaActions:      { flexDirection: 'row', gap: 8, width: '100%' },
  mediaActionBtn:    { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 9, borderRadius: 10, borderWidth: 1 },
  mediaActionText:   { fontSize: 11, fontWeight: '700' },
  mediaRemoveBtn:    { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 9, borderRadius: 10, borderWidth: 1, backgroundColor: 'rgba(248,113,113,0.08)', borderColor: 'rgba(248,113,113,0.35)' },
  mediaRemoveText:   { fontSize: 11, fontWeight: '700', color: '#f87171' },

  // Icons grid
  iconsGrid:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  iconCell:        { width: 62, paddingVertical: 10, alignItems: 'center', gap: 4, borderRadius: 12, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.03)' },
  iconCellLabel:   { fontSize: 9, fontWeight: '600' },
  iconActiveCheck: { position: 'absolute', top: 4, right: 4, width: 14, height: 14, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },

  // Inputs
  inputGroup:  { marginBottom: 16 },
  inputLabel:  { fontSize: 12, fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  inputBox:    { backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12 },
  textInput:   { fontSize: 15, fontWeight: '500' },

  // Footer
  footer:      { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', gap: 12, padding: 16, paddingBottom: 28, backgroundColor: 'rgba(2,6,23,0.95)', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)' },
  cancelBtn:   { flex: 1, height: 54, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' },
  cancelText:  { color: '#94a3b8', fontWeight: '600', fontSize: 15 },
  saveBtn:     { flex: 2, height: 54, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.6, shadowRadius: 12, elevation: 8 },
  saveText:    { color: '#000', fontWeight: '900', fontSize: 15, letterSpacing: 0.5 },
});
