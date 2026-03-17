import React, { useMemo, useCallback, useState, useEffect } from 'react';
import {
  View, TouchableOpacity, StyleSheet,
  Platform, Alert, StatusBar,
} from 'react-native';
import { ThemedText as Text } from '@/components/ui/ThemedText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as ScreenOrientation from 'expo-screen-orientation';
import Animated from 'react-native-reanimated';

import { CardItem }           from '@/components/game/card-item';
import { ElementEffect }      from '@/components/game/element-effect';
import { LuxuryBackground }   from '@/components/game/luxury-background';
import { BattleHUD }          from '@/components/game/BattleHUD';
import { BattleResultOverlay } from '@/components/game/BattleResultOverlay';
import { RoundResultBanner }  from '@/components/game/RoundResultBanner';
import { useGame }            from '@/lib/game/game-context';
import { ELEMENT_EMOJI, ElementAdvantage } from '@/lib/game/types';
import { getAbilityNameAr }   from '@/lib/game/ability-names';
import { PredictionModal, PopularityModal, BattleHistoryModal } from '@/components/modals';
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
  useHistoryModal,
} from '@/lib/game/hooks';

// ─── Helper functions ────────────────────────────────────────────────────

const getAdvantageColor = (advantage: ElementAdvantage): string => {
  switch (advantage) {
    case 'strong': return '#4ade80';
    case 'weak':   return '#f87171';
    default:       return '#a0a0a0';
  }
};

const getAdvantageText = (advantage: ElementAdvantage): string => {
  switch (advantage) {
    case 'strong': return '\u2b06\ufe0f \u0642\u0648\u064a';
    case 'weak':   return '\u2b07\ufe0f \u0636\u0639\u064a\u0641';
    default:       return '';
  }
};

// ─── HistoryRow (شريط أفقي) ──────────────────────────────────────────────

import { ScrollView } from 'react-native';

const HistoryRow = ({ results, side }: { results: any[]; side: 'player' | 'bot' }) => {
  if (!results || results.length === 0) return null;
  return (
    <View style={styles.historyRow}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.historyRowContent}>
        {results.map((r: any) => {
          const won  = r.winner === side;
          const draw = r.winner === 'draw';
          const chipColor   = won ? 'rgba(74,222,128,0.2)'  : draw ? 'rgba(251,191,36,0.2)'  : 'rgba(248,113,113,0.2)';
          const borderColor = won ? '#4ade80' : draw ? '#fbbf24' : '#f87171';
          const icon     = won ? '\u2713' : draw ? '=' : '\u2717';
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

// ─── AbilityRow ───────────────────────────────────────────────────────────────────────

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

// ─── BottomBar ─────────────────────────────────────────────────────────────────────

const BottomBar = ({ onLog, onNext, onMenu, nextDisabled, isGameOver }: any) => (
  <View style={styles.bottomBar}>
    <TouchableOpacity style={styles.bottomBtn} onPress={onLog} activeOpacity={0.8}>
      <Text style={styles.bottomBtnIcon}>{'\uD83D\uDCCB'}</Text>
      <Text style={styles.bottomBtnLabel}>\u0627\u0644\u0633\u062c\u0644</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={[styles.bottomBtn, styles.bottomBtnPrimary, nextDisabled && styles.bottomBtnMuted]}
      onPress={onNext}
      disabled={nextDisabled}
      activeOpacity={0.8}
    >
      <Text style={[styles.bottomBtnIcon, !nextDisabled && { color: '#1a0d1a' }]}>
        {isGameOver ? '\uD83C\uDFC6' : '\u23ed\ufe0f'}
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

// ─── BattleScreen ─────────────────────────────────────────────────────────────────────

export default function BattleScreen() {
  const router = useRouter();
  const {
    state, playRound, isGameOver,
    currentPlayerCard, currentBotCard,
    lastRoundResult, useAbility,
  } = useGame();

  // ─ Hooks ─
  const animations = useBattleAnimations();

  const { phase, setPhase, showResult, showPlayerEffect, showBotEffect } = useBattlePhase({
    currentPlayerCard,
    currentBotCard,
    currentRound: state.currentRound,
    lastRoundResult,
    playRound,
    onPhaseShowing: () => { animations.resetAnimations(); animations.playEntranceAnimation(); },
    onPhaseFighting: () => {},
    onFightDone:    () => {},
  });

  useEffect(() => { if (showResult) animations.playResultAnimation(); }, [showResult]);

  const abilities = useBattleAbilities();
  const history   = useHistoryModal();

  // ─ State محلي ─
  const [showEndOverlay, setShowEndOverlay] = useState(false);

  useEffect(() => {
    if (isGameOver && phase === 'waiting') setShowEndOverlay(true);
  }, [isGameOver, phase]);

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    return () => { ScreenOrientation.unlockAsync(); };
  }, []);

  // ─ Derived ─
  const roundNumber = state.currentRound + 1;
  const upcomingRounds = useMemo(() => getUpcomingPredictionRounds(roundNumber, state.totalRounds), [roundNumber, state.totalRounds]);
  const remainingRounds = useMemo(() => getRemainingRounds(roundNumber, state.totalRounds), [roundNumber, state.totalRounds]);
  const predictionComplete = useMemo(
    () => isPredictionComplete(upcomingRounds, abilities.predictionSelections),
    [upcomingRounds, abilities.predictionSelections]
  );
  const isPopularityReady  = abilities.selectedPopularityRound !== null;
  const predictionSummary  = useMemo(() => buildPredictionSummary(state.activeEffects, 'player'), [state.activeEffects]);
  const displayPlayerCard  = showResult && lastRoundResult ? lastRoundResult.playerCard : currentPlayerCard;
  const displayBotCard     = showResult && lastRoundResult ? lastRoundResult.botCard    : currentBotCard;

  const handleNextRound = useCallback(() => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    isGameOver ? router.push('/screens/battle-results' as any) : setPhase('showing');
  }, [isGameOver, router, setPhase]);

  // ─ Winner logic ─
  const endWinner = isGameOver
    ? state.playerScore > state.botScore ? 'player'
    : state.botScore > state.playerScore ? 'bot'
    : 'draw'
    : null;

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

      <BattleHUD
        playerScore={state.playerScore}
        botScore={state.botScore}
        maxScore={state.totalRounds}
        currentRound={state.currentRound}
        totalRounds={state.totalRounds}
      />

      {predictionSummary ? (
        <View style={styles.predictionStrip}>
          <Text style={styles.predictionStripText}>{predictionSummary}</Text>
        </View>
      ) : null}

      <View style={styles.arenaSplit}>

        {/* Player side */}
        <View style={styles.playerArena}>
          <HistoryRow results={state.roundResults} side="player" />
          <View style={styles.cardWrapper}>
            <Animated.View style={animations.playerCardAnimatedStyle}>
              <CardItem card={displayPlayerCard} size="large" />
              {showPlayerEffect && <ElementEffect element={displayPlayerCard.element} isActive />}
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
              {showBotEffect && <ElementEffect element={displayBotCard.element} isActive />}
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
          <RoundResultBanner lastRoundResult={lastRoundResult} visible={showResult} />
        </View>

      </View>

      <BottomBar
        onLog={history.openHistoryModal}
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

      <BattleHistoryModal
        visible={history.showHistoryModal}
        roundResults={state.roundResults}
        onClose={history.closeHistoryModal}
      />

      <BattleResultOverlay
        visible={showEndOverlay}
        winner={endWinner as any}
        playerScore={state.playerScore}
        botScore={state.botScore}
        onHome={()      => { setShowEndOverlay(false); router.back(); }}
        onPlayAgain={() => { setShowEndOverlay(false); router.replace('/battle' as any); }}
      />

    </SafeAreaView>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────────────────

const GOLD     = '#e4a52a';
const GOLD_DIM = 'rgba(228,165,42,0.3)';
const BG_DARK  = '#1a0d1a';

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG_DARK, flexDirection: 'column' },
  frameBorderTop:    { position: 'absolute', top: 0,    left: 0, right: 0, height: 2, backgroundColor: GOLD },
  frameBorderBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, backgroundColor: GOLD },
  frameBorderLeft:   { position: 'absolute', top: 0, bottom: 0, left: 0,  width: 2,  backgroundColor: GOLD },
  frameBorderRight:  { position: 'absolute', top: 0, bottom: 0, right: 0, width: 2,  backgroundColor: GOLD },
  predictionStrip: {
    alignSelf: 'center',
    backgroundColor: 'rgba(251,191,36,0.15)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 3,
    marginVertical: 2,
  },
  predictionStripText: { fontSize: 10, color: '#fbbf24', fontWeight: '700' },
  arenaSplit:   { flex: 1, flexDirection: 'row', paddingHorizontal: 8, paddingVertical: 6 },
  playerArena:  { flex: 1, paddingRight: 6, alignItems: 'center', justifyContent: 'space-between', gap: 4 },
  botArena:     { flex: 1, paddingLeft: 6,  alignItems: 'center', justifyContent: 'space-between', gap: 4 },
  arenaDivider: { width: 1, alignSelf: 'stretch', backgroundColor: GOLD_DIM, marginVertical: 4 },
  cardWrapper:  { flex: 1, alignItems: 'center', justifyContent: 'center' },
  damageInfo:   { alignItems: 'center', marginTop: 6, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4 },
  damageText:   { fontSize: 12, color: '#e94560', fontWeight: 'bold' },
  advantageText:{ fontSize: 11, fontWeight: 'bold', marginTop: 2 },
  historyRow:        { width: '100%', height: 36 },
  historyRowContent: { alignItems: 'center', gap: 6, paddingHorizontal: 4 },
  historyChip:       { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3, gap: 4, maxWidth: 110 },
  historyChipIcon:   { fontSize: 11, fontWeight: '800' },
  historyChipName:   { fontSize: 9, color: '#eee', fontWeight: '600', flex: 1 },
  historyChipRound:  { fontSize: 9, color: '#888' },
  abilitiesRow:      { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6, paddingVertical: 4, paddingHorizontal: 4 },
  abilityBtn:        { backgroundColor: GOLD, paddingVertical: 7, paddingHorizontal: 10, borderRadius: 16, alignItems: 'center', justifyContent: 'center', minWidth: 80, maxWidth: 110, shadowColor: GOLD, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 4, elevation: 4 },
  abilityBtnDisabled:{ backgroundColor: '#444', opacity: 0.5, shadowOpacity: 0 },
  abilityBtnText:    { fontSize: 10, fontWeight: '700', color: '#1a0d1a', textAlign: 'center' },
  bottomBar:         { height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly', paddingHorizontal: 12, backgroundColor: 'rgba(20,10,20,0.98)', borderTopWidth: 1, borderTopColor: GOLD_DIM, gap: 8 },
  bottomBtn:         { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 6, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', gap: 2 },
  bottomBtnPrimary:  { backgroundColor: GOLD, borderColor: GOLD, shadowColor: GOLD, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.6, shadowRadius: 6, elevation: 6 },
  bottomBtnMuted:    { opacity: 0.4 },
  bottomBtnIcon:     { fontSize: 16, color: '#ddd' },
  bottomBtnLabel:    { fontSize: 10, color: '#aaa', fontWeight: '600' },
  loadingContainer:  { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText:       { fontSize: 18, color: '#a0a0a0' },
});
