/**
 * LuxuryCharacterCardAnimated — Elven Luxury style
 * Clean professional design inspired by card-battle-card-maker elven-luxury template
 * Features:
 * - Full-bleed art image
 * - Foil sweep (Epic & Legendary)
 * - Slow-rotating runic ring behind stat badges (Epic & Legendary)
 * - Breathing golden border pulse (Legendary only)
 * - Elven SVG corner filigree (Rare, Epic, Legendary)
 * - Only Attack + Defense stats — no description box, no clutter
 */
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
    interpolate,
    Easing,
} from 'react-native-reanimated';
import { Svg, Circle, Line, Polygon, Ellipse } from 'react-native-svg';
import { Card, CardRarity } from '@/lib/game/types';

interface LuxuryCharacterCardAnimatedProps {
    card: Card;
    style?: ViewStyle;
}

const RARITY_THEMES = {
    common: {
        label: 'عادي',
        color: '#9CA3AF',
        borderColor: '#6B7280',
        borderWidth: 1,
        shadowColor: '#6B7280',
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 4,
        hasFoil: false,
        hasRunicRing: false,
        hasFiligree: false,
        hasPulse: false,
        foilDuration: 0,
        atkColor: '#9CA3AF',
        defColor: '#9CA3AF',
    },
    rare: {
        label: 'نادر',
        color: '#CD7F32',
        borderColor: '#CD7F32',
        borderWidth: 1.5,
        shadowColor: '#CD7F32',
        shadowOpacity: 0.35,
        shadowRadius: 10,
        elevation: 6,
        hasFoil: false,
        hasRunicRing: false,
        hasFiligree: true,
        hasPulse: false,
        foilDuration: 0,
        atkColor: '#D97706',
        defColor: '#92C5FD',
    },
    epic: {
        label: 'ملحمي',
        color: '#A855F7',
        borderColor: '#A855F7',
        borderWidth: 2,
        shadowColor: '#A855F7',
        shadowOpacity: 0.55,
        shadowRadius: 16,
        elevation: 8,
        hasFoil: true,
        hasRunicRing: true,
        hasFiligree: true,
        hasPulse: false,
        foilDuration: 3200,
        atkColor: '#F0ABFC',
        defColor: '#93C5FD',
    },
    legendary: {
        label: 'أسطوري',
        color: '#FFD700',
        borderColor: '#FFD700',
        borderWidth: 2,
        shadowColor: '#FFD700',
        shadowOpacity: 0.8,
        shadowRadius: 22,
        elevation: 10,
        hasFoil: true,
        hasRunicRing: true,
        hasFiligree: true,
        hasPulse: true,
        foilDuration: 2400,
        atkColor: '#FDE68A',
        defColor: '#BAE6FD',
    },
} as const;

// ─── Runic Ring ───────────────────────────────────────────────────────────────
const RunicRing = ({ color, size = 64, reverse = false }: { color: string; size?: number; reverse?: boolean }) => {
    const rotation = useSharedValue(0);
    useEffect(() => {
        rotation.value = withRepeat(
            withTiming(reverse ? -360 : 360, { duration: 10000, easing: Easing.linear }),
            -1, false
        );
    }, []);
    const animStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotation.value}deg` }],
    }));
    const spokes = Array.from({ length: 8 }).map((_, i) => {
        const a = (i * 45) * Math.PI / 180;
        return (
            <Line key={i}
                x1={50 + 28 * Math.cos(a)} y1={50 + 28 * Math.sin(a)}
                x2={50 + 44 * Math.cos(a)} y2={50 + 44 * Math.sin(a)}
                stroke={color} strokeWidth={0.7} opacity={0.6}
            />
        );
    });
    const gems = [0, 90, 180, 270].map((deg, i) => {
        const r = deg * Math.PI / 180;
        const cx = 50 + 46 * Math.cos(r), cy = 50 + 46 * Math.sin(r), d = 3;
        return <Polygon key={i} points={`${cx},${cy - d} ${cx + d},${cy} ${cx},${cy + d} ${cx - d},${cy}`} fill={color} opacity={0.9} />;
    });
    return (
        <Animated.View style={[{ width: size, height: size }, animStyle]} pointerEvents="none">
            <Svg width={size} height={size} viewBox="0 0 100 100">
                <Circle cx={50} cy={50} r={46} stroke={color} strokeWidth={0.8} strokeDasharray="4 3" fill="none" opacity={0.5} />
                <Circle cx={50} cy={50} r={36} stroke={color} strokeWidth={0.5} fill="none" opacity={0.4} />
                <Circle cx={50} cy={50} r={26} stroke={color} strokeWidth={0.8} strokeDasharray="3 4" fill="none" opacity={0.35} />
                {spokes}
                {gems}
                <Circle cx={50} cy={50} r={2} fill={color} opacity={0.8} />
            </Svg>
        </Animated.View>
    );
};

// ─── Elven Corner Filigree ────────────────────────────────────────────────────
const ElvenCorner = ({ position, color }: { position: 'tl' | 'tr' | 'bl' | 'br'; color: string }) => {
    const rot = position === 'tl' ? 0 : position === 'tr' ? 90 : position === 'bl' ? -90 : 180;
    const posStyle: ViewStyle =
        position === 'tl' ? { top: 2, left: 2 } :
        position === 'tr' ? { top: 2, right: 2 } :
        position === 'bl' ? { bottom: 2, left: 2 } :
        { bottom: 2, right: 2 };
    const spokes = Array.from({ length: 8 }).map((_, i) => {
        const a = (i * 45) * Math.PI / 180;
        return (
            <Line key={i}
                x1={14 + 5 * Math.cos(a)} y1={14 + 5 * Math.sin(a)}
                x2={14 + 10 * Math.cos(a)} y2={14 + 10 * Math.sin(a)}
                stroke={color} strokeWidth={0.6} opacity={0.7}
            />
        );
    });
    return (
        <View style={[styles.filigreeCorner, posStyle]} pointerEvents="none">
            <Svg width={40} height={40} viewBox="0 0 80 80" style={{ transform: [{ rotate: `${rot}deg` }] }}>
                <Line x1={10} y1={14} x2={60} y2={12} stroke={color} strokeWidth={1.2} opacity={0.85} />
                <Line x1={14} y1={10} x2={12} y2={60} stroke={color} strokeWidth={1.2} opacity={0.85} />
                {[32, 42, 52].map((x, i) => <Ellipse key={`hx${i}`} cx={x} cy={11} rx={3} ry={1.5} fill={color} opacity={0.55} />)}
                {[32, 42, 52].map((y, i) => <Ellipse key={`vy${i}`} cx={11} cy={y} rx={1.5} ry={3} fill={color} opacity={0.55} />)}
                <Circle cx={14} cy={14} r={7} stroke={color} strokeWidth={1} fill="none" opacity={0.8} />
                <Circle cx={14} cy={14} r={4} fill={color} opacity={0.9} />
                {spokes}
                <Circle cx={12.5} cy={12.5} r={1} fill="#fff" opacity={0.7} />
                {[20, 28, 36, 44].map((x, i) => <Circle key={`chi${i}`} cx={x} cy={13} r={0.8} fill={color} opacity={0.5} />)}
                {[20, 28, 36, 44].map((y, i) => <Circle key={`cvi${i}`} cx={13} cy={y} r={0.8} fill={color} opacity={0.5} />)}
            </Svg>
        </View>
    );
};

// ─── Breathing Border (Legendary) ────────────────────────────────────────────
const BreathingBorder = () => {
    const pulse = useSharedValue(0);
    useEffect(() => {
        pulse.value = withRepeat(withTiming(1, { duration: 2800, easing: Easing.inOut(Easing.quad) }), -1, true);
    }, []);
    const animStyle = useAnimatedStyle(() => ({
        opacity: interpolate(pulse.value, [0, 1], [0.45, 1]),
        shadowOpacity: interpolate(pulse.value, [0, 1], [0.3, 0.95]),
        shadowRadius: interpolate(pulse.value, [0, 1], [8, 30]),
        transform: [{ scale: interpolate(pulse.value, [0, 1], [0.997, 1.005]) }],
    }));
    return (
        <Animated.View style={[styles.breathingBorder, animStyle]} pointerEvents="none" />
    );
};

// ─── Glow Ring (Epic / Legendary) ────────────────────────────────────────────
const GlowRing = ({ color }: { color: string }) => {
    const opacity = useSharedValue(0.4);
    useEffect(() => {
        opacity.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 1800 }),
                withTiming(0.4, { duration: 1800 }),
            ), -1, false
        );
    }, []);
    const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
    return (
        <Animated.View style={[styles.glowRing, { borderColor: color, shadowColor: color }, animStyle]} pointerEvents="none" />
    );
};

// ─── Resolve image source ─────────────────────────────────────────────────────
function resolveSource(src: any) {
    if (!src) return null;
    if (typeof src === 'string') return { uri: src };
    if (typeof src === 'number') return src;
    if (typeof src === 'object' && src.uri) return src;
    return src;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function LuxuryCharacterCardAnimated({ card, style }: LuxuryCharacterCardAnimatedProps) {
    const rarity: CardRarity = card.rarity ?? 'common';
    const theme = RARITY_THEMES[rarity];

    const foilPos = useSharedValue(-120);
    useEffect(() => {
        if (theme.hasFoil) {
            foilPos.value = withRepeat(
                withTiming(320, { duration: theme.foilDuration, easing: Easing.linear }),
                -1, false
            );
        }
    }, [rarity]);
    const foilStyle = useAnimatedStyle(() => ({ transform: [{ translateX: foilPos.value }] }));

    const imgSource = resolveSource(card.finalImage);

    return (
        <Animated.View
            style={[
                styles.cardContainer,
                {
                    borderColor: theme.borderColor,
                    borderWidth: theme.borderWidth,
                    shadowColor: theme.shadowColor,
                    shadowOpacity: theme.shadowOpacity,
                    shadowRadius: theme.shadowRadius,
                    elevation: theme.elevation,
                },
                style,
            ]}
        >
            {theme.hasPulse && <BreathingBorder />}
            {(rarity === 'epic' || rarity === 'legendary') && <GlowRing color={theme.color} />}

            <View style={styles.cardInner}>
                {imgSource && (
                    <Image source={imgSource} style={styles.bgImage} resizeMode="cover" />
                )}

                <View style={styles.contentLayer}>
                    {/* Foil sweep */}
                    {theme.hasFoil && (
                        <View style={styles.foilContainer} pointerEvents="none">
                            <Animated.View style={[styles.foilStrip, foilStyle]}>
                                <LinearGradient
                                    colors={['transparent', 'rgba(255,255,255,0.08)', 'rgba(180,120,255,0.22)', 'rgba(255,220,80,0.18)', 'transparent']}
                                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                                    style={styles.foilGradient}
                                />
                            </Animated.View>
                        </View>
                    )}

                    {/* Inner border */}
                    <View style={[styles.innerBorder, { borderColor: theme.borderColor + '55' }]} pointerEvents="none" />

                    {/* Bottom dark gradient */}
                    <LinearGradient
                        colors={['transparent', 'transparent', 'rgba(0,0,0,0.65)', 'rgba(0,0,0,0.92)']}
                        style={styles.gradientOverlay}
                        start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                        pointerEvents="none"
                    />

                    {/* Elven corners */}
                    {theme.hasFiligree && (
                        <>
                            <ElvenCorner position="tl" color={theme.color} />
                            <ElvenCorner position="tr" color={theme.color} />
                            {theme.hasPulse && <ElvenCorner position="bl" color={theme.color} />}
                            {theme.hasPulse && <ElvenCorner position="br" color={theme.color} />}
                        </>
                    )}

                    {/* Rarity badge */}
                    <View style={[styles.rarityBadge, { borderColor: theme.color + 'AA' }]}>
                        <Text style={[styles.rarityBadgeText, { color: theme.color }]}>
                            {theme.label} ✦
                        </Text>
                    </View>

                    {/* Card name */}
                    <View style={styles.nameContainer}>
                        <Text style={[styles.cardName, { textShadowColor: theme.color }]} numberOfLines={1}>
                            {card.nameAr || card.name}
                        </Text>
                    </View>

                    {/* Stats row */}
                    <View style={styles.statsRow}>
                        {/* ⚔️ Attack */}
                        <View style={styles.statWrapper}>
                            {theme.hasRunicRing && (
                                <View style={styles.ringWrapper}>
                                    <RunicRing color={theme.color} size={64} />
                                    <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
                                        <RunicRing color={theme.color} size={48} reverse />
                                    </View>
                                </View>
                            )}
                            <View style={[styles.statBadge, { borderColor: theme.color, shadowColor: theme.color }]}>
                                <LinearGradient
                                    colors={['rgba(0,0,0,0.82)', 'rgba(20,18,30,0.95)']}
                                    style={styles.badgeGradient}
                                >
                                    <Text style={styles.statIcon}>⚔️</Text>
                                    <Text style={[styles.statValue, { color: theme.atkColor }]}>{card.attack}</Text>
                                </LinearGradient>
                            </View>
                        </View>

                        {/* 🛡️ Defense */}
                        <View style={styles.statWrapper}>
                            {theme.hasRunicRing && (
                                <View style={styles.ringWrapper}>
                                    <RunicRing color={theme.color} size={64} reverse />
                                    <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
                                        <RunicRing color={theme.color} size={48} />
                                    </View>
                                </View>
                            )}
                            <View style={[styles.statBadge, { borderColor: theme.color, shadowColor: theme.color }]}>
                                <LinearGradient
                                    colors={['rgba(0,0,0,0.82)', 'rgba(20,18,30,0.95)']}
                                    style={styles.badgeGradient}
                                >
                                    <Text style={styles.statIcon}>🛡️</Text>
                                    <Text style={[styles.statValue, { color: theme.defColor }]}>{card.defense}</Text>
                                </LinearGradient>
                            </View>
                        </View>
                    </View>

                </View>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    cardContainer: {
        width: 220,
        height: 320,
        borderRadius: 14,
        backgroundColor: '#0a0a0e',
        shadowOffset: { width: 0, height: 0 },
    },
    cardInner: {
        flex: 1,
        borderRadius: 12,
        overflow: 'hidden',
    },
    bgImage: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        width: '100%',
        height: '100%',
    },
    contentLayer: {
        flex: 1,
        position: 'relative',
    },
    breathingBorder: {
        position: 'absolute',
        top: -5, left: -5, right: -5, bottom: -5,
        borderRadius: 18,
        borderWidth: 2,
        borderColor: '#FFD700',
        shadowOffset: { width: 0, height: 0 },
        zIndex: 20,
    },
    glowRing: {
        position: 'absolute',
        top: -3, left: -3, right: -3, bottom: -3,
        borderRadius: 16,
        borderWidth: 1.5,
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 14,
        zIndex: 19,
    },
    foilContainer: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 1,
        overflow: 'hidden',
    },
    foilStrip: {
        position: 'absolute',
        top: 0, bottom: 0,
        width: 80,
    },
    foilGradient: {
        flex: 1,
        transform: [{ rotate: '-45deg' }],
    },
    innerBorder: {
        position: 'absolute',
        top: 5, left: 5, right: 5, bottom: 5,
        borderRadius: 9,
        borderWidth: 1,
        zIndex: 5,
    },
    gradientOverlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 2,
    },
    filigreeCorner: {
        position: 'absolute',
        width: 40,
        height: 40,
        zIndex: 6,
        opacity: 0.9,
    },
    rarityBadge: {
        position: 'absolute',
        top: 9,
        left: 9,
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 7,
        borderWidth: 1,
        backgroundColor: 'rgba(0,0,0,0.65)',
        zIndex: 10,
    },
    rarityBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    nameContainer: {
        position: 'absolute',
        bottom: 56,
        left: 0,
        right: 0,
        alignItems: 'center',
        paddingHorizontal: 12,
        zIndex: 8,
    },
    cardName: {
        fontSize: 17,
        fontWeight: '800',
        color: '#FFFFFF',
        textAlign: 'center',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 8,
        letterSpacing: 0.3,
    },
    statsRow: {
        position: 'absolute',
        bottom: 8,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        zIndex: 10,
    },
    statWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    ringWrapper: {
        position: 'absolute',
        width: 64,
        height: 64,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 0,
    },
    statBadge: {
        width: 46,
        height: 46,
        borderRadius: 23,
        borderWidth: 1.5,
        overflow: 'hidden',
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 10,
        elevation: 6,
        zIndex: 1,
    },
    badgeGradient: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statIcon: {
        fontSize: 12,
        marginBottom: 1,
    },
    statValue: {
        fontSize: 13,
        fontWeight: 'bold',
    },
});
