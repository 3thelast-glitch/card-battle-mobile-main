import React, { useState } from 'react';
import {
  View, StyleSheet, ScrollView, SafeAreaView,
  TouchableOpacity, TextInput, KeyboardAvoidingView,
  Platform, StatusBar, Image, Alert,
} from 'react-native';
import { ThemedText } from '@/components/ui/ThemedText';
import { ArrowLeft, Save, Check, ImagePlus, X } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { Rarity } from '@/data/abilities';
import * as ImagePicker from 'expo-image-picker';

// ──────────────────────────────────────────────────────────────
const RARITIES: {
  id: Rarity;
  label: string;
  labelAr: string;
  gradient: [string, string];
  border: string;
  textColor: string;
  badgeBg: string;
  checkColor: string;
  glowColor: string;
}[] = [
  {
    id: 'Common',
    label: 'Common',
    labelAr: 'عادي',
    gradient: ['#064e3b', '#065f46'],
    border: '#10b981',
    textColor: '#34d399',
    badgeBg: 'rgba(16,185,129,0.15)',
    checkColor: '#10b981',
    glowColor: 'rgba(16,185,129,0.25)',
  },
  {
    id: 'Rare',
    label: 'Rare',
    labelAr: 'نادر',
    gradient: ['#1e3a5f', '#1e40af'],
    border: '#3b82f6',
    textColor: '#93c5fd',
    badgeBg: 'rgba(59,130,246,0.15)',
    checkColor: '#3b82f6',
    glowColor: 'rgba(59,130,246,0.25)',
  },
  {
    id: 'Epic',
    label: 'Epic',
    labelAr: 'ملحمي',
    gradient: ['#3b0764', '#6d28d9'],
    border: '#a855f7',
    textColor: '#d8b4fe',
    badgeBg: 'rgba(168,85,247,0.15)',
    checkColor: '#a855f7',
    glowColor: 'rgba(168,85,247,0.3)',
  },
  {
    id: 'Legendary',
    label: 'Legendary',
    labelAr: 'أسطوري',
    gradient: ['#78350f', '#b45309'],
    border: '#f59e0b',
    textColor: '#fcd34d',
    badgeBg: 'rgba(245,158,11,0.15)',
    checkColor: '#f59e0b',
    glowColor: 'rgba(245,158,11,0.35)',
  },
  {
    id: 'Special',
    label: 'Special',
    labelAr: 'خاص ✦',
    gradient: ['#0f172a', '#701a75'],
    border: '#e879f9',
    textColor: '#f0abfc',
    badgeBg: 'rgba(232,121,249,0.18)',
    checkColor: '#e879f9',
    glowColor: 'rgba(232,121,249,0.45)',
  },
];

// ──────────────────────────────────────────────────────────────
export default function EditAbilityScreen() {
  const navigation = useNavigation();

  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionWarning, setDescriptionWarning] = useState('');
  const [rarity, setRarity] = useState<Rarity>('Common');
  const [imageUri, setImageUri] = useState<string | null>(null);

  const selectedRarity = RARITIES.find((r) => r.id === rarity)!;

  // ─── طلب الصلاحية وفتح المعرض ───
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('تنبيه', 'نحتاج صلاحية الوصول إلى الصور لاختيار صورة');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.85,
    });
    if (!result.canceled && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const removeImage = () => setImageUri(null);

  const handleSave = () => {
    console.log('Saving:', { nameEn, nameAr, description, descriptionWarning, rarity, imageUri });
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      {/* ─── HEADER ─── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={20} color="#fff" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>تعديل القدرة</ThemedText>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* ─── RARITY SELECTOR ─── */}
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

          {/* ─── IMAGE PICKER ─── */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionLabel}>صورة الكرت / Card Image</ThemedText>

            {imageUri ? (
              /* ─── صورة مختارة ─── */
              <View style={styles.imagePreviewWrapper}>
                <Image
                  source={{ uri: imageUri }}
                  style={[
                    styles.imagePreview,
                    { borderColor: selectedRarity.border },
                  ]}
                  resizeMode="cover"
                />
                {/* ثلاثة أزرار تحتها */}
                <View style={styles.imageActions}>
                  <TouchableOpacity
                    onPress={pickImage}
                    style={[
                      styles.imageActionBtn,
                      { backgroundColor: selectedRarity.badgeBg, borderColor: selectedRarity.border + '80' },
                    ]}
                    activeOpacity={0.75}
                  >
                    <ImagePlus size={15} color={selectedRarity.textColor} />
                    <ThemedText style={[styles.imageActionText, { color: selectedRarity.textColor }]}>
                      تغيير
                    </ThemedText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={removeImage}
                    style={styles.imageRemoveBtn}
                    activeOpacity={0.75}
                  >
                    <X size={14} color="#f87171" />
                    <ThemedText style={styles.imageRemoveText}>حذف</ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              /* ─── زر الرفع ─── */
              <TouchableOpacity
                onPress={pickImage}
                activeOpacity={0.75}
                style={[
                  styles.imageUploadBox,
                  {
                    borderColor: selectedRarity.border + '60',
                    backgroundColor: selectedRarity.badgeBg,
                  },
                ]}
              >
                <View style={[
                  styles.imageUploadIcon,
                  { backgroundColor: selectedRarity.badgeBg, borderColor: selectedRarity.border + '80' },
                ]}>
                  <ImagePlus size={28} color={selectedRarity.textColor} />
                </View>
                <ThemedText style={[styles.imageUploadTitle, { color: selectedRarity.textColor }]}>
                  اختر صورة الكرت
                </ThemedText>
                <ThemedText style={styles.imageUploadSub}>
                  اضغط لرفع صورة من المعرض
                </ThemedText>
              </TouchableOpacity>
            )}
          </View>

          {/* ─── INPUT FIELDS ─── */}
          <View style={styles.section}>
            <InputField
              label="English Name"
              value={nameEn}
              onChangeText={setNameEn}
              placeholder="e.g. Logical Encounter"
              textAlign="left"
              accentColor={selectedRarity.textColor}
            />
            <InputField
              label="الاسم العربي"
              value={nameAr}
              onChangeText={setNameAr}
              placeholder="مثال: مصادفة منطقية"
              textAlign="right"
              accentColor={selectedRarity.textColor}
            />
            <InputField
              label="الوصف / Description"
              value={description}
              onChangeText={setDescription}
              placeholder="وصف القدرة..."
              multiline
              textAlign="right"
              accentColor={selectedRarity.textColor}
            />
            <InputField
              label="⚠️ تحذير / Warning"
              value={descriptionWarning}
              onChangeText={setDescriptionWarning}
              placeholder="تحذير أو ملاحظة اختيارية..."
              multiline
              textAlign="right"
              accentColor="#f87171"
            />
          </View>

          {/* ─── LIVE PREVIEW ─── */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionLabel}>معاينة / Preview</ThemedText>
            <View
              style={[
                styles.previewCard,
                {
                  borderColor: selectedRarity.border,
                  shadowColor: selectedRarity.glowColor,
                  backgroundColor: selectedRarity.gradient[1] + '33',
                },
              ]}
            >
              {/* صورة في المعاينة */}
              {imageUri && (
                <Image
                  source={{ uri: imageUri }}
                  style={[
                    styles.previewImage,
                    { borderColor: selectedRarity.border + '60' },
                  ]}
                  resizeMode="cover"
                />
              )}
              <View style={styles.previewBadge}>
                <View
                  style={[
                    styles.previewBadgePill,
                    { backgroundColor: selectedRarity.badgeBg, borderColor: selectedRarity.border + '80' },
                  ]}
                >
                  <ThemedText style={[styles.previewBadgeText, { color: selectedRarity.textColor }]}>
                    {selectedRarity.labelAr}
                  </ThemedText>
                </View>
              </View>
              <ThemedText style={[styles.previewName, { color: selectedRarity.textColor }]}>
                {nameAr || nameEn || '—'}
              </ThemedText>
              {description ? (
                <ThemedText style={styles.previewDesc}>{description}</ThemedText>
              ) : null}
              {descriptionWarning ? (
                <ThemedText style={styles.previewWarning}>⚠️ {descriptionWarning}</ThemedText>
              ) : null}
            </View>
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ─── FOOTER ─── */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.cancelBtn}>
          <ThemedText style={styles.cancelText}>إلغاء</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleSave}
          style={[
            styles.saveBtn,
            { backgroundColor: selectedRarity.border, shadowColor: selectedRarity.glowColor },
          ]}
        >
          <Save size={20} color="#000" />
          <ThemedText style={styles.saveText}>حفظ التعديلات</ThemedText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ──────────────────────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────────────────────

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
          shadowRadius: isSelected ? 10 : 0,
          shadowOpacity: isSelected ? 1 : 0,
          elevation: isSelected ? 6 : 0,
        },
      ]}
    >
      <View style={styles.rarityCardTop}>
        <View style={[styles.rarityBadgePill, { backgroundColor: isSelected ? r.badgeBg : 'rgba(255,255,255,0.05)' }]}>
          <ThemedText style={[styles.rarityBadgeText, { color: isSelected ? r.textColor : '#64748b' }]}>
            {r.id.toUpperCase()}
          </ThemedText>
        </View>
        {isSelected && (
          <View style={[styles.checkCircle, { backgroundColor: r.badgeBg }]}>
            <Check size={11} color={r.checkColor} />
          </View>
        )}
      </View>
      <ThemedText style={[styles.rarityLabelAr, { color: isSelected ? '#fff' : '#475569' }]}>
        {r.labelAr}
      </ThemedText>
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
          shadowRadius: isSelected ? 18 : 0,
          shadowOpacity: isSelected ? 1 : 0,
          elevation: isSelected ? 10 : 0,
        },
      ]}
    >
      <View style={styles.specialCardInner}>
        <View style={styles.rarityCardTop}>
          <View style={[styles.rarityBadgePill, { backgroundColor: isSelected ? r.badgeBg : 'rgba(255,255,255,0.05)' }]}>
            <ThemedText style={[styles.rarityBadgeText, { color: isSelected ? r.textColor : '#64748b' }]}>
              SPECIAL
            </ThemedText>
          </View>
          {isSelected && (
            <View style={[styles.checkCircle, { backgroundColor: r.badgeBg }]}>
              <Check size={11} color={r.checkColor} />
            </View>
          )}
        </View>
        <ThemedText style={[
          styles.rarityLabelAr,
          { color: isSelected ? r.textColor : '#475569', fontSize: 15, letterSpacing: 1 },
        ]}>
          {r.labelAr}
        </ThemedText>
        {isSelected && (
          <ThemedText style={styles.specialHint}>
            نادرة جداً — لا تظهر في اللعب الاعتيادي
          </ThemedText>
        )}
      </View>
    </TouchableOpacity>
  );
}

function InputField({ label, value, onChangeText, placeholder, multiline = false, textAlign = 'left', accentColor }: any) {
  return (
    <View style={styles.inputGroup}>
      <ThemedText style={[styles.inputLabel, { textAlign: textAlign === 'right' ? 'right' : 'left' }]}>
        {label}
      </ThemedText>
      <View style={[styles.inputBox, multiline && { minHeight: 90 }]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#475569"
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
          style={[
            styles.textInput,
            { textAlign: textAlign as any, color: accentColor || '#e2e8f0' },
          ]}
        />
      </View>
    </View>
  );
}

// ──────────────────────────────────────────────────────────────
// Styles
// ──────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#020617' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(2,6,23,0.9)',
  },
  backBtn: {
    width: 40, height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },

  scrollContent: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 20 },
  section: { marginBottom: 28 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 12,
    textAlign: 'right',
  },

  rarityRow: { flexDirection: 'row', gap: 10 },
  rarityCard: {
    flex: 1,
    minHeight: 80,
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 12,
    justifyContent: 'space-between',
  },
  rarityCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rarityBadgePill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  rarityBadgeText: { fontSize: 9, fontWeight: '800', letterSpacing: 1.5 },
  checkCircle: {
    width: 20, height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rarityLabelAr: { fontSize: 13, fontWeight: '600', marginTop: 8, textAlign: 'left' },

  specialCard: { flex: 1, borderRadius: 16, borderWidth: 2, padding: 16 },
  specialCardInner: { gap: 6 },
  specialHint: { fontSize: 10, color: '#94a3b8', marginTop: 4, textAlign: 'right' },

  // ─── Image Picker styles
  imageUploadBox: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 18,
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  imageUploadIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageUploadTitle: { fontSize: 15, fontWeight: '700' },
  imageUploadSub: { fontSize: 12, color: 'rgba(255,255,255,0.35)', textAlign: 'center' },

  imagePreviewWrapper: { alignItems: 'center', gap: 12 },
  imagePreview: {
    width: '100%',
    height: 220,
    borderRadius: 18,
    borderWidth: 2,
  },
  imageActions: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  imageActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  imageActionText: { fontSize: 13, fontWeight: '700' },
  imageRemoveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: 'rgba(248,113,113,0.08)',
    borderColor: 'rgba(248,113,113,0.35)',
  },
  imageRemoveText: { fontSize: 13, fontWeight: '700', color: '#f87171' },

  // ─── Preview card styles
  previewCard: {
    borderWidth: 2,
    borderRadius: 18,
    padding: 18,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  previewBadge: { alignItems: 'flex-end', marginBottom: 10 },
  previewBadgePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  previewBadgeText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8 },
  previewName: { fontSize: 20, fontWeight: '800', textAlign: 'right', marginBottom: 8 },
  previewDesc: { fontSize: 13, color: '#cbd5e1', textAlign: 'right', lineHeight: 20 },
  previewWarning: { fontSize: 11, color: '#f87171', textAlign: 'right', marginTop: 8, lineHeight: 18 },

  // ─── Inputs
  inputGroup: { marginBottom: 16 },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  inputBox: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  textInput: { fontSize: 15, fontWeight: '500' },

  // ─── Footer
  footer: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    paddingBottom: 28,
    backgroundColor: 'rgba(2,6,23,0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  cancelBtn: {
    flex: 1,
    height: 54,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: { color: '#94a3b8', fontWeight: '600', fontSize: 15 },
  saveBtn: {
    flex: 2,
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  saveText: { color: '#000', fontWeight: '900', fontSize: 15, letterSpacing: 0.5 },
});
