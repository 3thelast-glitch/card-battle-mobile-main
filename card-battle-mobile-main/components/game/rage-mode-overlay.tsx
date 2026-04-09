/**
 * RageModeOverlay.tsx
 * شاشة Overlay تظهر لحظة تفعيل وضع الغضب
 * — تعرض فيديو التحول إن وُجد، وإلا تعرض صورة الغضب مع تأثير بصري
 */
import React, { useEffect, useRef } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Text,
  Platform,
} from 'react-native';
import type { RageTriggerEvent } from '@/lib/game/rage-engine';

interface Props {
  event: RageTriggerEvent | null;
  onDismiss: () => void;
}

export function RageModeOverlay({ event, onDismiss }: Props) {
  const opacity  = useRef(new Animated.Value(0)).current;
  const scale    = useRef(new Animated.Value(0.75)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!event) return;
    // انتر
    Animated.parallel([
      Animated.spring(opacity, { toValue: 1, useNativeDriver: true, damping: 18, stiffness: 200 }),
      Animated.spring(scale,   { toValue: 1, useNativeDriver: true, damping: 14, stiffness: 180 }),
    ]).start();

    // توهج لا نهائي
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
      ])
    ).start();

    // إغلاق تلقائي بعد 3.5 ثانية إذا لم يوجد فيديو
    if (!event.videoUrl) {
      const t = setTimeout(onDismiss, 3500);
      return () => clearTimeout(t);
    }
  }, [event]);

  if (!event) return null;

  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.85] });

  return (
    <View style={s.backdrop}>
      {/* توهج الخلفية */}
      <Animated.View style={[s.glow, { opacity: glowOpacity }]} />

      <Animated.View style={[s.card, { opacity, transform: [{ scale }] }]}>
        {/* اسم وضع الغضب */}
        <Text style={s.rageName}>
          {event.rageCard.nameAr ?? event.rageCard.name}
        </Text>
        <Text style={s.rageTag}>⚡ وضع الغضب ⚡</Text>

        {/* فيديو أو صورة */}
        {event.videoUrl ? (
          <VideoPlayer uri={event.videoUrl} onEnd={onDismiss} />
        ) : event.imageUrl ? (
          <Image
            source={{ uri: event.imageUrl }}
            style={s.rageImage}
            resizeMode="contain"
          />
        ) : null}

        {/* مؤشر الزيادة */}
        <View style={s.boostRow}>
          {event.rageCard.attack !== event.card.attack && (
            <View style={[s.boostBadge, { borderColor: '#f87171' }]}>
              <Text style={[s.boostIcon]}>⚔️</Text>
              <Text style={[s.boostVal, { color: '#f87171' }]}>
                {event.card.attack} → {event.rageCard.attack}
              </Text>
            </View>
          )}
          {event.rageCard.defense !== event.card.defense && (
            <View style={[s.boostBadge, { borderColor: '#60a5fa' }]}>
              <Text style={s.boostIcon}>🛡️</Text>
              <Text style={[s.boostVal, { color: '#60a5fa' }]}>
                {event.card.defense} → {event.rageCard.defense}
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity style={s.dismissBtn} onPress={onDismiss} activeOpacity={0.75}>
          <Text style={s.dismissTxt}>استمرار ⚡</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

// ── مشغّل الفيديو (web only placeholder) ──
function VideoPlayer({ uri, onEnd }: { uri: string; onEnd: () => void }) {
  if (Platform.OS === 'web') {
    return (
      <video
        src={uri}
        autoPlay
        playsInline
        muted={false}
        style={{ width: 220, height: 280, borderRadius: 14, objectFit: 'contain', background: '#000' }}
        onEnded={onEnd}
      />
    );
  }
  // React Native — استخدم expo-av إذا أردت دعم نيتف
  return (
    <View style={{ width: 220, height: 280, backgroundColor: '#111', borderRadius: 14, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: '#a78bfa', fontSize: 36 }}>🎦</Text>
      <Text style={{ color: '#888', fontSize: 11, marginTop: 6 }}>فيديو التحول</Text>
    </View>
  );
}

const RAGE_COLOR = '#f59e0b';

const s = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  glow: {
    position: 'absolute',
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: RAGE_COLOR,
    shadowColor: RAGE_COLOR,
    shadowOpacity: 1,
    shadowRadius: 80,
    shadowOffset: { width: 0, height: 0 },
  },
  card: {
    backgroundColor: 'rgba(12,10,6,0.97)',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: RAGE_COLOR,
    padding: 22,
    alignItems: 'center',
    gap: 12,
    width: 300,
    shadowColor: RAGE_COLOR,
    shadowOpacity: 0.8,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 0 },
    elevation: 20,
  },
  rageName: {
    fontSize: 22,
    fontWeight: '900',
    color: RAGE_COLOR,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  rageTag: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff7e6',
    letterSpacing: 2,
    opacity: 0.8,
  },
  rageImage: {
    width: 220,
    height: 280,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: RAGE_COLOR + '55',
  },
  boostRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  boostBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  boostIcon: { fontSize: 14 },
  boostVal: {
    fontSize: 14,
    fontWeight: '800',
  },
  dismissBtn: {
    marginTop: 4,
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: RAGE_COLOR,
    backgroundColor: RAGE_COLOR + '22',
  },
  dismissTxt: {
    color: RAGE_COLOR,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
