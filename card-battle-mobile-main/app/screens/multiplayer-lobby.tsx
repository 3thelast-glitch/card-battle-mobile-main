/**
 * MultiplayerLobbyScreen
 * شاشة إنشاء / الانضمام للغرفة
 */
import React, { useState, useCallback, useRef } from 'react';
import {
  View, TouchableOpacity, StyleSheet,
  TextInput, ActivityIndicator, Modal, ScrollView,
} from 'react-native';
import { ThemedText as Text } from '@/components/ui/ThemedText';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LuxuryBackground } from '@/components/game/luxury-background';
import { mpClient } from '@/lib/multiplayer/websocket-client';
import { COLOR, SPACE, RADIUS, FONT, SHADOW } from '@/components/ui/design-tokens';
import AsyncStorage from '@react-native-async-storage/async-storage';

type LobbyPhase = 'menu' | 'creating' | 'waiting_opponent' | 'joining' | 'ready';

function generatePlayerId() {
  return 'p_' + Math.random().toString(36).slice(2, 10);
}

export default function MultiplayerLobbyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [phase, setPhase] = useState<LobbyPhase>('menu');
  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [joinInput, setJoinInput] = useState('');
  const [opponentName, setOpponentName] = useState('');
  const [error, setError] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const playerIdRef = useRef<string>('');

  // ─── اتصال بالسيرفر ──────────────────────────────────────────────────────
  const ensureConnected = useCallback(async () => {
    if (!mpClient.isConnected()) {
      await mpClient.connect();
    }
  }, []);

  // ─── إنشاء غرفة ──────────────────────────────────────────────────────────
  const handleCreate = useCallback(async () => {
    if (!playerName.trim()) { setError('أدخل اسمك أولاً'); return; }
    setError('');
    setIsConnecting(true);

    try {
      await ensureConnected();

      let pid = await AsyncStorage.getItem('mp_player_id');
      if (!pid) { pid = generatePlayerId(); await AsyncStorage.setItem('mp_player_id', pid); }
      playerIdRef.current = pid;

      mpClient.on('ROOM_CREATED', (msg) => {
        const { roomId: rid } = msg.payload;
        setRoomId(rid);
        setPhase('waiting_opponent');
        setIsConnecting(false);
      });

      mpClient.on('PLAYER_JOINED', (msg) => {
        const opponent = msg.payload.player;
        setOpponentName(opponent?.name ?? 'لاعب');
        setPhase('ready');
      });

      mpClient.on('ERROR', (msg) => {
        setError(msg.payload.error);
        setIsConnecting(false);
      });

      mpClient.createRoom(pid, playerName.trim());
    } catch {
      setError('فشل الاتصال بالسيرفر');
      setIsConnecting(false);
    }
  }, [playerName, ensureConnected]);

  // ─── الانضمام لغرفة ───────────────────────────────────────────────────────
  const handleJoin = useCallback(async () => {
    if (!playerName.trim()) { setError('أدخل اسمك أولاً'); return; }
    if (!joinInput.trim()) { setError('أدخل كود الغرفة'); return; }
    setError('');
    setIsConnecting(true);

    try {
      await ensureConnected();

      let pid = await AsyncStorage.getItem('mp_player_id');
      if (!pid) { pid = generatePlayerId(); await AsyncStorage.setItem('mp_player_id', pid); }
      playerIdRef.current = pid;

      mpClient.on('ROOM_JOINED', (msg) => {
        const p1 = msg.payload.player1;
        setOpponentName(p1?.name ?? 'لاعب');
        setRoomId(msg.payload.roomId);
        setPhase('ready');
        setIsConnecting(false);
      });

      mpClient.on('ERROR', (msg) => {
        setError(msg.payload.error === 'Room not found or full' ? 'الغرفة غير موجودة أو ممتلئة' : msg.payload.error);
        setIsConnecting(false);
      });

      mpClient.joinRoom(joinInput.trim().toUpperCase(), pid, playerName.trim());
    } catch {
      setError('فشل الاتصال بالسيرفر');
      setIsConnecting(false);
    }
  }, [playerName, joinInput, ensureConnected]);

  // ─── بدء المعركة ─────────────────────────────────────────────────────────
  const handleStartBattle = useCallback(() => {
    router.push({
      pathname: '/screens/multiplayer-battle' as any,
      params: {
        roomId,
        playerId: playerIdRef.current,
        playerName: playerName.trim(),
        opponentName,
      },
    });
  }, [roomId, playerName, opponentName, router]);

  // ─── UI ──────────────────────────────────────────────────────────────────
  return (
    <View style={S.root}>
      <StatusBar hidden />
      <View style={S.bg}><LuxuryBackground /></View>

      <ScrollView
        contentContainerStyle={[
          S.container,
          { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={S.header}>
          <Text style={S.title}>⚔️ ملتي بلاير</Text>
          <Text style={S.subtitle}>العب ضد صديق في الوقت الحقيقي</Text>
        </View>

        {/* Name input */}
        <View style={S.card}>
          <Text style={S.label}>اسمك في اللعبة</Text>
          <TextInput
            style={S.input}
            placeholder="اكتب اسمك..."
            placeholderTextColor="#475569"
            value={playerName}
            onChangeText={setPlayerName}
            maxLength={20}
            editable={phase === 'menu'}
          />
        </View>

        {/* Error */}
        {!!error && (
          <View style={S.errorBox}>
            <Text style={S.errorText}>⚠️ {error}</Text>
          </View>
        )}

        {/* ── Menu ── */}
        {phase === 'menu' && (
          <View style={S.actions}>
            <TouchableOpacity
              style={[S.btn, S.btnCreate]}
              onPress={handleCreate}
              disabled={isConnecting}
              activeOpacity={0.85}
            >
              {isConnecting
                ? <ActivityIndicator color="#fff" />
                : <>
                    <Text style={S.btnIcon}>🏠</Text>
                    <Text style={S.btnText}>إنشاء غرفة</Text>
                  </>
              }
            </TouchableOpacity>

            <View style={S.divider}>
              <View style={S.dividerLine} />
              <Text style={S.dividerText}>أو</Text>
              <View style={S.dividerLine} />
            </View>

            <View style={S.joinRow}>
              <TextInput
                style={[S.input, S.joinInput]}
                placeholder="كود الغرفة (6 أحرف)"
                placeholderTextColor="#475569"
                value={joinInput}
                onChangeText={t => setJoinInput(t.toUpperCase())}
                maxLength={6}
                autoCapitalize="characters"
              />
              <TouchableOpacity
                style={[S.btn, S.btnJoin]}
                onPress={handleJoin}
                disabled={isConnecting}
                activeOpacity={0.85}
              >
                <Text style={S.btnText}>انضم</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── Waiting for opponent ── */}
        {phase === 'waiting_opponent' && (
          <View style={S.waitingBox}>
            <Text style={S.waitingLabel}>كود الغرفة</Text>
            <Text style={S.roomCode}>{roomId}</Text>
            <Text style={S.waitingHint}>أرسل الكود لصديقك وانتظر...</Text>
            <ActivityIndicator color={COLOR.gold} style={{ marginTop: SPACE.lg }} />
          </View>
        )}

        {/* ── Ready ── */}
        {phase === 'ready' && (
          <View style={S.readyBox}>
            <Text style={S.readyIcon}>✅</Text>
            <Text style={S.readyTitle}>الغرفة جاهزة!</Text>
            <Text style={S.readyPlayers}>
              {playerName.trim()} <Text style={{ color: COLOR.gold }}>VS</Text> {opponentName}
            </Text>
            <TouchableOpacity
              style={[S.btn, S.btnStart]}
              onPress={handleStartBattle}
              activeOpacity={0.85}
            >
              <Text style={S.btnIcon}>⚔️</Text>
              <Text style={S.btnText}>ابدأ المعركة!</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Back */}
        <TouchableOpacity
          style={S.backBtn}
          onPress={() => {
            if (phase !== 'menu') {
              mpClient.leaveRoom(playerIdRef.current);
              setPhase('menu');
            } else {
              router.back();
            }
          }}
        >
          <Text style={S.backText}>← رجوع</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#080612' },
  bg: { position: 'absolute', inset: 0 },
  container: { flexGrow: 1, alignItems: 'center', paddingHorizontal: SPACE.xl, gap: SPACE.xl },
  header: { alignItems: 'center', gap: SPACE.sm },
  title: { fontSize: FONT.xxl + 4, color: COLOR.gold, letterSpacing: 1 },
  subtitle: { fontSize: FONT.sm, color: '#94a3b8', textAlign: 'center' },
  card: { width: '100%', maxWidth: 400, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: RADIUS.lg, borderWidth: 1, borderColor: 'rgba(228,165,42,0.2)', padding: SPACE.lg, gap: SPACE.sm },
  label: { color: '#94a3b8', fontSize: FONT.xs },
  input: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: RADIUS.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', color: '#f1f5f9', fontSize: FONT.base, paddingHorizontal: SPACE.lg, paddingVertical: SPACE.md, textAlign: 'right' },
  errorBox: { backgroundColor: 'rgba(248,113,113,0.1)', borderRadius: RADIUS.md, borderWidth: 1, borderColor: 'rgba(248,113,113,0.3)', padding: SPACE.md },
  errorText: { color: '#f87171', fontSize: FONT.sm, textAlign: 'center' },
  actions: { width: '100%', maxWidth: 400, gap: SPACE.lg },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACE.sm, borderRadius: RADIUS.pill, paddingVertical: SPACE.lg, paddingHorizontal: SPACE.xl, borderWidth: 1.5 },
  btnCreate: { backgroundColor: 'rgba(74,222,128,0.12)', borderColor: '#4ade80', ...SHADOW },
  btnJoin: { backgroundColor: 'rgba(96,165,250,0.12)', borderColor: '#60a5fa', paddingHorizontal: SPACE.xl },
  btnStart: { backgroundColor: 'rgba(228,165,42,0.15)', borderColor: COLOR.gold, marginTop: SPACE.md, ...SHADOW },
  btnIcon: { fontSize: 18 },
  btnText: { color: '#f1f5f9', fontSize: FONT.base, letterSpacing: 0.3 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: SPACE.md },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.08)' },
  dividerText: { color: '#475569', fontSize: FONT.sm },
  joinRow: { flexDirection: 'row', gap: SPACE.sm, alignItems: 'center' },
  joinInput: { flex: 1, textAlign: 'center', letterSpacing: 4 },
  waitingBox: { alignItems: 'center', gap: SPACE.md, backgroundColor: 'rgba(228,165,42,0.06)', borderRadius: RADIUS.xl, borderWidth: 1, borderColor: 'rgba(228,165,42,0.25)', padding: SPACE.xxl, width: '100%', maxWidth: 400 },
  waitingLabel: { color: '#94a3b8', fontSize: FONT.sm },
  roomCode: { fontSize: 40, color: COLOR.gold, letterSpacing: 8, fontVariant: ['tabular-nums'] } as any,
  waitingHint: { color: '#64748b', fontSize: FONT.sm },
  readyBox: { alignItems: 'center', gap: SPACE.md, padding: SPACE.xxl, width: '100%', maxWidth: 400 },
  readyIcon: { fontSize: 48 },
  readyTitle: { fontSize: FONT.xl, color: '#4ade80' },
  readyPlayers: { fontSize: FONT.base, color: '#e2e8f0', textAlign: 'center' },
  backBtn: { marginTop: SPACE.xl, padding: SPACE.md },
  backText: { color: '#64748b', fontSize: FONT.sm },
});
