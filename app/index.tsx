import React, { useEffect, useRef, useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    Dimensions,
    Animated,
    Easing,
    TouchableOpacity,
    Image,
    Modal,
    Switch,
    ScrollView,
    TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Menu, Search, Scan, Settings, Bell, Info, CreditCard, ShieldCheck, LogOut, ArrowLeft, X, Zap, Folder, Plus, ChevronRight, Star, LayoutGrid, Grid3X3 as Grid3 } from 'lucide-react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import Svg, { Rect, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const COLORS = {
    bg: '#000000',
    deepViolet: '#1a103d',
    primaryViolet: '#5b21b6',
    energy: '#8b5cf6',
    energyDark: '#4c1d95',
    success: '#10b981',
    border: 'rgba(124, 58, 237, 0.2)',
};

const CARD_WIDTH = width * 0.65;
const CARD_HEIGHT = CARD_WIDTH * 1.4;

export default function CardScanScreen() {
    const [step, setStep] = useState(0); // 0, 1, 2
    const [paywallVisible, setPaywallVisible] = useState(false);

    const [isDashboard, setIsDashboard] = useState(false);
    const [isSettings, setIsSettings] = useState(false);
    const [isCollections, setIsCollections] = useState(false);
    const [isCamera, setIsCamera] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [activeCategory, setActiveCategory] = useState('All');
    const [gridColumns, setGridColumns] = useState(2);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    const [permission, requestPermission] = useCameraPermissions();

    const scanAnim = useRef(new Animated.Value(0)).current;
    const progressAnim = useRef(new Animated.Value(0)).current;
    const priceFadeAnim = useRef(new Animated.Value(0)).current;
    const floatAnim = useRef(new Animated.Value(0)).current;

    // Continuous Animations
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(scanAnim, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
                Animated.timing(scanAnim, { toValue: 0, duration: 2000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
            ])
        ).start();
    }, []);

    const handleNext = () => {
        if (step === 0) {
            setStep(1);
            Animated.parallel([
                Animated.timing(progressAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
                Animated.delay(400),
                Animated.timing(priceFadeAnim, { toValue: 1, duration: 600, useNativeDriver: true })
            ]).start();
        } else if (step === 1) {
            setStep(2);
            Animated.timing(priceFadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
                Animated.timing(progressAnim, { toValue: 2, duration: 1000, easing: Easing.out(Easing.back(1.2)), useNativeDriver: true }).start();
            });
        } else if (step === 2) {
            setPaywallVisible(true);
        }
    };

    const reset = () => {
        setStep(0);
        progressAnim.setValue(0);
        priceFadeAnim.setValue(0);
    };

    // Interpolations
    const scanY = scanAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, CARD_HEIGHT], // Moves precisely from top to bottom
    });

    const cardScale = progressAnim.interpolate({
        inputRange: [0, 1, 2],
        outputRange: [1, 1.1, 0.72]
    });

    const laserOpacity = progressAnim.interpolate({ inputRange: [0, 0.1], outputRange: [1, 0], extrapolate: 'clamp' });
    const cornerOpacity = progressAnim.interpolate({ inputRange: [0, 0.5], outputRange: [1, 0], extrapolate: 'clamp' });
    const sideCardsOpacity = progressAnim.interpolate({ inputRange: [1.2, 1.8], outputRange: [0, 1], extrapolate: 'clamp' });

    // Card Positions Step 2
    const innerLeftX = progressAnim.interpolate({ inputRange: [1, 2], outputRange: [0, -width * 0.24] });
    const innerRightX = progressAnim.interpolate({ inputRange: [1, 2], outputRange: [0, width * 0.24] });
    const outerLeftX = progressAnim.interpolate({ inputRange: [1, 2], outputRange: [0, -width * 0.44] });
    const outerRightX = progressAnim.interpolate({ inputRange: [1, 2], outputRange: [0, width * 0.44] });

    const innerLeftRotate = progressAnim.interpolate({ inputRange: [1, 2], outputRange: ['0deg', '-10deg'] });
    const innerRightRotate = progressAnim.interpolate({ inputRange: [1, 2], outputRange: ['0deg', '10deg'] });
    const outerLeftRotate = progressAnim.interpolate({ inputRange: [1, 2], outputRange: ['0deg', '-22deg'] });
    const outerRightRotate = progressAnim.interpolate({ inputRange: [1, 2], outputRange: ['0deg', '22deg'] });

    // Title Logic
    const title1Opacity = progressAnim.interpolate({ inputRange: [0, 0.4], outputRange: [1, 0], extrapolate: 'clamp' });
    const title2Opacity = progressAnim.interpolate({ inputRange: [0.6, 1, 1.4], outputRange: [0, 1, 0], extrapolate: 'clamp' });
    const title3Opacity = progressAnim.interpolate({ inputRange: [1.6, 2], outputRange: [0, 1], extrapolate: 'clamp' });
    const titleSlideY = progressAnim.interpolate({ inputRange: [0, 0.5, 1, 1.5, 2], outputRange: [0, -30, 0, -30, 0] });

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <LinearGradient colors={[COLORS.deepViolet, COLORS.bg]} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1.2 }} style={StyleSheet.absoluteFill} />

            <View pointerEvents="none" style={[styles.meshContainer, { opacity: (isSettings || isCollections || isDashboard) ? 0.15 : 0.4 }]}>
                <Svg height="100%" width="100%">
                    <Defs>
                        <SvgGradient id="meshGrad" x1="0" y1="0" x2="1" y2="1">
                            <Stop offset="0" stopColor={COLORS.energy} stopOpacity="0.4" />
                            <Stop offset="1" stopColor={COLORS.primaryViolet} stopOpacity="0.1" />
                        </SvgGradient>
                    </Defs>
                    {[...Array(15)].map((_, i) => (
                        <Rect key={`h-${i}`} x="0" y={(height / 15) * i} width={width} height="0.8" fill="url(#meshGrad)" />
                    ))}
                    {[...Array(8)].map((_, i) => (
                        <Rect key={`v-${i}`} x={(width / 8) * i} y="0" width="0.8" height={height} fill="url(#meshGrad)" />
                    ))}
                </Svg>
            </View>

            <SafeAreaView style={styles.safeArea}>
                {isCamera ? (
                    <View style={styles.cameraContainer}>
                        <CameraView style={styles.camera} facing="back">
                            <SafeAreaView style={styles.cameraOverlay}>
                                <View style={styles.cameraHeader}>
                                    <TouchableOpacity style={styles.cameraCloseBtn} onPress={() => setIsCamera(false)}>
                                        <X color="#FFF" size={28} />
                                    </TouchableOpacity>
                                    <View style={styles.cameraActions}>
                                        <TouchableOpacity style={styles.cameraActionBtn}>
                                            <Zap color="#FFF" size={24} />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <View style={styles.cameraFocusContainer}>
                                    <View style={styles.cameraFocusFrame}>
                                        <View style={[styles.cameraCorner, { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4 }]} />
                                        <View style={[styles.cameraCorner, { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4 }]} />
                                        <View style={[styles.cameraCorner, { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4 }]} />
                                        <View style={[styles.cameraCorner, { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4 }]} />
                                    </View>
                                    <Text style={styles.cameraHint}>Center your card within the frame</Text>
                                </View>

                                <View style={styles.cameraFooter}>
                                    <TouchableOpacity style={styles.shutterBtn}>
                                        <View style={styles.shutterInner} />
                                    </TouchableOpacity>
                                </View>
                            </SafeAreaView>
                        </CameraView>
                    </View>
                ) : isCollections ? (
                    <View style={styles.settingsPage}>
                        <View style={styles.settingsHeader}>
                            <TouchableOpacity style={styles.backBtn} onPress={() => { setIsCollections(false); setIsSearching(false); setSearchQuery(''); }}>
                                <ArrowLeft color="#FFF" size={24} />
                            </TouchableOpacity>
                            {!isSearching ? (
                                <>
                                    <Text style={styles.settingsTitle}>My Collection</Text>
                                    <TouchableOpacity style={styles.headerIconBtn} onPress={() => setIsSearching(true)}>
                                        <Search color="#FFF" size={26} strokeWidth={1.5} />
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 8, paddingHorizontal: 12, marginLeft: 10, height: 44 }}>
                                    <Search color="rgba(255,255,255,0.4)" size={18} />
                                    <TextInput
                                        style={{ flex: 1, marginLeft: 10, color: '#FFF', fontSize: 15, paddingVertical: 0 }}
                                        placeholder="Search cards..."
                                        placeholderTextColor="rgba(255,255,255,0.3)"
                                        value={searchQuery}
                                        onChangeText={setSearchQuery}
                                        autoFocus
                                    />
                                    <TouchableOpacity onPress={() => { setIsSearching(false); setSearchQuery(''); }}>
                                        <X color="#FFF" size={20} />
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>

                        <View style={styles.dashContent}>
                            <View style={[styles.statsRow, { marginBottom: 35, alignItems: 'center' }]}>
                                <View style={styles.statBox}>
                                    <Text style={styles.statValSmall}>128</Text>
                                    <Text style={styles.statLabel}>Total Cards</Text>
                                </View>
                                <View style={styles.statBox}>
                                    <Text style={[styles.statVal, { color: COLORS.energy, fontSize: 32 }]}>$12.4k</Text>
                                    <Text style={[styles.statLabel, { color: 'rgba(255,255,255,0.6)' }]}>Est. Value</Text>
                                </View>
                                <View style={styles.statBox}>
                                    <Text style={styles.statValSmall}>+14%</Text>
                                    <Text style={styles.statLabel}>Growth</Text>
                                </View>
                            </View>

                            <View style={{ marginBottom: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <View style={{ flex: 1 }}>
                                    <ScrollView
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        contentContainerStyle={{ gap: 8 }}
                                    >
                                        {['All', 'Pokémon', 'Yu-Gi-Oh!', 'Magic', 'Sports'].map((cat, i) => (
                                            <TouchableOpacity
                                                key={i}
                                                onPress={() => setActiveCategory(cat)}
                                                style={[styles.filterTab, activeCategory === cat && styles.filterTabActive, { marginRight: 8 }]}
                                            >
                                                <Text style={[styles.filterText, activeCategory === cat && styles.filterTextActive, { fontSize: 12 }]}>{cat}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                                <TouchableOpacity
                                    style={[styles.layoutToggleBtn, { marginLeft: 15, backgroundColor: 'rgba(255,255,255,0.05)', width: 40, height: 40 }]}
                                    onPress={() => setGridColumns(gridColumns === 2 ? 3 : 2)}
                                >
                                    {gridColumns === 2 ? <Grid3 color={COLORS.energy} size={20} /> : <LayoutGrid color={COLORS.energy} size={20} />}
                                </TouchableOpacity>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                                <View style={styles.cardsGridWrap}>
                                    {[
                                        { name: 'Charizard VMAX', price: '$420', img: 'https://images.pokemontcg.io/swsh4/25.png', type: 'Pokémon' },
                                        { name: 'Mewtwo GX', price: '$180', img: 'https://images.pokemontcg.io/sm35/31.png', type: 'Pokémon' },
                                        { name: 'Pikachu V', price: '$85', img: 'https://images.pokemontcg.io/swsh4/44.png', type: 'Pokémon' },
                                        { name: 'Lugia VSTAR', price: '$210', img: 'https://images.pokemontcg.io/swsh12/139.png', type: 'Pokémon' },
                                        { name: 'Umbreon VMAX', price: '$650', img: 'https://images.pokemontcg.io/swsh7/215.png', type: 'Pokémon' },
                                        { name: 'Rayquaza VMAX', price: '$340', img: 'https://images.pokemontcg.io/swsh7/218.png', type: 'Pokémon' },
                                        { name: 'Dark Magician', price: '$120', img: 'https://images.ygoprodeck.com/images/cards/46986414.jpg', type: 'Yu-Gi-Oh!' },
                                    ].filter(c =>
                                        (activeCategory === 'All' || c.type === activeCategory) &&
                                        (c.name.toLowerCase().includes(searchQuery.toLowerCase()))
                                    ).map((card, idx) => (
                                        <TouchableOpacity
                                            key={idx}
                                            style={[
                                                styles.collectionCardItem,
                                                { width: gridColumns === 2 ? (width - 55) / 2 : (width - 70) / 3 }
                                            ]}
                                            activeOpacity={0.8}
                                        >
                                            <View style={[styles.collectionCardImg, { height: gridColumns === 2 ? 210 : 130, backgroundColor: 'rgba(255,255,255,0.03)', justifyContent: 'center', alignItems: 'center' }]}>
                                                {card.img ? (
                                                    <Image source={{ uri: card.img }} style={{ width: '100%', height: '100%', borderRadius: 6, resizeMode: 'contain' }} />
                                                ) : (
                                                    <Zap color="rgba(255,255,255,0.1)" size={gridColumns === 2 ? 40 : 24} />
                                                )}
                                            </View>
                                            <View style={styles.cardItemInfo}>
                                                <Text style={[styles.cardItemName, { fontSize: gridColumns === 2 ? 14 : 11 }]} numberOfLines={1}>{card.name}</Text>
                                                <Text style={[styles.cardItemPrice, { fontSize: gridColumns === 2 ? 13 : 10 }]}>{card.price}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </ScrollView>
                        </View>
                    </View>
                ) : isSettings ? (
                    <View style={styles.settingsPage}>
                        <View style={styles.settingsHeader}>
                            <TouchableOpacity style={styles.backBtn} onPress={() => setIsSettings(false)}>
                                <ArrowLeft color="#FFF" size={24} />
                            </TouchableOpacity>
                            <Text style={styles.settingsTitle}>Settings</Text>
                            <View style={{ width: 40 }} />
                        </View>

                        <View style={styles.settingsContent}>
                            <Text style={styles.settingsSectionTitle}>PREFERENCES</Text>
                            <View style={styles.settingsCard}>
                                <View style={styles.settingsItem}>
                                    <View style={styles.settingsIconBox}><Bell color={COLORS.energy} size={22} /></View>
                                    <View style={styles.settingsTextContent}>
                                        <Text style={styles.settingsLabel}>Notifications</Text>
                                        <Text style={styles.settingsSubLabel}>Manage app alerts</Text>
                                    </View>
                                    <View style={styles.switchWrapper}>
                                        <Switch
                                            value={notificationsEnabled}
                                            onValueChange={setNotificationsEnabled}
                                            trackColor={{ false: '#333', true: COLORS.energy }}
                                            thumbColor="#FFF"
                                        />
                                    </View>
                                </View>
                            </View>

                            <Text style={styles.settingsSectionTitle}>ACCOUNT & INFO</Text>
                            <View style={styles.settingsCardStack}>
                                {[
                                    { icon: <CreditCard color={COLORS.energy} size={22} />, label: 'Subscription', sub: 'Premium Plan active' },
                                    { icon: <ShieldCheck color={COLORS.energy} size={22} />, label: 'Privacy Policy', sub: 'Review our terms' },
                                    { icon: <Info color={COLORS.energy} size={22} />, label: 'About Us', sub: 'App Version 1.0.4' },
                                ].map((item, idx) => (
                                    <TouchableOpacity key={idx} style={[styles.settingsItem, idx === 2 && { borderBottomWidth: 0 }]} activeOpacity={0.7}>
                                        <View style={styles.settingsIconBox}>{item.icon}</View>
                                        <View style={styles.settingsTextContent}>
                                            <Text style={styles.settingsLabel}>{item.label}</Text>
                                            <Text style={styles.settingsSubLabel}>{item.sub}</Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </View>
                ) : isDashboard ? (
                    <View style={styles.dashboardContainer}>
                        <View style={styles.dashHeader}>
                            {!isSearching ? (
                                <>
                                    <TouchableOpacity style={styles.headerIconBtn} onPress={() => setIsSettings(true)}>
                                        <Settings color="#FFF" size={26} strokeWidth={1.5} />
                                    </TouchableOpacity>
                                    <View style={styles.headerCenter}>
                                        <Text style={styles.appName}>cardScan<Text style={{ color: COLORS.energy }}>Ai</Text></Text>
                                    </View>
                                    <TouchableOpacity style={styles.headerIconBtn} onPress={() => setIsSearching(true)}>
                                        <Search color="#FFF" size={28} strokeWidth={1.5} />
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 8, paddingHorizontal: 12, height: 44 }}>
                                    <Search color="rgba(255,255,255,0.4)" size={18} />
                                    <TextInput
                                        style={{ flex: 1, marginLeft: 10, color: '#FFF', fontSize: 15, paddingVertical: 0 }}
                                        placeholder="Search sets or cards..."
                                        placeholderTextColor="rgba(255,255,255,0.3)"
                                        value={searchQuery}
                                        onChangeText={setSearchQuery}
                                        autoFocus
                                    />
                                    <TouchableOpacity onPress={() => { setIsSearching(false); setSearchQuery(''); }}>
                                        <X color="#FFF" size={20} />
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>

                        <ScrollView style={styles.dashContent} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
                            <View style={styles.heroStats}>
                                <Text style={styles.heroLabel}>Estimated Portfolio Value</Text>
                                <Text style={styles.heroPrice}>$12,480.<Text style={{ fontSize: 28 }}>50</Text></Text>
                                <View style={styles.heroTrend}>
                                    <Text style={styles.trendText}>+14.2% (+$1,540) this month</Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={styles.collectionsShortcut}
                                activeOpacity={0.8}
                                onPress={() => setIsCollections(true)}
                            >
                                <View>
                                    <Text style={styles.shortcutTitle}>My Collections</Text>
                                    <Text style={styles.shortcutSub}>4 Folders • 128 Cards</Text>
                                </View>
                                <Star color={COLORS.energy} size={42} fill={COLORS.energy} />
                            </TouchableOpacity>

                            <View style={{ marginTop: 10, paddingBottom: 20 }}>
                                <View style={styles.collectionsHeader}>
                                    <Text style={styles.sectionTitle}>MEGA EVOLUTION ERA</Text>
                                    <TouchableOpacity onPress={() => setIsCollections(true)}>
                                        <Text style={{ color: COLORS.energy, fontSize: 12, fontWeight: '700' }}>See All</Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.setsGrid}>
                                    {[
                                        { name: 'Primal Clash', count: 42, total: 160, logo: 'https://images.pokemontcg.io/xy5/logo.png', color: '#00f2fe' },
                                        { name: 'Roaring Skies', count: 12, total: 108, logo: 'https://images.pokemontcg.io/xy6/logo.png', color: '#FF416C' },
                                        { name: 'Ancient Origins', count: 5, total: 98, logo: 'https://images.pokemontcg.io/xy7/logo.png', color: '#f093fb' },
                                    ].filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase())).map((set, idx) => (
                                        <TouchableOpacity key={idx} style={styles.setCard} onPress={() => setIsCollections(true)}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <View style={styles.setLogoContainer}>
                                                    <Image source={{ uri: set.logo }} style={styles.setLogo} />
                                                </View>
                                                <View style={{ flex: 1 }}>
                                                    <View style={styles.setCardInfo}>
                                                        <Text style={styles.setCardName}>{set.name}</Text>
                                                        <Text style={styles.setCardCount}>{set.count}/{set.total}</Text>
                                                    </View>
                                                    <View style={styles.progressContainer}>
                                                        <View style={styles.progressBarBg}>
                                                            <View style={[styles.progressBarFill, { width: `${(set.count / set.total) * 100}%`, backgroundColor: set.color }]} />
                                                        </View>
                                                        <Text style={styles.progressPct}>{Math.round((set.count / set.total) * 100)}%</Text>
                                                    </View>
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <View style={[styles.collectionsHeader, { marginTop: 30 }]}>
                                    <Text style={styles.sectionTitle}>POKEMON TCG POCKET</Text>
                                    <TouchableOpacity onPress={() => setIsCollections(true)}>
                                        <Text style={{ color: COLORS.energy, fontSize: 12, fontWeight: '700' }}>See All</Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.setsGrid}>
                                    {[
                                        { name: 'Genetic Apex', count: 182, total: 226, logo: 'https://images.pokemontcg.io/a1/logo.png', color: COLORS.energy },
                                        { name: 'Mythical Island', count: 42, total: 86, logo: 'https://images.pokemontcg.io/sm3/logo.png', color: '#4facfe' },
                                    ].filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase())).map((set, idx) => (
                                        <TouchableOpacity key={idx} style={styles.setCard} onPress={() => setIsCollections(true)}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <View style={styles.setLogoContainer}>
                                                    <Image source={{ uri: set.logo }} style={styles.setLogo} />
                                                </View>
                                                <View style={{ flex: 1 }}>
                                                    <View style={styles.setCardInfo}>
                                                        <Text style={styles.setCardName}>{set.name}</Text>
                                                        <Text style={styles.setCardCount}>{set.count}/{set.total}</Text>
                                                    </View>
                                                    <View style={styles.progressContainer}>
                                                        <View style={styles.progressBarBg}>
                                                            <View style={[styles.progressBarFill, { width: `${(set.count / set.total) * 100}%`, backgroundColor: set.color }]} />
                                                        </View>
                                                        <Text style={styles.progressPct}>{Math.round((set.count / set.total) * 100)}%</Text>
                                                    </View>
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        </ScrollView>

                        <View style={styles.fabContainer}>
                            <TouchableOpacity activeOpacity={0.8} onPress={async () => {
                                if (!permission || !permission.granted) {
                                    const res = await requestPermission();
                                    if (res.granted) setIsCamera(true);
                                } else {
                                    setIsCamera(true);
                                }
                            }}>
                                <LinearGradient colors={[COLORS.primaryViolet, COLORS.energy]} style={styles.fabBtn}>
                                    <Scan color="#FFF" size={32} strokeWidth={2.5} />
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <>
                        <View style={styles.contentContainer}>
                            <View style={styles.topSection}>
                                <View style={styles.cardsWrapper}>
                                    <Animated.View style={[styles.sideCard, { opacity: sideCardsOpacity, zIndex: 3, transform: [{ translateX: outerLeftX }, { scale: 0.72 }, { rotate: outerLeftRotate }] }]}><Image source={{ uri: 'https://images.pokemontcg.io/base1/10.png' }} style={styles.cardImg} /></Animated.View>
                                    <Animated.View style={[styles.sideCard, { opacity: sideCardsOpacity, zIndex: 4, transform: [{ translateX: innerLeftX }, { scale: 0.72 }, { rotate: innerLeftRotate }] }]}><Image source={{ uri: 'https://images.pokemontcg.io/base1/2.png' }} style={styles.cardImg} /></Animated.View>
                                    <Animated.View style={[styles.sideCard, { opacity: sideCardsOpacity, zIndex: 3, transform: [{ translateX: outerRightX }, { scale: 0.72 }, { rotate: outerRightRotate }] }]}><Image source={{ uri: 'https://images.pokemontcg.io/base1/6.png' }} style={styles.cardImg} /></Animated.View>
                                    <Animated.View style={[styles.sideCard, { opacity: sideCardsOpacity, zIndex: 4, transform: [{ translateX: innerRightX }, { scale: 0.72 }, { rotate: innerRightRotate }] }]}><Image source={{ uri: 'https://images.pokemontcg.io/base1/15.png' }} style={styles.cardImg} /></Animated.View>

                                    <Animated.View style={[styles.scannerInterface, { zIndex: 10, transform: [{ scale: cardScale }] }]}>
                                        <Animated.View style={[StyleSheet.absoluteFill, { opacity: cornerOpacity, zIndex: 20 }]}>
                                            <View style={[styles.corner, styles.tl]} /><View style={[styles.corner, styles.tr]} /><View style={[styles.corner, styles.bl]} /><View style={[styles.corner, styles.br]} />
                                        </Animated.View>
                                        <View style={styles.scanFrame}>
                                            <Image
                                                source={{ uri: 'https://images.pokemontcg.io/base1/4.png' }} // Standard res is faster than hi-res
                                                style={[styles.cardImg, { opacity: 1 }]}
                                                blurRadius={step === 2 ? 0 : 5}
                                            />
                                            {step === 0 && <Animated.View style={[styles.laser, { transform: [{ translateY: scanY }], opacity: laserOpacity }]} />}
                                            {step === 1 && (
                                                <Animated.View style={[styles.resultHUD, { opacity: priceFadeAnim }]}>
                                                    <View style={styles.priceLabelHUDContainer}><Text style={styles.priceLabelHUD}>ESTIMATED VALUE</Text></View>
                                                    <Text style={styles.priceTextMain}>$420.<Text style={{ fontSize: 24 }}>69</Text></Text>
                                                    <View style={styles.gradeBadgePremium}><Text style={styles.gradeTextPremium}>PSA 10 GEM MT</Text></View>
                                                </Animated.View>
                                            )}
                                        </View>
                                    </Animated.View>
                                </View>
                            </View>

                            <View style={styles.titleSection}>
                                <Animated.View style={[styles.titleLayer, { opacity: title1Opacity, transform: [{ translateY: titleSlideY }] }]}>
                                    <Text style={styles.titleText}>SCAN <Text style={{ color: COLORS.energy }}>TCG</Text></Text><Text style={styles.titleText}>CARDS</Text>
                                </Animated.View>
                                <Animated.View style={[styles.titleLayer, { opacity: title2Opacity, transform: [{ translateY: titleSlideY }] }]}>
                                    <Text style={styles.titleText}>GET <Text style={{ color: COLORS.energy }}>CURRENT</Text></Text><Text style={styles.titleText}>MARKET PRICES</Text>
                                </Animated.View>
                                <Animated.View style={[styles.titleLayer, { opacity: title3Opacity, transform: [{ translateY: titleSlideY }] }]}>
                                    <Text style={styles.titleText}>BUILD YOUR <Text style={{ color: COLORS.energy }}>OWN</Text></Text><Text style={styles.titleText}>COLLECTIONS</Text>
                                </Animated.View>
                            </View>
                        </View>

                        <View style={styles.bottomSection}>
                            <TouchableOpacity activeOpacity={0.9} onPress={handleNext}>
                                <LinearGradient colors={[COLORS.primaryViolet, COLORS.energy]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.btn}>
                                    <Text style={styles.btnText}>CONTINUE</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </SafeAreaView>

            {/* NATIVE MODAL FOR PAYWALL */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={paywallVisible}
                onRequestClose={() => {
                    setPaywallVisible(false);
                    setIsDashboard(true);
                }}
            >
                <View style={styles.paywallOverlay}>
                    <LinearGradient colors={[COLORS.deepViolet, COLORS.bg]} style={StyleSheet.absoluteFill} />

                    {/* Subtle Mesh in Paywall */}
                    <View pointerEvents="none" style={[styles.meshContainer, { opacity: 0.4 }]}>
                        <Svg height="100%" width="100%">
                            {[...Array(15)].map((_, i) => (
                                <Rect key={`p-h-${i}`} x="0" y={(height / 15) * i} width={width} height="0.8" fill="url(#meshGrad)" />
                            ))}
                            {[...Array(8)].map((_, i) => (
                                <Rect key={`p-v-${i}`} x={(width / 8) * i} y="0" width="0.8" height={height} fill="url(#meshGrad)" />
                            ))}
                        </Svg>
                    </View>

                    <SafeAreaView style={{ flex: 1, zIndex: 10 }}>
                        <TouchableOpacity style={styles.closeBtn} onPress={() => {
                            setPaywallVisible(false);
                            setIsDashboard(true);
                        }}>
                            <Text style={styles.closeBtnText}>✕</Text>
                        </TouchableOpacity>

                        <View style={styles.paywallHeader}>
                            <Text style={styles.paywallTitle}>GO <Text style={{ color: COLORS.energy }}>PREMIUM</Text></Text>
                            <Text style={styles.paywallSubtitle}>Unlock legendary powers and build the ultimate collection</Text>
                        </View>

                        <View style={styles.paywallBody}>
                            <View style={styles.featureList}>
                                {['Unlimited Card Scans', 'Real-time Price Tracking', 'Create 5+ Collections', 'Ad-Free Experience'].map((feat, i) => (
                                    <View key={i} style={styles.featureItem}>
                                        <View style={styles.checkInner}><Text style={styles.checkText}>✓</Text></View>
                                        <Text style={styles.featureText}>{feat}</Text>
                                    </View>
                                ))}
                            </View>
                            <View style={styles.planGrid}>
                                <TouchableOpacity style={styles.planBox} activeOpacity={0.8}>
                                    <View style={styles.popularBadge}><Text style={styles.popularText}>MOST POPULAR</Text></View>
                                    <Text style={styles.planTag}>WEEKLY</Text>
                                    <View style={styles.priceRow}>
                                        <Text style={styles.planCurrency}>$</Text>
                                        <Text style={styles.planAmt}>4.99</Text>
                                    </View>
                                    <Text style={styles.planDesc}>3-Day Free Trial</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={[styles.planBox, styles.planBoxActive]} activeOpacity={0.8}>
                                    <LinearGradient colors={[COLORS.primaryViolet, COLORS.energy]} style={StyleSheet.absoluteFill} />
                                    <View style={styles.bestValueBadge}><Text style={styles.bestValueText}>LIMITED: 80% OFF</Text></View>
                                    <Text style={[styles.planTag, { color: '#000' }]}>YEARLY</Text>
                                    <View style={styles.priceRow}>
                                        <Text style={[styles.planCurrency, { color: '#000' }]}>$</Text>
                                        <Text style={[styles.planAmt, { color: '#000' }]}>29.99</Text>
                                    </View>
                                    <Text style={[styles.planDesc, { color: 'rgba(0,0,0,0.6)' }]}>Best Value Choice</Text>
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity style={styles.payBtn} activeOpacity={0.9}>
                                <LinearGradient colors={['#FFF', '#DDD']} style={styles.payBtnGradient}>
                                    <Text style={styles.payBtnText}>START 3 DAYS FREE</Text>
                                </LinearGradient>
                            </TouchableOpacity>

                            <Text style={styles.terms}>Auto-renews. Cancel anytime in account settings.</Text>

                            <View style={styles.footerLinks}>
                                <Text style={styles.footerLink}>Terms</Text>
                                <Text style={styles.footerLink}>Privacy</Text>
                                <Text style={styles.footerLink}>Restore</Text>
                            </View>
                        </View>
                    </SafeAreaView>
                </View>
            </Modal>

        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    meshContainer: { ...StyleSheet.absoluteFillObject },
    safeArea: { flex: 1, zIndex: 10 },
    contentContainer: { flex: 1, justifyContent: 'flex-start', paddingTop: 80, alignItems: 'center' },

    dashboardContainer: { flex: 1, width: '100%', paddingHorizontal: 20 },
    dashHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 60, marginTop: 10, position: 'relative' },
    headerCenter: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', zIndex: -1 },
    appName: { color: '#FFF', fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
    dashTitle: { color: '#FFF', fontSize: 20, fontWeight: '900', letterSpacing: 0.5 },
    headerIconBtn: { padding: 10, zIndex: 10 },
    dashContent: { flex: 1, paddingTop: 20 },
    statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 35 },
    statBox: { flex: 1, alignItems: 'center' },
    statVal: { color: '#FFF', fontSize: 24, fontWeight: '900' },
    statLabel: { color: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: '700', marginTop: 4, letterSpacing: 1 },
    collectionsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    sectionTitle: { color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: '900', letterSpacing: 2 },
    addFolderBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(139, 92, 246, 0.1)', justifyContent: 'center', alignItems: 'center' },
    collectionsGrid: { gap: 15 },
    collectionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 },
    folderIcon: { width: 56, height: 56, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    collectionInfo: { flex: 1 },
    colTitle: { color: '#FFF', fontSize: 17, fontWeight: '700' },
    colSub: { color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 4 },
    fabContainer: { position: 'absolute', bottom: 40, left: 0, right: 0, alignItems: 'center', zIndex: 100 },
    fabBtn: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', shadowColor: COLORS.energy, shadowOpacity: 0.6, shadowRadius: 20, elevation: 10 },
    heroStats: { backgroundColor: 'rgba(91, 33, 182, 0.25)', padding: 24, borderRadius: 8, marginBottom: 20, shadowColor: COLORS.primaryViolet, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 15 },
    heroLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: '700', letterSpacing: 1 },
    heroPrice: { color: '#FFF', fontSize: 42, fontWeight: '900', marginTop: 8 },
    heroTrend: { marginTop: 12 },
    trendText: { color: COLORS.energy, fontSize: 14, fontWeight: '600' },

    collectionsShortcut: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)', paddingVertical: 28, paddingHorizontal: 22, borderRadius: 8, marginBottom: 35, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
    shortcutIcon: { width: 48, height: 48, borderRadius: 8, backgroundColor: 'rgba(139, 92, 246, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    shortcutInfo: { alignItems: 'center' },
    shortcutTitle: { color: '#FFF', fontSize: 20, fontWeight: '800', letterSpacing: 1 },
    shortcutSub: { color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 4, fontWeight: '600' },

    recentGrid: { flexDirection: 'row', gap: 15 },
    recentCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
    recentImg: { width: '100%', height: 160, borderRadius: 8, marginBottom: 12 },
    recentInfo: { paddingHorizontal: 4 },
    recentName: { color: '#FFF', fontSize: 14, fontWeight: '700' },
    recentPrice: { color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 4 },

    topSection: { alignItems: 'center', justifyContent: 'center' },
    cardsWrapper: { width: width, height: CARD_HEIGHT, alignItems: 'center', justifyContent: 'center' },
    scannerInterface: { width: CARD_WIDTH, height: CARD_HEIGHT, justifyContent: 'center', alignItems: 'center' },
    sideCard: { position: 'absolute', width: CARD_WIDTH, height: CARD_HEIGHT },
    scanFrame: { width: '100%', height: '100%', borderRadius: 12, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
    cardImg: { width: '100%', height: '100%', resizeMode: 'cover' },
    laser: { position: 'absolute', top: 0, left: 0, right: 0, height: 4, backgroundColor: COLORS.energy, shadowColor: COLORS.energy, shadowOpacity: 1, shadowRadius: 10, zIndex: 20 },
    corner: { position: 'absolute', width: 30, height: 30, borderColor: COLORS.energy, borderWidth: 3, zIndex: 20 },
    tl: { top: -15, left: -15, borderBottomWidth: 0, borderRightWidth: 0 },
    tr: { top: -15, right: -15, borderBottomWidth: 0, borderLeftWidth: 0 },
    bl: { bottom: -15, left: -15, borderTopWidth: 0, borderRightWidth: 0 },
    br: { bottom: -15, right: -15, borderTopWidth: 0, borderLeftWidth: 0 },

    resultHUD: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', zIndex: 35 },
    priceLabelHUDContainer: { backgroundColor: COLORS.energy, paddingHorizontal: 12, paddingVertical: 4, marginBottom: 8 },
    priceLabelHUD: { color: '#000', fontSize: 10, fontWeight: '900', letterSpacing: 2 },
    priceTextMain: { color: '#FFF', fontSize: 50, fontWeight: '900', textShadowColor: COLORS.energy, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 20 },
    gradeBadgePremium: { marginTop: 15, backgroundColor: COLORS.success, paddingHorizontal: 15, paddingVertical: 6 },
    gradeTextPremium: { color: '#000', fontSize: 13, fontWeight: '900' },

    titleSection: { marginTop: 60, height: 80, alignItems: 'center', justifyContent: 'center', width: '100%' },
    titleLayer: { position: 'absolute', width: '100%', alignItems: 'center' },
    titleText: { fontSize: 34, fontWeight: '900', color: '#FFF', letterSpacing: -1.5, lineHeight: 34 },

    bottomSection: { paddingHorizontal: 25, paddingBottom: 20 },
    btn: { height: 60, justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
    btnText: { color: '#FFF', fontSize: 18, fontWeight: '900', letterSpacing: 2 },

    paywallOverlay: { flex: 1, backgroundColor: COLORS.bg },
    closeBtn: { alignSelf: 'flex-end', padding: 20, marginTop: 50, zIndex: 110 },
    closeBtnText: { color: '#FFF', fontSize: 24, fontWeight: '300' },
    paywallHeader: { alignItems: 'center', marginTop: 100, marginBottom: 30 },
    paywallTitle: { fontSize: 44, fontWeight: '900', color: '#FFF', textAlign: 'center' },
    paywallSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.4)', textAlign: 'center', paddingHorizontal: 50, marginTop: 12 },
    paywallBody: { paddingHorizontal: 25, marginTop: 50 },
    featureList: { marginBottom: 30, gap: 12 },
    featureItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    checkInner: { width: 18, height: 18, borderRadius: 9, backgroundColor: COLORS.energy, justifyContent: 'center', alignItems: 'center' },
    checkText: { color: '#000', fontSize: 11, fontWeight: '900' },
    featureText: { color: '#FFF', fontSize: 14, fontWeight: '500', opacity: 0.9 },

    setsGrid: { gap: 12 },
    setCard: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 12 },
    setLogoContainer: { width: 50, height: 50, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 15, padding: 4 },
    setLogo: { width: '100%', height: '100%', resizeMode: 'contain' },
    setCardInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    setCardName: { color: '#FFF', fontSize: 13, fontWeight: '700' },
    setCardCount: { color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: '600' },
    progressContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    progressBarBg: { flex: 1, height: 6, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' },
    progressBarFill: { height: '100%', borderRadius: 3 },
    progressPct: { color: '#FFF', fontSize: 12, fontWeight: '800', width: 35, textAlign: 'right' },

    planGrid: { flexDirection: 'row', gap: 12, marginBottom: 20 },
    bestValueBadge: { position: 'absolute', top: 5, right: 5, backgroundColor: '#000', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, zIndex: 10 },
    popularBadge: { position: 'absolute', top: 5, right: 5, backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    popularText: { color: COLORS.energy, fontSize: 6, fontWeight: '900' },
    bestValueText: { color: COLORS.energy, fontSize: 6, fontWeight: '900' },
    planBox: { flex: 1, height: 125, backgroundColor: 'rgba(255,255,255,0.05)', padding: 12, justifyContent: 'center', overflow: 'hidden', borderRadius: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
    priceRow: { flexDirection: 'row', alignItems: 'flex-start', marginVertical: 2 },
    planCurrency: { fontSize: 14, fontWeight: '900', color: COLORS.energy, marginTop: 4 },
    planAmt: { fontSize: 32, fontWeight: '900', color: '#FFF' },
    planBoxActive: { borderColor: COLORS.energy, transform: [{ scale: 1.02 }] },
    planTag: { fontSize: 11, fontWeight: '900', color: COLORS.energy, marginBottom: 4 },
    planDesc: { fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 4 },
    payBtn: { height: 60, marginTop: 10, borderRadius: 12, overflow: 'hidden' },
    payBtnGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    payBtnText: { color: '#000', fontSize: 16, fontWeight: '900', letterSpacing: 1 },
    terms: { color: 'rgba(255,255,255,0.3)', fontSize: 11, textAlign: 'center', marginTop: 20 },
    footerLinks: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 25 },
    footerLink: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },

    settingsPage: { flex: 1, paddingHorizontal: 20 },
    settingsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 60, marginTop: 10, marginBottom: 20 },
    backBtn: { padding: 10, marginLeft: -10 },
    settingsTitle: { color: '#FFF', fontSize: 20, fontWeight: '900', letterSpacing: 0.5 },
    settingsContent: { flex: 1 },
    settingsSectionTitle: { color: COLORS.energy, fontSize: 13, fontWeight: '800', marginBottom: 15, letterSpacing: 1.5, opacity: 0.8 },
    settingsCard: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 8, paddingHorizontal: 16, marginBottom: 25, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 },
    settingsCardStack: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 8, paddingHorizontal: 16, marginBottom: 25, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 },
    settingsItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
    settingsIconBox: { width: 44, height: 44, borderRadius: 8, backgroundColor: 'rgba(139, 92, 246, 0.08)', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    settingsTextContent: { flex: 1 },
    settingsLabel: { color: '#FFF', fontSize: 17, fontWeight: '600', letterSpacing: 0.3 },
    settingsSubLabel: { color: 'rgba(255,255,255,0.35)', fontSize: 12, marginTop: 3 },
    switchWrapper: { height: 30, justifyContent: 'center' },
    layoutToggleBtn: { width: 44, height: 44, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center' },

    cameraContainer: { flex: 1, backgroundColor: '#000' },
    camera: { flex: 1 },
    cameraOverlay: { flex: 1, justifyContent: 'space-between' },
    cameraHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10 },
    cameraCloseBtn: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
    cameraActions: { flexDirection: 'row', gap: 15 },
    cameraActionBtn: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
    cameraFocusContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    cameraFocusFrame: { width: CARD_WIDTH, height: CARD_HEIGHT, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', position: 'relative' },
    cameraCorner: { position: 'absolute', width: 40, height: 40, borderColor: COLORS.energy },
    cameraHint: { color: '#FFF', marginTop: 30, fontSize: 16, fontWeight: '600', textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 },
    cameraFooter: { paddingBottom: 40, alignItems: 'center' },
    shutterBtn: { width: 80, height: 80, borderRadius: 40, borderWidth: 4, borderColor: '#FFF', justifyContent: 'center', alignItems: 'center' },
    shutterInner: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#FFF' },

    filterTab: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    filterTabActive: { backgroundColor: COLORS.energy, borderColor: COLORS.energy },
    filterText: { color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: '700', textAlign: 'center' },
    filterTextActive: { color: '#000' },

    cardsGridWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 15, justifyContent: 'space-between' },
    collectionCardItem: { width: (width - 55) / 2, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: 10, marginBottom: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
    collectionCardImg: { width: '100%', height: 210, borderRadius: 6, resizeMode: 'contain' },
    cardItemInfo: { marginTop: 10, paddingHorizontal: 2 },
    cardItemName: { color: '#FFF', fontSize: 14, fontWeight: '800' },
    cardItemPrice: { color: COLORS.energy, fontSize: 13, fontWeight: '700', marginTop: 3 },
    statValSmall: { color: '#FFF', fontSize: 18, fontWeight: '800' }
});
