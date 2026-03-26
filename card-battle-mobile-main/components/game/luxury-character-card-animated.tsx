/**
 * LuxuryCharacterCardAnimated — Fully Responsive
 * fitInsideBorder: custom image is clipped to the inner border area (inset 5px)
 * Animated images (GIF / WebP) and videos are supported automatically via expo-video.
 *
 * Props:
 *   videoMuted — when true the video plays silently (default: false = sound ON)
 */
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useVideoPlayer, VideoView } from 'expo-video';
import Animated, {
    useSharedValue, useAnimatedStyle, withRepeat, withTiming,
    withSequence, interpolate, Easing,
} from 'react-native-reanimated';
import { Svg, Circle, Line, Polygon, Ellipse, Path } from 'react-native-svg';
import { Card, CardRarity } from '@/lib/game/types';
import { getCardImage } from '../../lib/game/get-card-image';

const BASE_W = 220;
const BASE_H = 320;

interface Props {
    card: Card;
    style?: ViewStyle;
    imageOffsetY?: number;
    fitInsideBorder?: boolean;
    /** When true the video plays muted/silent (default: false = sound ON) */
    videoMuted?: boolean;
}

// ---------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------
function isVideoUri(uri: string): boolean {
    if (!uri || typeof uri !== 'string') return false;
    const lower = uri.toLowerCase();
    if (lower.includes('.mp4') || lower.includes('.webm') || lower.includes('.mov')) return true;
    if (lower.startsWith('data:video/')) return true;
    return false;
}

function isAnimatedUri(uri: string): boolean {
    if (!uri || typeof uri !== 'string') return false;
    const lower = uri.toLowerCase();
    if (lower.includes('.gif') || lower.includes('.webp')) return true;
    if (lower.startsWith('data:image/gif') || lower.startsWith('data:image/webp')) return true;
    return false;
}

/** Returns true if the value is a local require() asset (number) */
function isLocalAsset(value: any): value is number {
    return typeof value === 'number';
}

const RARITY_THEMES = {
    common: {
        label: '\u0639\u0627\u062f\u064a', color: '#9CA3AF', borderColor: '#6B7280', borderWidth: 1,
        shadowColor: '#6B7280', shadowOpacity: 0.15, shadowRadius: 6, elevation: 4,
        hasFoil: false, hasRunicRing: false, hasFiligree: false, hasPulse: false,
        hasEdgeChain: false, hasParticles: false, hasSideVines: false,
        foilDuration: 0, atkColor: '#9CA3AF', defColor: '#9CA3AF',
        foilColors: ['transparent', 'transparent'] as any,
        starColor: '#9CA3AF', starEmpty: '#3f3f46',
        abilityBg: ['rgba(10,10,14,0.88)', 'rgba(20,20,28,0.92)'] as any,
        abilityBorder: '#6B728066', abilityTextColor: '#d1d5db', abilityIconColor: '#9CA3AF',
        bgColors: ['#1a1a2e', '#2d2d44', '#1a1a2e'] as any,
    },
    rare: {
        label: '\u0646\u0627\u062f\u0631', color: '#CD7F32', borderColor: '#CD7F32', borderWidth: 1.5,
        shadowColor: '#CD7F32', shadowOpacity: 0.35, shadowRadius: 10, elevation: 6,
        hasFoil: false, hasRunicRing: false, hasFiligree: true, hasPulse: false,
        hasEdgeChain: false, hasParticles: false, hasSideVines: false,
        foilDuration: 0, atkColor: '#D97706', defColor: '#92C5FD',
        foilColors: ['transparent', 'transparent'] as any,
        starColor: '#CD7F32', starEmpty: '#3f2d1a',
        abilityBg: ['rgba(15,10,5,0.9)', 'rgba(30,18,8,0.95)'] as any,
        abilityBorder: '#CD7F3266', abilityTextColor: '#fcd9a0', abilityIconColor: '#CD7F32',
        bgColors: ['#1a1200', '#2d2000', '#1a1200'] as any,
    },
    epic: {
        label: '\u0645\u0644\u062d\u0645\u064a', color: '#A855F7', borderColor: '#A855F7', borderWidth: 2,
        shadowColor: '#A855F7', shadowOpacity: 0.65, shadowRadius: 18, elevation: 9,
        hasFoil: true, hasRunicRing: true, hasFiligree: true, hasPulse: false,
        hasEdgeChain: false, hasParticles: false, hasSideVines: true,
        foilDuration: 3000, atkColor: '#F0ABFC', defColor: '#93C5FD',
        foilColors: ['transparent', 'rgba(200,100,255,0.12)', 'rgba(150,80,255,0.25)', 'rgba(200,100,255,0.12)', 'transparent'] as any,
        starColor: '#A855F7', starEmpty: '#2d1a3f',
        abilityBg: ['rgba(30,5,55,0.92)', 'rgba(50,10,80,0.96)'] as any,
        abilityBorder: '#A855F7AA', abilityTextColor: '#e9d5ff', abilityIconColor: '#d8b4fe',
        bgColors: ['#1a0030', '#2d0050', '#1a0030'] as any,
    },
    legendary: {
        label: '\u0623\u0633\u0637\u0648\u0631\u064a', color: '#FFD700', borderColor: '#FFD700', borderWidth: 2.5,
        shadowColor: '#FFD700', shadowOpacity: 0.9, shadowRadius: 26, elevation: 12,
        hasFoil: true, hasRunicRing: true, hasFiligree: true, hasPulse: true,
        hasEdgeChain: true, hasParticles: true, hasSideVines: false,
        foilDuration: 2200, atkColor: '#FDE68A', defColor: '#BAE6FD',
        foilColors: ['transparent', 'rgba(255,215,0,0.1)', 'rgba(255,200,50,0.28)', 'rgba(255,180,0,0.18)', 'rgba(255,215,0,0.1)', 'transparent'] as any,
        starColor: '#FFD700', starEmpty: '#3a2d00',
        abilityBg: ['rgba(30,22,0,0.93)', 'rgba(50,36,0,0.97)'] as any,
        abilityBorder: '#FFD700CC', abilityTextColor: '#fef3c7', abilityIconColor: '#FFD700',
        bgColors: ['#1a1400', '#2d2400', '#1a1400'] as any,
    },
} as const;

const RunicRing = ({ color, size = 64, reverse = false, speed = 10000 }: { color: string; size?: number; reverse?: boolean; speed?: number }) => {
    const rotation = useSharedValue(0);
    useEffect(() => {
        rotation.value = withRepeat(withTiming(reverse ? -360 : 360, { duration: speed, easing: Easing.linear }), -1, false);
    }, []);
    const animStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.value}deg` }] }));
    const spokes = Array.from({ length: 8 }).map((_, i) => {
        const a = (i * 45) * Math.PI / 180;
        return <Line key={i} x1={50 + 28 * Math.cos(a)} y1={50 + 28 * Math.sin(a)} x2={50 + 44 * Math.cos(a)} y2={50 + 44 * Math.sin(a)} stroke={color} strokeWidth={0.7} opacity={0.6} />;
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
                {spokes}{gems}
                <Circle cx={50} cy={50} r={2} fill={color} opacity={0.8} />
            </Svg>
        </Animated.View>
    );
};

const ElvenCorner = ({ position, color, rich = false, scale = 1 }: { position: 'tl' | 'tr' | 'bl' | 'br'; color: string; rich?: boolean; scale?: number }) => {
    const rot = position === 'tl' ? 0 : position === 'tr' ? 90 : position === 'bl' ? -90 : 180;
    const posStyle: ViewStyle =
        position === 'tl' ? { top: 2, left: 2 } : position === 'tr' ? { top: 2, right: 2 } :
            position === 'bl' ? { bottom: 2, left: 2 } : { bottom: 2, right: 2 };
    const baseSz = rich ? 54 : 40;
    const sz = baseSz * scale;
    const spokes = Array.from({ length: 8 }).map((_, i) => {
        const a = (i * 45) * Math.PI / 180;
        return <Line key={i} x1={14 + 5 * Math.cos(a)} y1={14 + 5 * Math.sin(a)} x2={14 + 10 * Math.cos(a)} y2={14 + 10 * Math.sin(a)} stroke={color} strokeWidth={0.6} opacity={0.7} />;
    });
    return (
        <View style={[styles.filigreeCorner, posStyle, { width: sz, height: sz }]} pointerEvents="none">
            <Svg width={sz} height={sz} viewBox="0 0 80 80" style={{ transform: [{ rotate: `${rot}deg` }] }}>
                <Line x1={8} y1={14} x2={68} y2={11} stroke={color} strokeWidth={1.4} opacity={0.9} />
                <Line x1={14} y1={8} x2={11} y2={68} stroke={color} strokeWidth={1.4} opacity={0.9} />
                <Line x1={8} y1={22} x2={50} y2={20} stroke={color} strokeWidth={0.7} opacity={0.5} />
                <Line x1={22} y1={8} x2={20} y2={50} stroke={color} strokeWidth={0.7} opacity={0.5} />
                {[28, 40, 52, 64].map((x, i) => <Ellipse key={`hx${i}`} cx={x} cy={11} rx={rich ? 3.5 : 2.5} ry={rich ? 2 : 1.5} fill={color} opacity={0.6} />)}
                {[28, 40, 52, 64].map((y, i) => <Ellipse key={`vy${i}`} cx={11} cy={y} rx={rich ? 2 : 1.5} ry={rich ? 3.5 : 2.5} fill={color} opacity={0.6} />)}
                <Circle cx={14} cy={14} r={rich ? 9 : 7} stroke={color} strokeWidth={1.2} fill="none" opacity={0.85} />
                <Circle cx={14} cy={14} r={rich ? 6 : 4} fill={color} opacity={0.9} />
                {rich && <Circle cx={14} cy={14} r={2} fill="#fff" opacity={0.7} />}
                {spokes}
                {[20, 28, 36, 44, 52, 60].map((x, i) => <Circle key={`chi${i}`} cx={x} cy={13} r={rich ? 1.1 : 0.8} fill={color} opacity={0.5} />)}
                {[20, 28, 36, 44, 52, 60].map((y, i) => <Circle key={`cvi${i}`} cx={13} cy={y} r={rich ? 1.1 : 0.8} fill={color} opacity={0.5} />)}
                {rich && <Path d="M22 22 Q30 18 28 28 Q18 30 22 22" fill={color} fillOpacity={0.35} stroke={color} strokeWidth={0.6} />}
                {rich && <Path d="M30 14 L34 10 L36 16 Z" fill={color} fillOpacity={0.7} />}
                {rich && <Path d="M14 30 L10 34 L16 36 Z" fill={color} fillOpacity={0.7} />}
            </Svg>
        </View>
    );
};

const EdgeChain = ({ color }: { color: string }) => (
    <View style={styles.edgeChainWrapper} pointerEvents="none">
        <Svg style={styles.edgeTop} width="100%" height={10} viewBox="0 0 220 10" preserveAspectRatio="none">
            {Array.from({ length: 18 }).map((_, i) => (<React.Fragment key={i}><Circle cx={12 + i * 11} cy={5} r={2.5} fill={color} fillOpacity={0.5} />{i < 17 && <Line x1={14.5 + i * 11} y1={5} x2={20.5 + i * 11} y2={5} stroke={color} strokeWidth={0.8} opacity={0.35} />}</React.Fragment>))}
        </Svg>
        <Svg style={styles.edgeBottom} width="100%" height={10} viewBox="0 0 220 10" preserveAspectRatio="none">
            {Array.from({ length: 18 }).map((_, i) => (<React.Fragment key={i}><Circle cx={12 + i * 11} cy={5} r={2.5} fill={color} fillOpacity={0.5} />{i < 17 && <Line x1={14.5 + i * 11} y1={5} x2={20.5 + i * 11} y2={5} stroke={color} strokeWidth={0.8} opacity={0.35} />}</React.Fragment>))}
        </Svg>
        <Svg style={styles.edgeLeft} width={10} height="100%" viewBox="0 0 10 320" preserveAspectRatio="none">
            {Array.from({ length: 26 }).map((_, i) => (<React.Fragment key={i}><Circle cx={5} cy={12 + i * 11} r={2.5} fill={color} fillOpacity={0.4} />{i < 25 && <Line x1={5} y1={14.5 + i * 11} x2={5} y2={20.5 + i * 11} stroke={color} strokeWidth={0.8} opacity={0.3} />}</React.Fragment>))}
        </Svg>
        <Svg style={styles.edgeRight} width={10} height="100%" viewBox="0 0 10 320" preserveAspectRatio="none">
            {Array.from({ length: 26 }).map((_, i) => (<React.Fragment key={i}><Circle cx={5} cy={12 + i * 11} r={2.5} fill={color} fillOpacity={0.4} />{i < 25 && <Line x1={5} y1={14.5 + i * 11} x2={5} y2={20.5 + i * 11} stroke={color} strokeWidth={0.8} opacity={0.3} />}</React.Fragment>))}
        </Svg>
    </View>
);

const SideVines = ({ color }: { color: string }) => (
    <View style={styles.sideVinesWrapper} pointerEvents="none">
        <Svg style={styles.vineLeft} width={14} height="60%" viewBox="0 0 14 180">
            <Path d="M7 0 Q12 20 7 40 Q2 60 7 80 Q12 100 7 120 Q2 140 7 160 Q12 170 7 180" stroke={color} strokeWidth={1.2} fill="none" opacity={0.45} />
            {[20, 50, 80, 110, 140].map((y, i) => (<Ellipse key={i} cx={i % 2 === 0 ? 10 : 4} cy={y} rx={3} ry={4.5} fill={color} fillOpacity={0.3} stroke={color} strokeWidth={0.5} opacity={0.6} />))}
        </Svg>
        <Svg style={styles.vineRight} width={14} height="60%" viewBox="0 0 14 180">
            <Path d="M7 0 Q2 20 7 40 Q12 60 7 80 Q2 100 7 120 Q12 140 7 160 Q2 170 7 180" stroke={color} strokeWidth={1.2} fill="none" opacity={0.45} />
            {[20, 50, 80, 110, 140].map((y, i) => (<Ellipse key={i} cx={i % 2 === 0 ? 4 : 10} cy={y} rx={3} ry={4.5} fill={color} fillOpacity={0.3} stroke={color} strokeWidth={0.5} opacity={0.6} />))}
        </Svg>
    </View>
);

const FloatingParticles = ({ color }: { color: string }) => (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width="100%" height="100%" viewBox="0 0 220 320">
            {[{ x: 30, y: 60 }, { x: 185, y: 80 }, { x: 55, y: 140 }, { x: 165, y: 155 }, { x: 110, y: 50 }, { x: 20, y: 200 }, { x: 195, y: 210 }].map((d, i) => (<React.Fragment key={i}><Circle cx={d.x} cy={d.y} r={1.8} fill={color} fillOpacity={0.6} /><Circle cx={d.x} cy={d.y} r={3.5} fill={color} fillOpacity={0.12} /></React.Fragment>))}
            {[[40, 90], [175, 100], [110, 200]].map(([x, y], i) => (<Polygon key={`d${i}`} points={`${x},${y - 5} ${x + 4},${y} ${x},${y + 5} ${x - 4},${y}`} fill={color} fillOpacity={0.5} />))}
        </Svg>
    </View>
);

const BreathingBorder = () => {
    const pulse = useSharedValue(0);
    useEffect(() => { pulse.value = withRepeat(withTiming(1, { duration: 2800, easing: Easing.inOut(Easing.quad) }), -1, true); }, []);
    const animStyle = useAnimatedStyle(() => ({
        opacity: interpolate(pulse.value, [0, 1], [0.45, 1]),
        shadowOpacity: interpolate(pulse.value, [0, 1], [0.3, 0.95]),
        shadowRadius: interpolate(pulse.value, [0, 1], [10, 36]),
        transform: [{ scale: interpolate(pulse.value, [0, 1], [0.997, 1.006]) }],
    }));
    return <Animated.View style={[styles.breathingBorder, animStyle]} pointerEvents="none" />;
};

const GlowRing = ({ color }: { color: string }) => {
    const opacity = useSharedValue(0.4);
    useEffect(() => { opacity.value = withRepeat(withSequence(withTiming(1, { duration: 1800 }), withTiming(0.4, { duration: 1800 })), -1, false); }, []);
    const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
    return <Animated.View style={[styles.glowRing, { borderColor: color, shadowColor: color }, animStyle]} pointerEvents="none" />;
};

const StarsRow = ({ count, color, emptyColor, sc }: { count: number; color: string; emptyColor: string; sc: number }) => (
    <View style={styles.starsRow}>
        {Array.from({ length: 5 }).map((_, i) => (
            <Text key={i} style={[styles.star, { color: i < count ? color : emptyColor, fontSize: Math.max(7, 11 * sc), lineHeight: Math.max(10, 14 * sc) }]}>{i < count ? '\u2605' : '\u2606'}</Text>
        ))}
    </View>
);

const AbilityBanner = ({ text, rarity, theme, sc }: { text: string; rarity: CardRarity; theme: typeof RARITY_THEMES['legendary']; sc: number }) => {
    const textSize = Math.max(7, 9.5 * sc);
    const iconSize = Math.max(8, 11 * sc);
    const padH = Math.max(4, 8 * sc);
    const padV = Math.max(3, 5 * sc);
    if (rarity === 'legendary') {
        return (
            <View style={styles.abilityWrapperLegendary}>
                <View style={styles.legendaryDivider}>
                    <View style={[styles.dividerLine, { backgroundColor: theme.color }]} />
                    <Text style={[styles.dividerGem, { color: theme.color, fontSize: Math.max(7, 10 * sc) }]}>\u2726</Text>
                    <View style={[styles.dividerLine, { backgroundColor: theme.color }]} />
                </View>
                <LinearGradient colors={theme.abilityBg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.abilityBannerBase, { borderColor: theme.abilityBorder, borderWidth: 1.2, paddingHorizontal: padH, paddingVertical: padV }]}>
                    <Text style={[styles.abilityIcon, { color: theme.abilityIconColor, fontSize: iconSize }]}>\u269c\ufe0f</Text>
                    <Text style={[styles.abilityText, { color: theme.abilityTextColor, fontSize: textSize, lineHeight: textSize * 1.35 }]} numberOfLines={2}>{text}</Text>
                </LinearGradient>
            </View>
        );
    }
    if (rarity === 'epic') {
        return (
            <View style={styles.abilityWrapperEpic}>
                <View style={[styles.epicAccentBar, { backgroundColor: theme.color }]} />
                <LinearGradient colors={theme.abilityBg} style={[styles.abilityBannerBase, { borderColor: theme.abilityBorder, borderWidth: 1, borderLeftWidth: 0, paddingHorizontal: padH, paddingVertical: padV }]}>
                    <Text style={[styles.abilityIcon, { color: theme.abilityIconColor, fontSize: iconSize }]}>\u2726</Text>
                    <Text style={[styles.abilityText, { color: theme.abilityTextColor, fontSize: textSize, lineHeight: textSize * 1.35 }]} numberOfLines={2}>{text}</Text>
                </LinearGradient>
            </View>
        );
    }
    return (
        <LinearGradient colors={theme.abilityBg} style={[styles.abilityBannerSimple, { borderColor: theme.abilityBorder, paddingHorizontal: padH, paddingVertical: padV - 1 }]}>
            <Text style={[styles.abilityIcon, { color: theme.abilityIconColor, fontSize: iconSize }]}>\u25c6</Text>
            <Text style={[styles.abilityText, { color: theme.abilityTextColor, fontSize: textSize, lineHeight: textSize * 1.35 }]} numberOfLines={2}>{text}</Text>
        </LinearGradient>
    );
};

// ---------------------------------------------------------------
// VideoPlayer sub-component (expo-video)
// Must be a separate component so useVideoPlayer hook is always
// called unconditionally (Rules of Hooks).
// ---------------------------------------------------------------
function CardVideoPlayer({ source, style, videoMuted }: { source: any; style: object; videoMuted: boolean }) {
    const player = useVideoPlayer(source, (p) => {
        p.loop = true;
        p.muted = videoMuted;
        p.play();
    });
    return (
        <VideoView
            player={player}
            style={style as any}
            contentFit="cover"
            nativeControls={false}
        />
    );
}

// ---------------------------------------------------------------
// CardMedia — renders static image, animated GIF/WebP, or video
// ---------------------------------------------------------------
interface CardMediaProps {
    cardImage: ReturnType<typeof getCardImage>;
    videoAsset?: any;       // local require() asset (number)
    customUri?: string;     // remote URI string
    isCustomImage: boolean;
    imgStyle: object;
    videoMuted: boolean;
}

const CardMedia = ({ cardImage, videoAsset, customUri, isCustomImage, imgStyle, videoMuted }: CardMediaProps) => {
    // 1. Local require() video
    if (videoAsset) {
        return <CardVideoPlayer source={videoAsset} style={imgStyle} videoMuted={videoMuted} />;
    }

    // 2. Remote URI video
    if (customUri && isVideoUri(customUri)) {
        return <CardVideoPlayer source={{ uri: customUri }} style={imgStyle} videoMuted={videoMuted} />;
    }

    // 3. Static image (or animated GIF/WebP)
    const uri: string | undefined =
        cardImage && typeof cardImage === 'object' && 'uri' in cardImage
            ? (cardImage as any).uri
            : undefined;
    const animated = uri ? isAnimatedUri(uri) : false;
    const source = animated ? { uri, headers: {} } : (cardImage as any);

    return (
        <Image
            source={source}
            style={imgStyle as any}
            resizeMode={isCustomImage ? 'contain' : 'cover'}
        />
    );
};

// ---------------------------------------------------------------
// Main export
// ---------------------------------------------------------------
export function LuxuryCharacterCardAnimated({
    card,
    style,
    imageOffsetY = 0,
    fitInsideBorder = false,
    videoMuted = false,
}: Props) {
    const rarity: CardRarity = card.rarity ?? 'common';
    const theme = RARITY_THEMES[rarity];
    const hasAbility = !!card.specialAbility;
    const stars = card.stars ?? 0;

    const styleW = (style as any)?.width;
    const styleH = (style as any)?.height;
    const cardW: number = typeof styleW === 'number' ? styleW : BASE_W;
    const cardH: number = typeof styleH === 'number' ? styleH : BASE_H;

    const scW = cardW / BASE_W;
    const scH = cardH / BASE_H;
    const sc = Math.min(scW, scH);
    const INSET = Math.round(5 * sc);

    const foilPos = useSharedValue(-cardW * 0.55);
    useEffect(() => {
        if (theme.hasFoil) {
            foilPos.value = withRepeat(
                withTiming(cardW * 1.45, { duration: theme.foilDuration, easing: Easing.linear }),
                -1, false
            );
        }
    }, [rarity, cardW]);
    const foilStyle = useAnimatedStyle(() => ({ transform: [{ translateX: foilPos.value }] }));

    const cardImage = getCardImage(card);

    // ── Distinguish videoUrl type: local asset (number) vs remote URI (string) ──
    const rawVideo = card.videoUrl;
    const videoAsset: any = isLocalAsset(rawVideo) ? rawVideo : undefined;
    const videoUri: string | undefined = typeof rawVideo === 'string' ? rawVideo : undefined;

    const customUri: string | undefined = videoUri || (card as any).customImage || undefined;

    const hasVideo = !!videoAsset || !!(customUri && isVideoUri(customUri));
    const hasImage = !!cardImage || !!customUri;
    const isCustomImage = !!customUri;

    const statBadgeSize = Math.round(46 * sc);
    const ringSize = Math.round(64 * sc);
    const innerRingSize = Math.round(48 * sc);
    const innerRing2Size = Math.round(32 * sc);
    const foilStripW = Math.round(90 * scW);

    const statsBottom = Math.round(6 * scH);
    const STAT_AREA_H = Math.round(62 * scH);
    const ABILITY_H = hasAbility ? Math.round((rarity === 'legendary' ? 50 : 42) * scH) : 0;
    const ABILITY_GAP = hasAbility ? Math.round(4 * scH) : 0;
    const abilityBottom = statsBottom + STAT_AREA_H + ABILITY_GAP;
    const nameBottom = abilityBottom + (hasAbility ? ABILITY_H + Math.round(4 * scH) : 0) + Math.round((stars > 0 ? 4 : 6) * scH);

    const nameFontSize = Math.max(10, (rarity === 'legendary' ? 18 : 17) * sc);
    const badgeFontSize = Math.max(7, 10 * sc);
    const statIconSize = Math.max(8, 12 * sc);
    const statValueSize = Math.max(9, 13 * sc);
    const badgePadH = Math.max(5, 10 * sc);
    const badgePadV = Math.max(2, 3 * sc);
    const badgeTop = Math.max(4, 9 * scH);
    const badgeLeft = Math.max(4, 9 * scW);

    const imgStyle = isCustomImage && fitInsideBorder
        ? { position: 'absolute' as const, top: INSET + imageOffsetY, left: INSET, right: INSET, bottom: INSET, width: undefined, height: undefined }
        : { position: 'absolute' as const, top: imageOffsetY, left: 0, right: 0, width: '100%' as const, height: '100%' as const };

    return (
        <Animated.View style={[
            styles.cardContainer,
            { width: cardW, height: cardH, borderRadius: Math.round(14 * sc), borderColor: theme.borderColor, borderWidth: theme.borderWidth, shadowColor: theme.shadowColor, shadowOpacity: theme.shadowOpacity, shadowRadius: theme.shadowRadius, elevation: theme.elevation },
            style,
        ]}>
            {theme.hasPulse && <BreathingBorder />}
            {(rarity === 'epic' || rarity === 'legendary') && <GlowRing color={theme.color} />}

            <View style={[styles.cardInner, { borderRadius: Math.round(12 * sc) }]}>
                <LinearGradient
                    colors={theme.bgColors}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                />

                {(hasImage || hasVideo) && (
                    <CardMedia
                        cardImage={cardImage}
                        videoAsset={videoAsset}
                        customUri={customUri}
                        isCustomImage={isCustomImage}
                        imgStyle={imgStyle}
                        videoMuted={videoMuted}
                    />
                )}

                <View style={styles.contentLayer}>
                    {theme.hasFoil && (
                        <View style={styles.foilContainer} pointerEvents="none">
                            <Animated.View style={[{ position: 'absolute', top: 0, bottom: 0, width: foilStripW }, foilStyle]}>
                                <LinearGradient colors={theme.foilColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.foilGradient} />
                            </Animated.View>
                        </View>
                    )}

                    <View style={[styles.innerBorder, { borderColor: theme.borderColor + '55', borderRadius: Math.round(9 * sc) }]} pointerEvents="none" />

                    {(hasImage || hasVideo) && (
                        <LinearGradient
                            colors={['transparent', 'transparent', 'rgba(0,0,0,0.55)', 'rgba(0,0,0,0.94)']}
                            style={styles.gradientOverlay} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                            pointerEvents="none"
                        />
                    )}

                    {!hasImage && !hasVideo && (
                        <View style={styles.noImageBadge} pointerEvents="none">
                            <Text style={styles.noImageIcon}>\ud83d\uddbc\ufe0f</Text>
                            <Text style={styles.noImageText}>\u0644\u0627 \u062a\u0648\u062c\u062f \u0635\u0648\u0631\u0629</Text>
                        </View>
                    )}

                    {theme.hasEdgeChain && <EdgeChain color={theme.color} />}
                    {theme.hasParticles && <FloatingParticles color={theme.color} />}
                    {theme.hasSideVines && <SideVines color={theme.color} />}

                    {theme.hasFiligree && (
                        <>
                            <ElvenCorner position="tl" color={theme.color} rich={rarity === 'legendary'} scale={sc} />
                            <ElvenCorner position="tr" color={theme.color} rich={rarity === 'legendary'} scale={sc} />
                            {(rarity === 'legendary' || rarity === 'epic') && (
                                <>
                                    <ElvenCorner position="bl" color={theme.color} rich={rarity === 'legendary'} scale={sc} />
                                    <ElvenCorner position="br" color={theme.color} rich={rarity === 'legendary'} scale={sc} />
                                </>
                            )}
                        </>
                    )}

                    <View style={[styles.rarityBadge, { top: badgeTop, left: badgeLeft, paddingHorizontal: badgePadH, paddingVertical: badgePadV, borderRadius: Math.round(7 * sc), borderColor: theme.color + 'AA', backgroundColor: rarity === 'legendary' ? 'rgba(30,20,0,0.75)' : rarity === 'epic' ? 'rgba(20,0,30,0.75)' : 'rgba(0,0,0,0.65)' }]}>
                        <Text style={[styles.rarityBadgeText, { color: theme.color, fontSize: badgeFontSize }]}>
                            {rarity === 'legendary' ? '\u2747 ' : '\u2726 '}{theme.label}{rarity === 'legendary' ? ' \u2747' : ' \u2726'}
                        </Text>
                    </View>

                    <View style={[styles.nameContainer, { bottom: nameBottom, paddingHorizontal: Math.max(4, 10 * scW) }]}>
                        {rarity === 'legendary' && (
                            <View style={styles.legendaryNameBar}>
                                <LinearGradient colors={['transparent', 'rgba(255,215,0,0.18)', 'transparent']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
                            </View>
                        )}
                        <Text style={[styles.cardName, { textShadowColor: theme.color, fontSize: nameFontSize }]} numberOfLines={1}>
                            {card.nameAr || card.name}
                        </Text>
                        {stars > 0 && <StarsRow count={stars} color={theme.starColor} emptyColor={theme.starEmpty} sc={sc} />}
                    </View>

                    {hasAbility && (
                        <View style={[styles.abilityContainer, { bottom: abilityBottom, left: Math.max(4, 8 * scW), right: Math.max(4, 8 * scW) }]}>
                            <AbilityBanner text={card.specialAbility!} rarity={rarity} theme={theme as any} sc={sc} />
                        </View>
                    )}

                    <View style={[styles.statsRow, { bottom: statsBottom, paddingHorizontal: Math.max(6, 12 * scW) }]}>
                        {[{ icon: '\u2694\ufe0f', value: card.attack, col: theme.atkColor, rev: false },
                          { icon: '\ud83d\udee1\ufe0f', value: card.defense, col: theme.defColor, rev: true }]
                            .map(({ icon, value, col, rev }) => (
                                <View key={icon} style={styles.statWrapper}>
                                    {theme.hasRunicRing && (
                                        <View style={[styles.ringWrapper, { width: ringSize, height: ringSize }]}>
                                            <RunicRing color={theme.color} size={ringSize} reverse={rev} speed={rarity === 'legendary' ? 7000 : 10000} />
                                            <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
                                                <RunicRing color={theme.color} size={innerRingSize} reverse={!rev} speed={rarity === 'legendary' ? 5000 : 8000} />
                                            </View>
                                            {rarity === 'legendary' && (
                                                <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
                                                    <RunicRing color={theme.color} size={innerRing2Size} reverse={rev} speed={3500} />
                                                </View>
                                            )}
                                        </View>
                                    )}
                                    <View style={[styles.statBadge, { width: statBadgeSize, height: statBadgeSize, borderRadius: statBadgeSize / 2, borderColor: theme.color, shadowColor: theme.color, borderWidth: rarity === 'legendary' ? 2 : 1.5 }]}>
                                        <LinearGradient
                                            colors={rarity === 'legendary' ? ['rgba(15,10,0,0.9)', 'rgba(40,30,0,0.95)'] : ['rgba(0,0,0,0.82)', 'rgba(20,18,30,0.95)']}
                                            style={styles.badgeGradient}
                                        >
                                            <Text style={[styles.statIcon, { fontSize: statIconSize }]}>{icon}</Text>
                                            <Text style={[styles.statValue, { color: col, fontSize: statValueSize }]}>{value}</Text>
                                        </LinearGradient>
                                    </View>
                                </View>
                            ))}
                    </View>
                </View>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    cardContainer: { backgroundColor: '#0a0a0e', shadowOffset: { width: 0, height: 0 } },
    cardInner: { flex: 1, overflow: 'hidden' },
    contentLayer: { flex: 1, position: 'relative' },
    breathingBorder: { position: 'absolute', top: -6, left: -6, right: -6, bottom: -6, borderRadius: 19, borderWidth: 2.5, borderColor: '#FFD700', shadowOffset: { width: 0, height: 0 }, zIndex: 20 },
    glowRing: { position: 'absolute', top: -3, left: -3, right: -3, bottom: -3, borderRadius: 16, borderWidth: 1.5, shadowOffset: { width: 0, height: 0 }, shadowRadius: 14, zIndex: 19 },
    foilContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1, overflow: 'hidden' },
    foilGradient: { flex: 1, transform: [{ rotate: '-45deg' }] },
    innerBorder: { position: 'absolute', top: 5, left: 5, right: 5, bottom: 5, borderWidth: 1, zIndex: 5 },
    gradientOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 2 },
    filigreeCorner: { position: 'absolute', zIndex: 6, opacity: 0.92 },
    edgeChainWrapper: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 4 },
    edgeTop: { position: 'absolute', top: 3, left: 0, right: 0 },
    edgeBottom: { position: 'absolute', bottom: 3, left: 0, right: 0 },
    edgeLeft: { position: 'absolute', left: 3, top: 0, bottom: 0 },
    edgeRight: { position: 'absolute', right: 3, top: 0, bottom: 0 },
    sideVinesWrapper: { position: 'absolute', top: '20%', left: 0, right: 0, bottom: '15%', zIndex: 3 },
    vineLeft: { position: 'absolute', left: 2 },
    vineRight: { position: 'absolute', right: 2 },
    noImageBadge: { position: 'absolute', top: '25%', left: 0, right: 0, alignItems: 'center', zIndex: 4 },
    noImageIcon: { fontSize: 36, opacity: 0.4 },
    noImageText: { fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 4 },
    rarityBadge: { position: 'absolute', borderWidth: 1, zIndex: 10 },
    rarityBadgeText: { fontWeight: '700', letterSpacing: 0.5 },
    nameContainer: { position: 'absolute', left: 0, right: 0, alignItems: 'center', zIndex: 8 },
    legendaryNameBar: { position: 'absolute', top: -4, left: -10, right: -10, bottom: -4 },
    cardName: { fontWeight: '800', color: '#FFFFFF', textAlign: 'center', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 10, letterSpacing: 0.3 },
    starsRow: { flexDirection: 'row', gap: 2, marginTop: 3 },
    star: { fontWeight: 'bold' },
    abilityContainer: { position: 'absolute', zIndex: 9 },
    abilityBannerBase: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 6 },
    abilityBannerSimple: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 6, borderWidth: 0.8 },
    abilityWrapperLegendary: { gap: 0 },
    legendaryDivider: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 3, paddingHorizontal: 4 },
    dividerLine: { flex: 1, height: 0.8, opacity: 0.6 },
    dividerGem: { fontWeight: '800' },
    abilityWrapperEpic: { flexDirection: 'row', alignItems: 'stretch' },
    epicAccentBar: { width: 3, borderRadius: 2, marginRight: 0 },
    abilityIcon: {},
    abilityText: { flex: 1, fontWeight: '600', writingDirection: 'rtl' },
    statsRow: { position: 'absolute', left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', zIndex: 10 },
    statWrapper: { alignItems: 'center', justifyContent: 'center' },
    ringWrapper: { position: 'absolute', alignItems: 'center', justifyContent: 'center', zIndex: 0 },
    statBadge: { overflow: 'hidden', shadowOffset: { width: 0, height: 0 }, shadowRadius: 10, elevation: 6, zIndex: 1 },
    badgeGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    statIcon: { marginBottom: 1 },
    statValue: { fontWeight: 'bold' },
});
