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
    Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Menu, Search, Scan, Settings, Bell, Info, CreditCard, ShieldCheck, LogOut, ArrowLeft, ChevronRight } from 'lucide-react-native';
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

            <View pointerEvents="none" style={[styles.meshContainer, { opacity: 0.4 }]}>
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
                {isSettings ? (
                    <View style={styles.settingsPage}>
                        <View style={styles.settingsHeader}>
                            <TouchableOpacity style={styles.backBtn} onPress={() => setIsSettings(false)}>
                                <ArrowLeft color="#FFF" size={24} />
                            </TouchableOpacity>
                            <Text style={styles.settingsTitle}>Settings</Text>
                            <View style={{ width: 40 }} />
                        </View>

                        <View style={styles.settingsContent}>
                            {[
                                { icon: <Bell color={COLORS.energy} size={22} />, label: 'Notifications', sub: 'Manage alerts and updates' },
                                { icon: <CreditCard color={COLORS.energy} size={22} />, label: 'Subscription', sub: 'Manage your premium plan' },
                                { icon: <ShieldCheck color={COLORS.energy} size={22} />, label: 'Privacy Policy', sub: 'Terms and data usage' },
                                { icon: <Info color={COLORS.energy} size={22} />, label: 'About Us', sub: 'Version 1.0.4' },
                            ].map((item, idx) => (
                                <TouchableOpacity key={idx} style={styles.settingsItem}>
                                    <View style={styles.settingsIconBox}>{item.icon}</View>
                                    <View style={styles.settingsTextContent}>
                                        <Text style={styles.settingsLabel}>{item.label}</Text>
                                        <Text style={styles.settingsSubLabel}>{item.sub}</Text>
                                    </View>
                                    <ChevronRight color="rgba(255,255,255,0.2)" size={20} />
                                </TouchableOpacity>
                            ))}

                            <TouchableOpacity style={styles.dangerItem}>
                                <LogOut color="#ef4444" size={22} />
                                <Text style={styles.dangerText}>Log Out</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : isDashboard ? (
                    <View style={styles.dashboardContainer}>
                        <View style={styles.dashHeader}>
                            <TouchableOpacity style={styles.headerIconBtn} onPress={() => setIsSettings(true)}>
                                <Settings color="#FFF" size={26} strokeWidth={1.5} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.headerIconBtn}><Search color="#FFF" size={28} strokeWidth={1.5} /></TouchableOpacity>
                        </View>

                        <View style={styles.dashContent} />

                        <View style={styles.fabContainer}>
                            <TouchableOpacity activeOpacity={0.8} onPress={() => setIsDashboard(false)}>
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
    dashHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 60, marginTop: 10 },
    headerIconBtn: { padding: 10 },
    dashContent: { flex: 1 },
    fabContainer: { position: 'absolute', bottom: 40, left: 0, right: 0, alignItems: 'center' },
    fabBtn: { width: 75, height: 75, borderRadius: 37.5, justifyContent: 'center', alignItems: 'center', shadowColor: COLORS.energy, shadowOpacity: 0.6, shadowRadius: 20, elevation: 10, borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)' },

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
    planGrid: { flexDirection: 'row', gap: 12, marginBottom: 20 },
    bestValueBadge: { position: 'absolute', top: 5, right: 5, backgroundColor: '#000', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, zIndex: 10 },
    popularBadge: { position: 'absolute', top: 5, right: 5, backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    popularText: { color: COLORS.energy, fontSize: 6, fontWeight: '900' },
    bestValueText: { color: COLORS.energy, fontSize: 6, fontWeight: '900' },
    planBox: { flex: 1, height: 125, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', padding: 12, justifyContent: 'center', overflow: 'hidden', borderRadius: 16 },
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
    settingsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 60, marginTop: 10 },
    backBtn: { padding: 8 },
    settingsTitle: { color: '#FFF', fontSize: 22, fontWeight: '900', letterSpacing: 0.5 },
    settingsContent: { marginTop: 30, gap: 10 },
    settingsItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    settingsIconBox: { width: 42, height: 42, borderRadius: 12, backgroundColor: 'rgba(139, 92, 246, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    settingsTextContent: { flex: 1 },
    settingsLabel: { color: '#FFF', fontSize: 16, fontWeight: '600' },
    settingsSubLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2 },
    dangerItem: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 20, padding: 16, borderRadius: 16, backgroundColor: 'rgba(239, 68, 68, 0.05)' },
    dangerText: { color: '#ef4444', fontSize: 16, fontWeight: '600' }
});
