/**
 * LuxuryCharacterCardAnimated — Premium card with high-end animated ornaments and VFX
 * Features:
 * - Holo-Foil sweep animation (Epic & Legendary)
 * - Rotating magic circles behind stat orbs (Epic & Legendary)
 * - Breathing aura/pulsing border (Legendary only)
 * - Static SVG filigree corners (Epic & Legendary)
 * - Dynamic rarity colors and effects
 */
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import { Svg, Circle, Path, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { Card, CardRarity } from '@/lib/game/types';

interface LuxuryCharacterCardAnimatedProps {
    card: Card;
    style?: ViewStyle;
}

// Rarity theme configuration with visual effects
const RARITY_THEMES = {
    common: {
        label: 'عادي',
        color: '#9CA3AF',
        borderColor: '#6B7280',
        badgeBg: 'rgba(20, 20, 20, 0.9)',
        badgeBorder: '#6B7280',
        badgeText: '#9CA3AF',
        shadowColor: '#6B7280',
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 4,
        hasShine: false,
        hasFoil: false,
        hasMagicCircles: false,
        hasFiligree: false,
        hasPulse: false,
        titleGlowRadius: 4,
    },
    rare: {
        label: 'نادر',
        color: '#CD7F32',
        borderColor: '#CD7F32',
        badgeBg: 'rgba(20, 20, 20, 0.9)',
        badgeBorder: '#CD7F32',
        badgeText: '#D97706',
        shadowColor: '#CD7F32',
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
        hasShine: false,
        hasFoil: false,
        hasMagicCircles: false,
        hasFiligree: true,
        hasPulse: false,
        titleGlowRadius: 6,
    },
    epic: {
        label: 'ملحمي',
        color: '#A855F7',
        borderColor: '#A855F7',
        badgeBg: 'rgba(20, 20, 20, 0.9)',
        badgeBorder: '#A855F7',
        badgeText: '#A78BFA',
        shadowColor: '#A855F7',
        shadowOpacity: 0.5,
        shadowRadius: 14,
        elevation: 8,
        hasShine: true,
        hasFoil: true,
        hasMagicCircles: true,
        hasFiligree: true,
        hasPulse: false,
        titleGlowRadius: 8,
    },
    legendary: {
        label: 'أسطوري',
        color: '#FFD700',
        borderColor: '#FFD700',
        badgeBg: 'rgba(20, 20, 20, 0.9)',
        badgeBorder: '#FFD700',
        badgeText: '#FBBF24',
        shadowColor: '#FFD700',
        shadowOpacity: 0.8,
        shadowRadius: 18,
        elevation: 10,
        hasShine: true,
        hasFoil: true,
        hasMagicCircles: true,
        hasFiligree: true,
        hasPulse: true,
        titleGlowRadius: 10,
    },
};

// Animated Magic Circle Component
const AnimatedMagicCircle = ({ color, size = 60 }: { color: string; size?: number }) => {
    const rotation = useSharedValue(0);

    useEffect(() => {
        rotation.value = withRepeat(
            withTiming(360, {
                duration: 8000,
                easing: Easing.linear,
            }),
            -1,
            false
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotation.value}deg` }],
    }));

    return (
        <Animated.View style={[styles.magicCircleContainer, { width: size, height: size }, animatedStyle]}>
            <Svg width={size} height={size} viewBox="0 0 100 100">
                <Defs>
                    <SvgLinearGradient id="magicGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <Stop offset="0%" stopColor={color} stopOpacity="0.3" />
                        <Stop offset="50%" stopColor={color} stopOpacity="0.6" />
                        <Stop offset="100%" stopColor={color} stopOpacity="0.3" />
                    </SvgLinearGradient>
                </Defs>
                {/* Outer Ring */}
                <Circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="url(#magicGradient)"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                />
                {/* Middle Ring */}
                <Circle
                    cx="50"
                    cy="50"
                    r="35"
                    fill="none"
                    stroke={color}
                    strokeWidth="1"
                    strokeDasharray="2 3"
                    strokeOpacity="0.7"
                />
                {/* Inner Ring */}
                <Circle
                    cx="50"
                    cy="50"
                    r="25"
                    fill="none"
                    stroke={color}
                    strokeWidth="0.8"
                    strokeDasharray="1 2"
                    strokeOpacity="0.5"
                />
                {/* Decorative Paths */}
                <Path
                    d="M50 5 L50 15 M50 85 L50 95 M5 50 L15 50 M85 50 L95 50"
                    stroke={color}
                    strokeWidth="1"
                    strokeOpacity="0.6"
                />
                <Path
                    d="M18 18 L25 25 M75 75 L82 82 M82 18 L75 25 M18 82 L25 75"
                    stroke={color}
                    strokeWidth="1"
                    strokeOpacity="0.6"
                />
            </Svg>
        </Animated.View>
    );
};

// Animated Filigree Corner Component
const FiligreeCorner = ({ 
    position, 
    color 
}: { 
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'; 
    color: string;
}) => {
    const rotation = position === 'top-left' ? 0 : 
                   position === 'top-right' ? 90 :
                   position === 'bottom-right' ? 180 : 270;

    return (
        <View style={[styles.filigreeCorner, styles[position]]}>
            <Svg width={40} height={40} viewBox="0 0 100 100">
                <Defs>
                    <SvgLinearGradient id="filigreeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <Stop offset="0%" stopColor={color} stopOpacity="0.8" />
                        <Stop offset="100%" stopColor={color} stopOpacity="0.3" />
                    </SvgLinearGradient>
                </Defs>
                {/* Main Vine */}
                <Path
                    d="M0 0 Q20 0 20 20 Q20 40 40 40 Q60 40 60 20 Q60 0 80 0"
                    fill="none"
                    stroke="url(#filigreeGradient)"
                    strokeWidth="2"
                    strokeLinecap="round"
                />
                {/* Decorative Leaves */}
                <Path
                    d="M10 10 Q15 5 20 10 Q25 15 20 20 Q15 25 10 20"
                    fill={color}
                    fillOpacity="0.3"
                    stroke={color}
                    strokeWidth="0.5"
                />
                <Path
                    d="M30 30 Q35 25 40 30 Q45 35 40 40 Q35 45 30 40"
                    fill={color}
                    fillOpacity="0.2"
                    stroke={color}
                    strokeWidth="0.5"
                />
                {/* Sparkles */}
                <Circle cx="15" cy="15" r="2" fill={color} fillOpacity="0.6" />
                <Circle cx="35" cy="35" r="1.5" fill={color} fillOpacity="0.4" />
                <Circle cx="25" cy="25" r="1" fill={color} fillOpacity="0.5" />
            </Svg>
        </View>
    );
};

export function LuxuryCharacterCardAnimated({ card, style }: LuxuryCharacterCardAnimatedProps) {
    const rarity: CardRarity = card.rarity ?? 'common';
    const theme = RARITY_THEMES[rarity];

    // Holo-Foil Animation
    const foilPosition = useSharedValue(-100);

    useEffect(() => {
        if (theme.hasFoil) {
            foilPosition.value = withRepeat(
                withTiming(200, {
                    duration: rarity === 'legendary' ? 2500 : 3500,
                    easing: Easing.linear,
                }),
                -1,
                false
            );
        }
    }, [rarity]);

    const foilAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: foilPosition.value }],
    }));

    // Breathing Aura Animation (Legendary only)
    const pulseScale = useSharedValue(1);
    const pulseOpacity = useSharedValue(theme.shadowOpacity);

    useEffect(() => {
        if (theme.hasPulse) {
            pulseScale.value = withRepeat(
                withTiming(1.02, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
                -1,
                true
            );
            pulseOpacity.value = withRepeat(
                withTiming(0.9, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
                -1,
                true
            );
        }
    }, [rarity]);

    const pulseAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulseScale.value }],
        shadowOpacity: pulseOpacity.value,
    }));

    return (
        <Animated.View style={[styles.cardContainer, style, pulseAnimatedStyle, {
            borderColor: theme.borderColor,
            shadowColor: theme.shadowColor,
            shadowOpacity: theme.shadowOpacity,
            shadowRadius: theme.shadowRadius,
            elevation: theme.elevation,
        }]}>
            {/* Card Background Image */}
            <ImageBackground
                source={card.finalImage}
                style={styles.cardBackground}
                imageStyle={{ borderRadius: 12 }}
            >
                {/* Holo-Foil Sweep Animation */}
                {theme.hasFoil && (
                    <Animated.View style={[styles.foilSweep, foilAnimatedStyle]}>
                        <LinearGradient
                            colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.3)', 'rgba(255,255,255,0)']}
                            style={styles.foilGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        />
                    </Animated.View>
                )}

                {/* Glass Shine Overlay */}
                {theme.hasShine && (
                    <LinearGradient
                        colors={['rgba(255,255,255, 0.0)', 'rgba(255,255,255, 0.15)', 'rgba(255,255,255, 0.0)']}
                        style={styles.shineOverlay}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    />
                )}

                {/* Elegant Thin Border */}
                <View style={[styles.innerBorder, { borderColor: theme.borderColor }]} />

                {/* Gradient Overlay for Text Readability */}
                <LinearGradient
                    colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.9)']}
                    style={styles.gradientOverlay}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                />

                {/* Static Filigree Corners */}
                {theme.hasFiligree && (
                    <>
                        <FiligreeCorner position="top-left" color={theme.color} />
                        <FiligreeCorner position="top-right" color={theme.color} />
                        <FiligreeCorner position="bottom-left" color={theme.color} />
                        <FiligreeCorner position="bottom-right" color={theme.color} />
                    </>
                )}

                {/* Top-Left Sleek Badge */}
                <View style={[styles.rarityBadge, { backgroundColor: theme.badgeBg, borderColor: theme.badgeBorder }]}>
                    <Text style={[styles.rarityBadgeText, { color: theme.badgeText }]}>
                        {theme.label} ✦
                    </Text>
                </View>

                {/* Center Typography - Lower Half */}
                <View style={styles.titlesContainer}>
                    <Text style={styles.subtitle} numberOfLines={1}>
                        {card.nameAr}
                    </Text>
                    <Text style={[styles.title, { 
                        textShadowColor: theme.color,
                        textShadowRadius: theme.titleGlowRadius,
                    }]} numberOfLines={2}>
                        {card.nameEn || card.name}
                    </Text>
                </View>

                {/* Frosted Glass Description Box */}
                <View style={styles.descriptionBox}>
                    <Text style={styles.descriptionText} numberOfLines={3}>
                        {card.nameAr} - {card.race} {card.cardClass}
                    </Text>
                </View>

                {/* Bottom Stat Orbs - Embedded in Corners */}
                <View style={styles.statsContainer}>
                    {/* Left Orb - Defense */}
                    <View style={[styles.statOrb, styles.defenseOrb, { 
                        borderColor: theme.borderColor,
                        shadowColor: theme.color,
                        shadowOpacity: theme.shadowOpacity * 0.6,
                    }]}>
                        {/* Rotating Magic Circle Behind */}
                        {theme.hasMagicCircles && (
                            <View style={styles.magicCircleWrapper}>
                                <AnimatedMagicCircle color={theme.color} size={60} />
                            </View>
                        )}
                        <LinearGradient
                            colors={['rgba(10, 10, 10, 0.9)', 'rgba(30, 30, 40, 0.7)', 'rgba(10, 10, 10, 0.9)']}
                            style={styles.orbGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <Text style={styles.statOrbIcon}>🛡️</Text>
                            <Text style={styles.statOrbValue}>{card.defense}</Text>
                        </LinearGradient>
                    </View>

                    {/* Right Orb - Attack */}
                    <View style={[styles.statOrb, styles.attackOrb, { 
                        borderColor: theme.borderColor,
                        shadowColor: theme.color,
                        shadowOpacity: theme.shadowOpacity * 0.6,
                    }]}>
                        {/* Rotating Magic Circle Behind */}
                        {theme.hasMagicCircles && (
                            <View style={styles.magicCircleWrapper}>
                                <AnimatedMagicCircle color={theme.color} size={60} />
                            </View>
                        )}
                        <LinearGradient
                            colors={['rgba(10, 10, 10, 0.9)', 'rgba(30, 30, 40, 0.7)', 'rgba(10, 10, 10, 0.9)']}
                            style={styles.orbGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <Text style={styles.statOrbIcon}>⚔️</Text>
                            <Text style={[styles.statOrbValue, styles.attackValue]}>{card.attack}</Text>
                        </LinearGradient>
                    </View>
                </View>
            </ImageBackground>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    cardContainer: {
        width: 220,
        height: 320,
        borderRadius: 12,
        overflow: 'hidden',
        shadowOffset: { width: 0, height: 0 },
        backgroundColor: '#111',
        borderWidth: 1,
    },
    cardBackground: {
        width: '100%',
        height: '100%',
        justifyContent: 'space-between',
    },
    foilSweep: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1,
        overflow: 'hidden',
    },
    foilGradient: {
        width: '100%',
        height: '100%',
        transform: [{ rotate: '-45deg' }],
    },
    shineOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 2,
    },
    innerBorder: {
        position: 'absolute',
        top: 4,
        left: 4,
        right: 4,
        bottom: 4,
        borderRadius: 8,
        borderWidth: 1,
        zIndex: 5,
    },
    gradientOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 2,
    },
    filigreeCorner: {
        position: 'absolute',
        width: 40,
        height: 40,
        zIndex: 6,
        opacity: 0.8,
    },
    'top-left': {
        top: 2,
        left: 2,
    },
    'top-right': {
        top: 2,
        right: 2,
        transform: [{ rotate: '90deg' }],
    },
    'bottom-left': {
        bottom: 2,
        left: 2,
        transform: [{ rotate: '-90deg' }],
    },
    'bottom-right': {
        bottom: 2,
        right: 2,
        transform: [{ rotate: '180deg' }],
    },
    magicCircleContainer: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    magicCircleWrapper: {
        position: 'absolute',
        top: -7,
        left: -7,
        right: -7,
        bottom: -7,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: -1,
    },
    rarityBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderBottomRightRadius: 10,
        borderWidth: 1,
        zIndex: 10,
    },
    rarityBadgeText: {
        fontSize: 11,
        fontWeight: '600',
    },
    titlesContainer: {
        position: 'absolute',
        top: '40%',
        left: 0,
        right: 0,
        alignItems: 'center',
        paddingHorizontal: 16,
        zIndex: 5,
    },
    subtitle: {
        fontSize: 12,
        fontWeight: '500',
        color: '#FFD700',
        marginBottom: 4,
        textAlign: 'center',
        textShadowColor: 'rgba(0,0,0,0.8)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
        fontStyle: 'italic',
        color: '#FFFFFF',
        textAlign: 'center',
        textShadowColor: 'rgba(0,0,0,0.8)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    descriptionBox: {
        position: 'absolute',
        top: '58%',
        left: 16,
        right: 16,
        backgroundColor: 'rgba(15, 15, 15, 0.75)',
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.3)',
        borderRadius: 6,
        padding: 10,
        alignSelf: 'center',
        marginBottom: 60,
        zIndex: 5,
    },
    descriptionText: {
        fontSize: 10,
        color: '#FFF',
        lineHeight: 16,
        textAlign: 'center',
    },
    statsContainer: {
        position: 'absolute',
        bottom: 10,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        zIndex: 10,
    },
    statOrb: {
        width: 45,
        height: 45,
        borderRadius: 25,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 8,
        elevation: 6,
    },
    defenseOrb: {},
    attackOrb: {},
    orbGradient: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    statOrbIcon: {
        fontSize: 14,
        marginBottom: 1,
    },
    statOrbValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#87CEEB',
    },
    attackValue: {
        color: '#FFD700',
    },
});
