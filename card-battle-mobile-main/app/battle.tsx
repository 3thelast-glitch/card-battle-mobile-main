import React, { useMemo, useCallback } from 'react';
import {
  View, TouchableOpacity, StyleSheet,
  Platform, Modal, ScrollView, Alert, StatusBar,
} from 'react-native';
import { ThemedText as Text } from '@/components/ui/ThemedText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as ScreenOrientation from 'expo-screen-orientation';
import Animated from 'react-native-reanimated';
import { useEffect } from 'react';

import { CardItem } from '@/components/game/card-item';
import { ElementEffect } from '@/components/game/element-effect';
import { LuxuryBackground } from '@/components/game/luxury-background';
import { useGame } from '@/lib/game/game-context';
import { ELEMENT_EMOJI, ElementAdvantage } from '@/lib/game/types';
import { getAbilityNameAr } from '@/lib/game/ability-names';
import { PredictionModal, PopularityModal } from '@/components/modals';
import {
  buildPredictionSummary,
  getRemainingRounds,
  getUpcomingPredictionRounds,
  isPredictionComplete,
} from '@/lib/game/ui-helpers';
import {
  useBattlePhase,
  useBattleAnimations,
  useBattleAbilities,
} from '@/lib/game/hooks';

// ─── Helper functions ────────────────────────────────────────────────────────────────

const getAdvantageColor = (advantage: ElementAdvantage): string => {
  switch (advantage) {
    case 'strong': return '#4ade80';
    case 'weak': return '#f87171';
    default: return '#a0a0a0';
  }
};

const getAdvantageText = (advantage: ElementAdvantage): string => {
  switch (advantage) {
    case 'strong': return '\u2b06\ufe0f \u0642\u0648\u064a';
    case 'weak': return '\u2b07\ufe0f \u0636\u0639\u064a\u0641';
    default: return '';
  }
};

// ─── Top HUD ────────────────────────────────────────────────────────────────

const TopHUD = ({
  playerScore, botScore, currentRound, totalRounds, showResult,
  lastRoundResult, predictionSummary,
}: any) => (
  <View style={styles.topHud}>
    <View style={styles.hudSide}>
      <Text style={styles.hudLabel}>\u{1F464} \u0623\u0646\u062a</Text>
      <Text style={[styles.hudScore, { color: '#4ade80' }]}>{playerScore}</Text>
    </View>
    <View style={styles.hudCenter}>
      <Text style={styles.vsText}>\u2694\ufe0f VS \u2694\ufe0f</Text>
      {predictionSummary ? <Text style={styles.predictionSummaryHud}>{predictionSummary}</Text> : null}
      <Text style={styles.roundText}>
        \u0627\u0644\u062c\u0648\u0644\u0629 {showResult ? lastRoundResult?.round : currentRound}/{totalRounds}
      </Text>
    </View>
    <View style={[styles.hudSide, styles.hudSideRight]}>
      <Text style={styles.hudLabel}>\u{1F916} \u0627\u0644\u0628\u0648\u062a</Text>
      <Text style={[styles.hudScore, { color: '#f87171' }]}>{botScore}</Text>
    </View>
  </View>
);

// ─── History chips row ───────────────────────────────────────────────────────

const HistoryRow = ({ results, side }: { results: any[]; side: 'player' | 'bot' }) => {
  if (!results || results.length === 0) return null;
  return (
    <View style={styles.historyRow}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.historyRowContent}>
        {results.map((r: any) => {
          const won = r.winner === side;
          const draw = r.winner === 'draw';
          const chipColor = won ? 'rgba(74,222,128,0.2)' : draw ? 'rgba(251,191,36,0.2)' : 'rgba(248,113,113,0.2)';
          const borderColor = won ? '#4ade80' : draw ? '#fbbf24' : '#f87171';
          const icon = won ? '\u2713' : draw ? '=' : '\u2717';
          const cardName = side === 'player' ? r.playerCard?.nameAr : r.botCard?.nameAr;
          return (
            <View key={r.round} style={[styles.historyChip, { backgroundColor: chipColor, borderColor }]}>
              <Text style={[styles.historyChipIcon, { color: borderColor }]}>{icon}</Text>
              <Text style={styles.historyChipName} numberOfLines={1}>{cardName}</Text>
              <Text style={styles.historyChipRound}>R{r.round}</Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

// ─── Ability buttons row ───────────────────────────────────────────────────────────

const AbilityRow = ({
  abilities, roundNumber, activeEffects, upcomingRounds, remainingRounds,
  onTriggerPrediction, onTriggerPopularity, onUseAbility,
}: any) => {
  if (!abilities || abilities.length === 0) return null;
  return (
    <View style={styles.abilitiesRow}>
      {abilities.map((ability: any, index: number) => (
        <TouchableOpacity
          key={index}
          style={[styles.abilityBtn, ability.used && styles.abilityBtnDisabled]}
          onPress={() => {
            if (ability.used) return;
            const isSealed = activeEffects.some(
              (effect: any) =>
                effect.kind === 'silenceAbilities' &&
                (effect.targetSide === 'player' || effect.targetSide === 'all') &&
                effect.createdAtRound <= roundNumber &&
                (effect.expiresAtRound === undefined || roundNumber <= effect.expiresAtRound)
            );
            if (isSealed) {
              Alert.alert('\u0627\u0644\u0642\u062f\u0631\u0627\u062a \u0645\u062e\u062a\u0648\u0645\u0629', '\u0644\u0627 \u064a\u0645\u0643\u0646\u0643 \u062a\u0641\u0639\u064a\u0644 \u0627\u0644\u0642\u062f\u0631\u0627\u062a \u062e\u0644\u0627\u0644 \u0645\u062f\u0629 \u0627\u0644\u062e\u062a\u0645.');
              return;
            }
            if (['LogicalEncounter', 'Eclipse', 'Trap', 'Pool'].includes(ability.type)) {
              if (upcomingRounds.length === 0) return;
              onTriggerPrediction(ability.type);
              return;
            }
            if (['Popularity', 'Rescue', 'Penetration'].includes(ability.type)) {
              if (remainingRounds.length === 0) return;
              onTriggerPopularity(ability.type);
              return;
            }
            onUseAbility(ability.type);
            if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }}
          disabled={ability.used}
          activeOpacity={0.75}
        >
          <Text style={styles.abilityBtnText} numberOfLines={2}>
            {ability.used ? '\u2717' : '\u2713'} {getAbilityNameAr(ability.type)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// ─── Bottom bar ────────────────────────────────────────────────────────────────

const BottomBar = ({ onLog, onNext, onMenu, nextDisabled, isGameOver }: any) => (
  <View style={styles.bottomBar}>
    <TouchableOpacity style={styles.bottomBtn} onPress={onLog} activeOpacity={0.8}>
      <Text style={styles.bottomBtnIcon}>\u{1F4CB}</Text>
      <Text style={styles.bottomBtnLabel}>\u0627\u0644\u0633\u062c\u0644</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={[styles.bottomBtn, styles.bottomBtnPrimary, nextDisabled && styles.bottomBtnMuted]}
      onPress={onNext}
      disabled={nextDisabled}
      activeOpacity={0.8}
    >
      <Text style={[styles.bottomBtnIcon, !nextDisabled && { color: '#1a0d1a' }]}>
        {isGameOver ? '\u{1F3C6}' : '\u23ed\ufe0f'}
      </Text>
      <Text style={[styles.bottomBtnLabel, !nextDisabled && { color: '#1a0d1a', fontWeight: '800' }]}>
        {isGameOver ? '\u0627\u0644\u0646\u062a\u0627\u0626\u062c' : '\u0627\u0644\u062a\u0627\u0644\u064a'}
      </Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.bottomBtn} onPress={onMenu} activeOpacity={0.8}>
      <Text style={styles.bottomBtnIcon}>\u2699\ufe0f</Text>
      <Text style={styles.bottomBtnLabel}>\u0627\u0644\u0642\u0627\u0626\u0645\u0629</Text>
    </TouchableOpacity>
  </View>
);

// ─── Main BattleScreen ───────────────────────────────────────────────────────

export default function BattleScreen() {
  const router = useRouter();
  const {
    state,
    playRound,
    isGameOver,
    currentPlayerCard,
    currentBotCard,
    lastRoundResult,
    useAbility,
  } = useGame();

  // ─ Hooks ─
  const animations = useBattleAnimations();

  const { phase, setPhase, showResult, showPlayerEffect, showBotEffect } = useBattlePhase({
    currentPlayerCard,
    currentBotCard,
    currentRound: state.currentRound,
    lastRoundResult,
    playRound,
    onPhaseShowing: () => {
      animations.resetAnimations();
      animations.playEntranceAnimation();
    },
    onPhaseFighting: () => {},
    onFightDone: () => {},
  });

  // تشغيل أنيمشن النتيجة عند showResult
  useEffect(() => {
    if (showResult) animations.playResultAnimation();
  }, [showResult]);

  const abilities = useBattleAbilities();

  // ─ State محلي بسيط ─
  const [showHistoryModal, setShowHistoryModal] = React.useState(false);

  // ─ Lock orientation ─
  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    return () => { ScreenOrientation.unlockAsync(); };
  }, []);

  // ─ Derived values ─
  const roundNumber = state.currentRound + 1;
  const upcomingRounds = useMemo(() => getUpcomingPredictionRounds(roundNumber, state.totalRounds), [roundNumber, state.totalRounds]);
  const remainingRounds = useMemo(() => getRemainingRounds(roundNumber, state.totalRounds), [roundNumber, state.totalRounds]);
  const predictionComplete = useMemo(
    () => isPredictionComplete(upcomingRounds, abilities.predictionSelections),
    [upcomingRounds, abilities.predictionSelections]
  );
  const isPopularityReady = abilities.selectedPopularityRound !== null;
  const predictionSummary = useMemo(() => buildPredictionSummary(state.activeEffects, 'player'), [state.activeEffects]);

  const displayPlayerCard = showResult && lastRoundResult ? lastRoundResult.playerCard : currentPlayerCard;
  const displayBotCard = showResult && lastRoundResult ? lastRoundResult.botCard : currentBotCard;

  const handleNextRound = useCallback(() => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isGameOver) {
      router.push('/screens/battle-results' as any);
    } else {
      setPhase('showing');
    }
  }, [isGameOver, router, setPhase]);

  const getResultMessage = () => {
    if (!lastRoundResult) return '';
    switch (lastRoundResult.winner) {
      case 'player': return '\u{1F389} \u0623\u0646\u062a \u0627\u0644\u0641\u0627\u0626\u0632!';
      case 'bot': return '\u{1F622} \u0627\u0644\u0628\u0648\u062a \u064a\u0641\u0648\u0632!';
      default: return '\u{1F91D} \u062a\u0639\u0627\u062f\u0644\u0627\u064b!';
    }
  };

  const getResultColor = () => {
    if (!lastRoundResult) return '#a0a0a0';
    switch (lastRoundResult.winner) {
      case 'player': return '#4ade80';
      case 'bot': return '#f87171';
      default: return '#fbbf24';
    }
  };

  if (!displayPlayerCard || !displayBotCard) {
    return (
      <SafeAreaView style={styles.root} edges={['top', 'bottom', 'left', 'right']}>
        <LuxuryBackground />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>\u062c\u0627\u0631\u064a \u0627\u0644\u062a\u062d\u0645\u064a\u0644...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom', 'left', 'right']}>
      <StatusBar hidden />

      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <LuxuryBackground />
        <View style={styles.frameBorderTop} />
        <View style={styles.frameBorderBottom} />
        <View style={styles.frameBorderLeft} />
        <View style={styles.frameBorderRight} />
      </View>

      <TopHUD
        playerScore={state.playerScore}
        botScore={state.botScore}
        currentRound={roundNumber}
        totalRounds={state.totalRounds}
        showResult={showResult}
        lastRoundResult={lastRoundResult}
        predictionSummary={predictionSummary}
      />

      <View style={styles.arenaSplit}>

        {/* Player side */}
        <View style={styles.playerArena}>
          <HistoryRow results={state.roundResults} side="player" />
          <View style={styles.cardWrapper}>
            <Animated.View style={animations.playerCardAnimatedStyle}>
              <CardItem card={displayPlayerCard} size="large" />
              {showPlayerEffect && <ElementEffect element={displayPlayerCard.element} isActive={true} />}
            </Animated.View>
            {showResult && lastRoundResult && (
              <View style={styles.damageInfo}>
                <Text style={styles.damageText}>\u26a1 \u0627\u0644\u0636\u0631\u0631: {lastRoundResult.playerDamage}</Text>
                {lastRoundResult.playerElementAdvantage !== 'neutral' && (
                  <Text style={[styles.advantageText, { color: getAdvantageColor(lastRoundResult.playerElementAdvantage) }]}>
                    {ELEMENT_EMOJI[lastRoundResult.playerCard.element]} {getAdvantageText(lastRoundResult.playerElementAdvantage)}
                  </Text>
                )}
              </View>
            )}
          </View>
          {state.abilitiesEnabled && (
            <AbilityRow
              abilities={state.playerAbilities}
              roundNumber={roundNumber}
              activeEffects={state.activeEffects}
              upcomingRounds={upcomingRounds}
              remainingRounds={remainingRounds}
              onTriggerPrediction={abilities.openPredictionModal}
              onTriggerPopularity={abilities.openPopularityModal}
              onUseAbility={(type: string) => useAbility(type as any)}
            />
          )}
        </View>

        <View style={styles.arenaDivider} />

        {/* Bot side */}
        <View style={styles.botArena}>
          <HistoryRow results={state.roundResults} side="bot" />
          <View style={styles.cardWrapper}>
            <Animated.View style={animations.botCardAnimatedStyle}>
              <CardItem card={displayBotCard} size="large" />
              {showBotEffect && <ElementEffect element={displayBotCard.element} isActive={true} />}
            </Animated.View>
            {showResult && lastRoundResult && (
              <View style={styles.damageInfo}>
                <Text style={styles.damageText}>\u26a1 \u0627\u0644\u0636\u0631\u0631: {lastRoundResult.botDamage}</Text>
                {lastRoundResult.botElementAdvantage !== 'neutral' && (
                  <Text style={[styles.advantageText, { color: getAdvantageColor(lastRoundResult.botElementAdvantage) }]}>
                    {ELEMENT_EMOJI[lastRoundResult.botCard.element]} {getAdvantageText(lastRoundResult.botElementAdvantage)}
                  </Text>
                )}
              </View>
            )}
          </View>
          {showResult && lastRoundResult && (
            <Animated.View style={[styles.resultBanner, { borderColor: getResultColor() }]}>
              <Text style={[styles.resultBannerText, { color: getResultColor() }]}>
                {getResultMessage()}
              </Text>
            </Animated.View>
          )}
        </View>

      </View>

      <BottomBar
        onLog={() => setShowHistoryModal(true)}
        onNext={handleNextRound}
        onMenu={() => router.back()}
        nextDisabled={phase !== 'waiting'}
        isGameOver={isGameOver}
      />

      {/* ─ Modals ─ */}
      <PredictionModal
        visible={abilities.showPredictionModal}
        upcomingRounds={upcomingRounds}
        selections={abilities.predictionSelections}
        onSelect={abilities.handleSelectPrediction}
        onCancel={abilities.closePredictionModal}
        onRequestClose={abilities.closePredictionModal}
        onConfirm={() => abilities.handleConfirmPrediction(useAbility)}
        isConfirmDisabled={!predictionComplete}
      />

      <PopularityModal
        visible={abilities.showPopularityModal}
        remainingRounds={remainingRounds}
        selectedRound={abilities.selectedPopularityRound}
        onSelect={abilities.handleSelectPopularityRound}
        onCancel={abilities.closePopularityModal}
        onRequestClose={abilities.closePopularityModal}
        onConfirm={() => abilities.handleConfirmPopularity(useAbility)}
        isConfirmDisabled={!isPopularityReady}
      />

      <Modal
        visible={showHistoryModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowHistoryModal(false)}
      >
        <View style={styles.historyModalOverlay}>
          <View style={styles.historyModalContent}>
            <View style={styles.historyModalHeader}>
              <Text style={styles.historyModalTitle}>\u{1F4CB} \u0633\u062c\u0644 \u0627\u0644\u0628\u0637\u0627\u0642\u0627\u062a</Text>
              <TouchableOpacity onPress={() => setShowHistoryModal(false)}>
                <Text style={styles.historyModalClose}>\u00d7</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.historyScroll}>
              {state.roundResults.map((result) => (
                <View key={result.round} style={styles.historyRoundItem}>
                  <Text style={styles.historyRoundNumber}>\u0627\u0644\u062c\u0648\u0644\u0629 {result.round}</Text>
                  <View style={styles.historyCardsRow}>
                    <View style={styles.historyCardSection}>
                      <Text style={styles.historyCardLabel}>\u{1F464} \u0623\u0646\u062a</Text>
                      <Text style={styles.historyCardName}>{result.playerCard.nameAr}</Text>
                      <Text style={styles.historyCardStats}>\u0627\u0644\u0636\u0631\u0631: {result.playerDamage}</Text>
                    </View>
                    <View style={styles.historyVS}>
                      <Text style={styles.historyVSText}>VS</Text>
                    </View>
                    <View style={styles.historyCardSection}>
                      <Text style={styles.historyCardLabel}>\u{1F916} \u0627\u0644\u0628\u0648\u062a</Text>
                      <Text style={styles.historyCardName}>{result.botCard.nameAr}</Text>
                      <Text style={styles.historyCardStats}>\u0627\u0644\u0636\u0631\u0631: {result.botDamage}</Text>
                    </View>
                  </View>
                  <Text style={[
                    styles.historyWinner,
                    { color: result.winner === 'player' ? '#4ade80' : result.winner === 'bot' ? '#f87171' : '#fbbf24' },
                  ]}>
                    {result.winner === 'player' ? '\u2713 \u0623\u0646\u062a \u0627\u0644\u0641\u0627\u0626\u0632' : result.winner === 'bot' ? '\u2717 \u0627\u0644\u0628\u0648\u062a \u064a\u0641\u0648\u0632' : '= \u062a\u0639\u0627\u062f\u0644'}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────

const GOLD = '#e4a52a';
const GOLD_DIM = 'rgba(228,165,42,0.3)';
const BG_DARK = '#1a0d1a';
const BG_CARD = 'rgba(26,13,26,0.92)';

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG_DARK, flexDirection: 'column' },
  frameBorderTop: { position: 'absolute', top: 0, left: 0, right: 0, height: 2, backgroundColor: GOLD },
  frameBorderBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, backgroundColor: GOLD },
  frameBorderLeft: { position: 'absolute', top: 0, bottom: 0, left: 0, width: 2, backgroundColor: GOLD },
  frameBorderRight: { position: 'absolute', top: 0, bottom: 0, right: 0, width: 2, backgroundColor: GOLD },
  topHud: { height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, backgroundColor: BG_CARD, borderBottomWidth: 1, borderBottomColor: GOLD_DIM, zIndex: 10 },
  hudSide: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  hudSideRight: { justifyContent: 'flex-end' },
  hudLabel: { color: '#ccc', fontSize: 13, fontWeight: '600' },
  hudScore: { fontSize: 24, fontWeight: '800' },
  hudCenter: { flex: 1, alignItems: 'center' },
  vsText: { fontSize: 18, fontWeight: '800', color: '#e94560', letterSpacing: 1 },
  roundText: { fontSize: 11, color: GOLD, fontWeight: '700', marginTop: 1 },
  predictionSummaryHud: { fontSize: 10, color: '#fbbf24' },
  arenaSplit: { flex: 1, flexDirection: 'row', paddingHorizontal: 8, paddingVertical: 6 },
  playerArena: { flex: 1, paddingRight: 6, alignItems: 'center', justifyContent: 'space-between', gap: 4 },
  botArena: { flex: 1, paddingLeft: 6, alignItems: 'center', justifyContent: 'space-between', gap: 4 },
  arenaDivider: { width: 1, alignSelf: 'stretch', backgroundColor: GOLD_DIM, marginVertical: 4 },
  cardWrapper: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  damageInfo: { alignItems: 'center', marginTop: 6, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4 },
  damageText: { fontSize: 12, color: '#e94560', fontWeight: 'bold' },
  advantageText: { fontSize: 11, fontWeight: 'bold', marginTop: 2 },
  historyRow: { width: '100%', height: 36 },
  historyRowContent: { alignItems: 'center', gap: 6, paddingHorizontal: 4 },
  historyChip: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3, gap: 4, maxWidth: 110 },
  historyChipIcon: { fontSize: 11, fontWeight: '800' },
  historyChipName: { fontSize: 9, color: '#eee', fontWeight: '600', flex: 1 },
  historyChipRound: { fontSize: 9, color: '#888' },
  abilitiesRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6, paddingVertical: 4, paddingHorizontal: 4 },
  abilityBtn: { backgroundColor: GOLD, paddingVertical: 7, paddingHorizontal: 10, borderRadius: 16, alignItems: 'center', justifyContent: 'center', minWidth: 80, maxWidth: 110, shadowColor: GOLD, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 4, elevation: 4 },
  abilityBtnDisabled: { backgroundColor: '#444', opacity: 0.5, shadowOpacity: 0 },
  abilityBtnText: { fontSize: 10, fontWeight: '700', color: '#1a0d1a', textAlign: 'center' },
  resultBanner: { borderWidth: 2, borderRadius: 16, paddingHorizontal: 18, paddingVertical: 8, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center' },
  resultBannerText: { fontSize: 18, fontWeight: '800' },
  bottomBar: { height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly', paddingHorizontal: 12, backgroundColor: 'rgba(20,10,20,0.98)', borderTopWidth: 1, borderTopColor: GOLD_DIM, gap: 8 },
  bottomBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 6, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', gap: 2 },
  bottomBtnPrimary: { backgroundColor: GOLD, borderColor: GOLD, shadowColor: GOLD, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.6, shadowRadius: 6, elevation: 6 },
  bottomBtnMuted: { opacity: 0.4 },
  bottomBtnIcon: { fontSize: 16, color: '#ddd' },
  bottomBtnLabel: { fontSize: 10, color: '#aaa', fontWeight: '600' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 18, color: '#a0a0a0' },
  historyModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'flex-end' },
  historyModalContent: { backgroundColor: '#1a1a1a', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '75%', borderTopWidth: 2, borderTopColor: GOLD },
  historyModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#333' },
  historyModalTitle: { fontSize: 17, fontWeight: 'bold', color: GOLD },
  historyModalClose: { fontSize: 24, color: '#a0a0a0' },
  historyScroll: { paddingHorizontal: 16, paddingVertical: 10 },
  historyRoundItem: { backgroundColor: '#2a2a2a', borderRadius: 12, padding: 12, marginBottom: 10, borderLeftWidth: 3, borderLeftColor: GOLD },
  historyRoundNumber: { fontSize: 13, fontWeight: 'bold', color: GOLD, marginBottom: 8 },
  historyCardsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  historyCardSection: { flex: 1, alignItems: 'center' },
  historyCardLabel: { fontSize: 11, color: '#a0a0a0', marginBottom: 3 },
  historyCardName: { fontSize: 12, fontWeight: 'bold', color: '#eee', marginBottom: 3 },
  historyCardStats: { fontSize: 11, color: '#888' },
  historyVS: { marginHorizontal: 8 },
  historyVSText: { fontSize: 12, fontWeight: 'bold', color: GOLD },
  historyWinner: { fontSize: 12, fontWeight: 'bold', textAlign: 'center', marginTop: 6 },
});
