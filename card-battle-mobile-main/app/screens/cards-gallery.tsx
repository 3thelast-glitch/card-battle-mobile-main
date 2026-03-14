import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView, Modal } from 'react-native';
import { ThemedText as Text } from '@/components/ui/ThemedText';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { LuxuryBackground } from '@/components/game/luxury-background';
import { LuxuryCharacterCardAnimated } from '@/components/game/luxury-character-card-animated';
import { RotateHintScreen } from '@/components/game/RotateHintScreen';
import { ALL_CARDS } from '@/lib/game/cards-data';
import { Card, ELEMENT_COLORS, ELEMENT_EMOJI } from '@/lib/game/types';
import { getRarityConfig } from '@/lib/game/card-rarity';
import { useLandscapeLayout, CARD_SCALE, LAYOUT_PADDING } from '@/utils/layout';
import { ArrowLeft } from 'lucide-react-native';

export default function CardsGalleryScreen() {
    const router = useRouter();
    const [selectedCard, setSelectedCard] = useState<Card | null>(null);
    const { isLandscape, size } = useLandscapeLayout();
    const [activeFilter, setActiveFilter] = useState('All');

    const cardScale = CARD_SCALE[size];
    const padding = LAYOUT_PADDING[size];
    const gridGap = size === 'sm' ? 10 : size === 'md' ? 14 : size === 'lg' ? 18 : 22;

    const handleCardPress = (card: Card) => {
        setSelectedCard(card);
    };

    if (!isLandscape) {
        return <RotateHintScreen />;
    }

    const filteredCards = ALL_CARDS.filter(card => {
        if (activeFilter === 'All') return true;
        const rarityMapping: Record<string, string> = {
            'common': 'Common',
            'rare': 'Rare',
            'epic': 'ملحمية',
            'legendary': 'أسطورية'
        };
        const cardRarityId = (card.rarity ?? 'common').toLowerCase();
        if (cardRarityId === activeFilter.toLowerCase()) return true;
        if (rarityMapping[cardRarityId] === activeFilter) return true;
        return false;
    });

    const sortedCards = [...filteredCards].sort((a, b) => {
        const rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };
        const ra = rarityOrder[a.rarity ?? 'common'];
        const rb = rarityOrder[b.rarity ?? 'common'];
        if (ra !== rb) return ra - rb;
        return a.race.localeCompare(b.race);
    });

    const FILTER_TABS = [
        { label: 'All', activeClasses: 'border-orange-500 text-orange-500 bg-orange-500/10' },
        { label: 'Common', activeClasses: 'border-emerald-500 text-emerald-500 bg-emerald-500/10' },
        { label: 'Rare', activeClasses: 'border-blue-500 text-blue-500 bg-blue-500/10' },
        { label: 'ملحمية', activeClasses: 'border-purple-500 text-purple-500 bg-purple-500/10' },
        { label: 'أسطورية', activeClasses: 'border-amber-500 text-amber-500 bg-amber-500/10' },
    ];

    return (
        <ScreenContainer edges={['top', 'bottom', 'left', 'right']}>
            <View style={styles.backgroundWrapper}>
                <LuxuryBackground />
            </View>

            <TouchableOpacity
                onPress={() => router.back()}
                className="absolute top-6 left-6 z-50 flex-row items-center justify-center gap-2 px-4 py-2 bg-slate-800/80 hover:bg-slate-700 backdrop-blur-md rounded-xl border border-white/10 transition-all cursor-pointer"
                activeOpacity={0.7}
            >
                <ArrowLeft size={16} color="#fff" />
                <Text className="text-white text-sm font-bold">رجوع</Text>
            </TouchableOpacity>

            <View style={styles.container} className="pt-4 pb-2">
                <View style={styles.titleContainer} className="mb-2 mt-4 flex-col gap-1 items-center justify-center">
                    <Text style={styles.title}>Card Collection</Text>
                    <Text style={styles.subtitle}>{filteredCards.length} cards</Text>
                </View>

                <View className="flex-row flex-wrap justify-center gap-2 mb-4 px-4 mt-2">
                    {FILTER_TABS.map((tab) => {
                        const isActive = activeFilter === tab.label;
                        const baseClasses = "px-4 py-1.5 rounded-full border border-white/10 bg-[#0f172a]/80 backdrop-blur-sm transition-all duration-300 cursor-pointer";
                        const textBaseClasses = "text-sm font-bold text-gray-400";
                        return (
                            <TouchableOpacity
                                key={tab.label}
                                onPress={() => setActiveFilter(tab.label)}
                                className={`${baseClasses} ${isActive ? tab.activeClasses.split(' ').slice(0, 3).join(' ') : ''}`}
                                activeOpacity={0.7}
                            >
                                <Text className={`${textBaseClasses} ${isActive ? tab.activeClasses.split(' ')[1] : ''}`}>
                                    {tab.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <ScrollView
                    style={styles.scrollContainer}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={[styles.gridContainer, { gap: gridGap, paddingHorizontal: padding }]}>
                        {sortedCards.map((card) => (
                            <TouchableOpacity
                                key={card.id}
                                onPress={() => handleCardPress(card)}
                                activeOpacity={0.85}
                            >
                                <LuxuryCharacterCardAnimated
                                    card={card}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            </View>

            {/* Card Details Modal */}
            <Modal
                visible={!!selectedCard}
                animationType="fade"
                transparent
                onRequestClose={() => setSelectedCard(null)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setSelectedCard(null)}
                >
                    {selectedCard && (
                        <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
                            {/* Full-size Card Preview */}
                            <LuxuryCharacterCardAnimated
                                card={selectedCard}
                                style={{ width: 260, height: 380 }}
                            />

                            {/* Info Panel */}
                            <View
                                style={[
                                    styles.modalDetails,
                                    { borderColor: ELEMENT_COLORS[selectedCard.element] ?? '#d4af37' },
                                ]}
                            >
                                <Text style={styles.modalTitle}>{selectedCard.nameAr || selectedCard.name}</Text>
                                <Text style={styles.modalEnName}>{selectedCard.name}</Text>

                                <View style={styles.metaRow}>
                                    <View style={styles.metaChip}>
                                        <Text style={styles.metaChipText}>{selectedCard.race}</Text>
                                    </View>
                                    <View style={styles.metaChip}>
                                        <Text style={styles.metaChipText}>{selectedCard.cardClass}</Text>
                                    </View>
                                    <View style={[styles.metaChip, { backgroundColor: (ELEMENT_COLORS[selectedCard.element] ?? '#888') + '33' }]}>
                                        <Text style={styles.metaChipText}>
                                            {ELEMENT_EMOJI[selectedCard.element]} {selectedCard.element}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.statsGrid}>
                                    <StatDetailItem icon="⚔️" label="Attack" value={selectedCard.attack} />
                                    <StatDetailItem icon="🛡️" label="Defense" value={selectedCard.defense} />
                                </View>

                                <View style={styles.rarityRow}>
                                    <View style={[styles.rarityBadge, { backgroundColor: getRarityConfig(selectedCard.rarity).badgeColor }]}>
                                        <Text style={styles.rarityBadgeText}>
                                            {getRarityConfig(selectedCard.rarity).label}
                                        </Text>
                                    </View>
                                </View>

                                <TouchableOpacity
                                    style={styles.modalCloseBtn}
                                    onPress={() => setSelectedCard(null)}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.modalCloseBtnText}>إغلاق</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </TouchableOpacity>
            </Modal>
        </ScreenContainer>
    );
}

function StatDetailItem({ icon, label, value }: { icon: string; label: string; value: number }) {
    return (
        <View style={styles.statDetailItem}>
            <Text style={styles.statDetailIcon}>{icon}</Text>
            <Text style={styles.statDetailValue}>{value}</Text>
            <Text style={styles.statDetailLabel}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    backgroundWrapper: {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0,
    },
    container: {
        flex: 1, zIndex: 1, alignItems: 'center', width: '100%',
    },
    titleContainer: { alignItems: 'center' },
    title: {
        fontSize: 32, fontWeight: 'bold', color: '#d4af37', textAlign: 'center', flexWrap: 'wrap',
    },
    subtitle: {
        fontSize: 13, color: '#a0a0a0', marginTop: 4, textAlign: 'center', flexWrap: 'wrap',
    },
    scrollContainer: { flex: 1, width: '100%' },
    scrollContent: { alignItems: 'center', paddingBottom: 20 },
    gridContainer: {
        flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center',
        gap: 14, maxWidth: 1100, paddingHorizontal: 12,
    },
    modalOverlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center', alignItems: 'center',
    },
    modalContent: {
        flexDirection: 'row', alignItems: 'center', gap: 24,
    },
    modalDetails: {
        backgroundColor: 'rgba(20, 20, 25, 0.97)',
        padding: 20, borderRadius: 20, borderWidth: 1.5,
        alignItems: 'center', width: 280,
    },
    modalTitle: {
        fontSize: 22, fontWeight: 'bold', color: '#f0e6d2', marginBottom: 2,
    },
    modalEnName: { fontSize: 13, color: '#888', marginBottom: 12 },
    metaRow: {
        flexDirection: 'row', gap: 8, marginBottom: 16,
        flexWrap: 'wrap', justifyContent: 'center',
    },
    metaChip: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
    },
    metaChipText: { fontSize: 11, color: '#ccc', fontWeight: '600', textTransform: 'capitalize' },
    statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 16 },
    statDetailItem: {
        alignItems: 'center', gap: 2,
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12,
    },
    statDetailIcon: { fontSize: 16 },
    statDetailValue: { fontSize: 18, fontWeight: '800', color: '#fff' },
    statDetailLabel: { fontSize: 9, color: '#888', fontWeight: '600', textTransform: 'uppercase' },
    rarityRow: { marginBottom: 16 },
    rarityBadge: { paddingHorizontal: 16, paddingVertical: 5, borderRadius: 14 },
    rarityBadgeText: { fontSize: 12, fontWeight: '700', color: '#fff' },
    modalCloseBtn: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 28, paddingVertical: 10, borderRadius: 20,
    },
    modalCloseBtnText: { fontSize: 14, fontWeight: 'bold', color: '#d4af37' },
});
