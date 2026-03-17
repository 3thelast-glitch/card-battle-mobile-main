import { useState, useCallback } from 'react';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { AbilityType } from '@/lib/game/types';

type PredictionAbilityType = 'LogicalEncounter' | 'Eclipse' | 'Trap' | 'Pool';
type PopularityAbilityType = 'Popularity' | 'Rescue' | 'Penetration';

export interface UseBattleAbilitiesReturn {
  // Prediction Modal
  showPredictionModal: boolean;
  predictionSelections: Record<number, 'win' | 'loss'>;
  predictionAbilityType: PredictionAbilityType;
  openPredictionModal: (type: PredictionAbilityType) => void;
  closePredictionModal: () => void;
  handleSelectPrediction: (round: number, outcome: 'win' | 'loss') => void;
  handleConfirmPrediction: (useAbility: (type: AbilityType, payload?: any) => void) => void;

  // Popularity Modal
  showPopularityModal: boolean;
  selectedPopularityRound: number | null;
  popularityAbilityType: PopularityAbilityType;
  openPopularityModal: (type: PopularityAbilityType) => void;
  closePopularityModal: () => void;
  handleSelectPopularityRound: (round: number) => void;
  handleConfirmPopularity: (useAbility: (type: AbilityType, payload?: any) => void) => void;
}

export function useBattleAbilities(): UseBattleAbilitiesReturn {
  // ─ Prediction state ─
  const [showPredictionModal, setShowPredictionModal] = useState(false);
  const [predictionSelections, setPredictionSelections] = useState<Record<number, 'win' | 'loss'>>({});
  const [predictionAbilityType, setPredictionAbilityType] = useState<PredictionAbilityType>('LogicalEncounter');

  // ─ Popularity state ─
  const [showPopularityModal, setShowPopularityModal] = useState(false);
  const [selectedPopularityRound, setSelectedPopularityRound] = useState<number | null>(null);
  const [popularityAbilityType, setPopularityAbilityType] = useState<PopularityAbilityType>('Popularity');

  // ─ Prediction handlers ─
  const openPredictionModal = useCallback((type: PredictionAbilityType) => {
    setPredictionSelections({});
    setPredictionAbilityType(type);
    setShowPredictionModal(true);
  }, []);

  const closePredictionModal = useCallback(() => {
    setShowPredictionModal(false);
    setPredictionSelections({});
  }, []);

  const handleSelectPrediction = useCallback((round: number, outcome: 'win' | 'loss') => {
    setPredictionSelections(prev => ({ ...prev, [round]: outcome }));
  }, []);

  const handleConfirmPrediction = useCallback(
    (useAbility: (type: AbilityType, payload?: any) => void) => {
      useAbility(predictionAbilityType, { predictions: predictionSelections });
      setShowPredictionModal(false);
      setPredictionSelections({});
      if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
    [predictionAbilityType, predictionSelections]
  );

  // ─ Popularity handlers ─
  const openPopularityModal = useCallback((type: PopularityAbilityType) => {
    setSelectedPopularityRound(null);
    setPopularityAbilityType(type);
    setShowPopularityModal(true);
  }, []);

  const closePopularityModal = useCallback(() => {
    setShowPopularityModal(false);
    setSelectedPopularityRound(null);
  }, []);

  const handleSelectPopularityRound = useCallback((round: number) => {
    setSelectedPopularityRound(round);
  }, []);

  const handleConfirmPopularity = useCallback(
    (useAbility: (type: AbilityType, payload?: any) => void) => {
      if (selectedPopularityRound === null) return;
      useAbility(popularityAbilityType, { round: selectedPopularityRound });
      setShowPopularityModal(false);
      setSelectedPopularityRound(null);
      if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
    [popularityAbilityType, selectedPopularityRound]
  );

  return {
    showPredictionModal,
    predictionSelections,
    predictionAbilityType,
    openPredictionModal,
    closePredictionModal,
    handleSelectPrediction,
    handleConfirmPrediction,
    showPopularityModal,
    selectedPopularityRound,
    popularityAbilityType,
    openPopularityModal,
    closePopularityModal,
    handleSelectPopularityRound,
    handleConfirmPopularity,
  };
}
