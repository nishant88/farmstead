import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useStore } from '../../store/useStore';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { AlertBanner } from '../../components/AlertBanner';
import { SpendRevenueBar } from '../../components/VisualChart';
import { ModuleQuickSwitcher } from '../../components/ModuleQuickSwitcher';

export default function DashboardScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const {
    language,
    blocks,
    expenses,
    revenues,
    insurancePolicies,
    weatherAlerts,
    stockItems,
    harvestBatches,
    chillingHoursAccumulated,
    chillingHoursTarget,
    selectedVarietyForChilling,
  } = useStore();

  // Financial calculations
  const totalSpend = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const totalRevenue = revenues.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const rawNetMargin = totalRevenue - totalSpend;

  const totalInsuranceClaims = insurancePolicies.reduce(
    (acc, curr) => acc + (curr.claimAmountLogged || 0),
    0
  );
  const insuranceAdjustedMargin = rawNetMargin + totalInsuranceClaims;

  const seasonalBudget = 180000;
  const budgetUsedPercent = Math.min(100, Math.round((totalSpend / seasonalBudget) * 100));

  // Unit Economics
  const totalTrees = blocks.reduce((acc, curr) => acc + curr.treeCount, 0);
  const totalHarvestKg = harvestBatches.reduce((acc, curr) => acc + curr.totalKg, 0) || 10900;
  const costPerTree = totalTrees > 0 ? Math.round(totalSpend / totalTrees) : 0;
  const costPerKg = totalHarvestKg > 0 ? (totalSpend / totalHarvestKg).toFixed(1) : '0';
  const revenuePerKg = totalHarvestKg > 0 ? (totalRevenue / totalHarvestKg).toFixed(1) : '0';
  const marginPerKg = (Number(revenuePerKg) - Number(costPerKg)).toFixed(1);

  const activeAlerts = weatherAlerts.filter((a) => !a.isDismissed);
  const lowStockItems = stockItems.filter(
    (item) => item.currentQuantity <= item.reorderThreshold
  );

  return (
    <View style={styles.screen}>
      <Header
        title={language === 'hi' ? 'ऑर्चर्ड लेजर' : 'Orchard Ledger'}
        subtitle={
          language === 'hi'
            ? 'सेब बागवानी वित्तीय और मौसम जोखिम प्रबंधन'
            : 'Season 2026 • Kotgarh & Thanedar Valleys (2,050m)'
        }
        rightAction={
          <View style={styles.headerSeasonTag}>
            <Text style={styles.headerSeasonText}>
              {language === 'hi' ? 'पिंक बड चरण' : 'Pink Bud Stage'}
            </Text>
          </View>
        }
      />

      <ModuleQuickSwitcher currentTab="index" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Consolidated Dismissible Alerts Panel */}
        {activeAlerts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.alertTitleGroup}>
                <Text style={styles.sectionTitle}>
                  {language === 'hi' ? '⚠️ प्राथमिक जोखिम अलर्ट' : '⚠️ Active Risk Alerts'}
                </Text>
                <View style={styles.alertCountBadge}>
                  <Text style={styles.alertCountBadgeText}>{activeAlerts.length}</Text>
                </View>
              </View>
              <Text style={styles.sectionSubtext}>
                {language === 'hi' ? '✕ टैप कर हटाएं' : 'Tap ✕ to dismiss'}
              </Text>
            </View>
            <View style={styles.alertsList}>
              {activeAlerts.map((alert) => (
                <AlertBanner
                  key={alert.id}
                  alert={alert}
                  onAction={() => {
                    if (alert.actionRoute) {
                      router.push(`/(tabs)/${alert.actionRoute}` as any);
                    }
                  }}
                />
              ))}
            </View>
          </View>
        )}

        {/* 1. Main KPI Row (2x2 on Mobile, 4-in-a-row on Desktop) */}
        <View style={[styles.kpiGrid, isDesktop && styles.kpiGridDesktop]}>
          <Card style={[styles.kpiCard, isDesktop && styles.kpiCardDesktop]}>
            <Text style={styles.kpiLabel}>{language === 'hi' ? 'सीजन खर्च' : 'Season Spend'}</Text>
            <Text style={[styles.kpiValue, { color: '#b91c1c' }]}>
              ₹{totalSpend.toLocaleString('en-IN')}
            </Text>
            <Text style={styles.kpiSub}>
              {language === 'hi' ? `बजट उपयोग: ${budgetUsedPercent}%` : `Budget used: ${budgetUsedPercent}% of ₹1.8L`}
            </Text>
          </Card>

          <Card style={[styles.kpiCard, isDesktop && styles.kpiCardDesktop]}>
            <Text style={styles.kpiLabel}>{language === 'hi' ? 'सीजन राजस्व' : 'Season Revenue'}</Text>
            <Text style={[styles.kpiValue, { color: '#15803d' }]}>
              ₹{totalRevenue.toLocaleString('en-IN')}
            </Text>
            <Text style={styles.kpiSub}>
              {language === 'hi'
                ? `${totalHarvestKg.toLocaleString()} किग्रा बिक्री से`
                : `From ${totalHarvestKg.toLocaleString()} kg sold`}
            </Text>
          </Card>

          <Card style={[styles.kpiCard, isDesktop && styles.kpiCardDesktop]}>
            <Text style={styles.kpiLabel}>{language === 'hi' ? 'शुद्ध मार्जिन' : 'Net Margin (Raw)'}</Text>
            <Text
              style={[
                styles.kpiValue,
                { color: rawNetMargin >= 0 ? '#166534' : '#991b1b' },
              ]}>
              ₹{rawNetMargin.toLocaleString('en-IN')}
            </Text>
            <Text style={styles.kpiSub}>
              {language === 'hi' ? 'बीमा दावों के बिना' : 'Excl. claims'}
            </Text>
          </Card>

          <Card
            style={[
              styles.kpiCard,
              isDesktop && styles.kpiCardDesktop,
              { backgroundColor: '#f0fdf4', borderColor: '#86efac' },
            ]}>
            <View style={styles.insuranceTag}>
              <Text style={styles.insuranceTagText}>
                {language === 'hi' ? 'PMFBY समायोजित' : 'PMFBY ADJUSTED'}
              </Text>
            </View>
            <Text style={[styles.kpiValue, { color: '#166534' }]}>
              ₹{insuranceAdjustedMargin.toLocaleString('en-IN')}
            </Text>
            <Text style={styles.kpiSub}>
              {language === 'hi'
                ? `₹${totalInsuranceClaims.toLocaleString()} दावा शामिल`
                : `+₹${totalInsuranceClaims.toLocaleString()} payout`}
            </Text>
          </Card>
        </View>

        {/* Visual Comparison: Spend vs Revenue vs Budget */}
        <Card
          title={language === 'hi' ? 'राजस्व बनाम खर्च' : 'Financial Health: Revenue vs Spend'}
          subtitle={language === 'hi' ? 'सीजन की प्रगति' : 'Visual progress against ₹1.8L budget ceiling'}>
          <SpendRevenueBar spend={totalSpend} revenue={totalRevenue} budget={seasonalBudget} />
        </Card>

        {/* 2. Unit Economics & Block Comparison */}
        <View style={isDesktop ? styles.desktopTwoCol : styles.mobileStack}>
          <View style={styles.col}>
            <Card
              title={language === 'hi' ? 'प्रति पेड़ एवं प्रति किग्रा लागत' : 'Unit Economics & Margins'}
              badge={language === 'hi' ? 'मानदंड' : 'Benchmarked'}>
              <View style={styles.metricRow}>
                <View style={styles.metricBox}>
                  <Text style={styles.metricVal}>₹{costPerTree}</Text>
                  <Text style={styles.metricDesc}>{language === 'hi' ? 'लागत/पेड़' : 'Cost / Tree'}</Text>
                  <Text style={styles.metricSub}>{totalTrees} {language === 'hi' ? 'पेड़' : 'trees'}</Text>
                </View>
                <View style={styles.metricBox}>
                  <Text style={styles.metricVal}>₹{costPerKg}</Text>
                  <Text style={styles.metricDesc}>{language === 'hi' ? 'लागत/किग्रा' : 'Cost / kg'}</Text>
                  <Text style={styles.metricSub}>{language === 'hi' ? 'उत्पादन आधार' : 'Yield baseline'}</Text>
                </View>
                <View style={styles.metricBox}>
                  <Text style={[styles.metricVal, { color: '#15803d' }]}>₹{marginPerKg}</Text>
                  <Text style={styles.metricDesc}>{language === 'hi' ? 'मार्जिन/किग्रा' : 'Margin / kg'}</Text>
                  <Text style={styles.metricSub}>Avg ₹{revenuePerKg}/kg</Text>
                </View>
              </View>

              <View style={styles.blockBreakdown}>
                <Text style={styles.innerTitle}>
                  {language === 'hi' ? 'ब्लॉक तुलना' : 'Blocks Comparison'}
                </Text>
                {blocks.map((block) => (
                  <View key={block.id} style={styles.blockRow}>
                    <View>
                      <Text style={styles.blockName}>{block.name}</Text>
                      <Text style={styles.blockDetail}>
                        {block.variety} • {block.elevationMeters}m elev
                      </Text>
                    </View>
                    <View style={styles.blockStats}>
                      <Text style={styles.blockTreeCount}>{block.treeCount} trees</Text>
                      <Text style={styles.blockArea}>{block.areaAcres} Acres</Text>
                    </View>
                  </View>
                ))}
              </View>
            </Card>
          </View>

          <View style={styles.col}>
            {/* Chilling Hours & Winter Dormancy */}
            <Card
              title={language === 'hi' ? 'सर्दियों के चिलिंग घंटे' : 'Winter Chilling Hours (<7.2°C)'}
              subtitle={`Variety: ${selectedVarietyForChilling}`}
              badge={chillingHoursAccumulated >= chillingHoursTarget ? 'Sufficient' : '82% of Goal'}
              badgeColor={chillingHoursAccumulated >= chillingHoursTarget ? '#dcfce7' : '#fef3c7'}>
              <View style={styles.chillingBox}>
                <View style={styles.chillingStats}>
                  <Text style={styles.chillingBig}>{chillingHoursAccumulated}</Text>
                  <Text style={styles.chillingGoal}>/ {chillingHoursTarget} hrs</Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${Math.min(
                          100,
                          (chillingHoursAccumulated / chillingHoursTarget) * 100
                        )}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.chillingNote}>
                  {language === 'hi'
                    ? 'उचित चिलिंग घंटे फल सेट के लिए आवश्यक हैं। रॉयल डिलीशियस को 1,000-1,200 घंटों की आवश्यकता होती है।'
                    : 'Adequate chilling ensures uniform bud break and high fruit-set. Tracking 60 hrs behind 10-year mean.'}
                </Text>
              </View>
            </Card>

            {/* Inventory Alerts Summary */}
            <Card
              title={language === 'hi' ? 'स्टॉक स्थिति' : 'Inventory & Reorder Status'}
              badge={`${lowStockItems.length} Reorder`}
              badgeColor={lowStockItems.length > 0 ? '#fee2e2' : '#dcfce7'}>
              {lowStockItems.length === 0 ? (
                <Text style={styles.healthyStockText}>All stock levels above threshold.</Text>
              ) : (
                lowStockItems.map((item) => (
                  <View key={item.id} style={styles.stockAlertRow}>
                    <View>
                      <Text style={styles.stockItemName}>{item.name}</Text>
                      <Text style={styles.stockItemCat}>{item.category}</Text>
                    </View>
                    <View style={styles.stockQtyBox}>
                      <Text style={styles.stockQtyAlert}>
                        {item.currentQuantity} {item.unit}
                      </Text>
                      <Text style={styles.stockThreshold}>Min: {item.reorderThreshold}</Text>
                    </View>
                  </View>
                ))
              )}
              <TouchableOpacity
                style={styles.cardNavBtn}
                onPress={() => router.push('/(tabs)/stock' as any)}>
                <Text style={styles.cardNavText}>Manage Stock Register →</Text>
              </TouchableOpacity>
            </Card>
          </View>
        </View>

        {/* Quick Module Navigation Grid */}
        <View style={styles.quickNavSection}>
          <Text style={styles.sectionTitle}>
            {language === 'hi' ? 'सभी 8 मॉड्यूल' : 'All 8 Orchard Modules'}
          </Text>
          <View style={styles.navGrid}>
            {[
              { title: 'Crop Log', icon: '🌿', route: 'log', desc: 'Sprays & Warnings' },
              { title: 'Hail Risk', icon: '⛈️', route: 'weather', desc: 'IMD 3-Tier Alerts' },
              { title: 'Inventory', icon: '📦', route: 'stock', desc: 'Stock & Batches' },
              { title: 'Finance', icon: '💰', route: 'finance', desc: 'Budgets & Insurance' },
              { title: 'Mandi Rates', icon: '📈', route: 'market', desc: 'Azadpur Prices' },
              { title: 'Bills & Docs', icon: '📄', route: 'documents', desc: 'OCR Review & Drafts' },
              { title: 'Harvest Sales', icon: '🍎', route: 'listing', desc: 'Grade A/B/C Listings' },
            ].map((nav) => (
              <TouchableOpacity
                key={nav.route}
                style={styles.navCard}
                onPress={() => router.push(`/(tabs)/${nav.route}` as any)}>
                <Text style={styles.navIcon}>{nav.icon}</Text>
                <Text style={styles.navTitle}>{nav.title}</Text>
                <Text style={styles.navDesc}>{nav.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f8faf9',
  },
  scrollContent: {
    padding: 14,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: 90,
  },
  headerSeasonTag: {
    backgroundColor: '#fce7f3',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fbcfe8',
  },
  headerSeasonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#be185d',
  },
  section: {
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  alertCountBadge: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fca5a5',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 1,
  },
  alertCountBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#b91c1c',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1f2937',
    letterSpacing: -0.3,
  },
  sectionSubtext: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
  },
  alertsList: {
    gap: 0,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
    justifyContent: 'space-between',
  },
  kpiGridDesktop: {
    flexWrap: 'nowrap',
    gap: 12,
  },
  kpiCard: {
    width: '48.5%',
    minWidth: 140,
    marginBottom: 0,
    padding: 12,
  },
  kpiCardDesktop: {
    width: 'auto',
    flex: 1,
    padding: 14,
  },
  kpiLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: '900',
    marginVertical: 3,
    letterSpacing: -0.3,
  },
  kpiSub: {
    fontSize: 10,
    color: '#64748b',
  },
  insuranceTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#bbf7d0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  insuranceTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#14532d',
  },
  desktopTwoCol: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 16,
  },
  mobileStack: {
    flexDirection: 'column',
    marginTop: 16,
  },
  col: {
    flex: 1,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  metricBox: {
    alignItems: 'center',
    flex: 1,
  },
  metricVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  metricDesc: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4b5563',
    marginTop: 2,
  },
  metricSub: {
    fontSize: 10,
    color: '#9ca3af',
  },
  blockBreakdown: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 12,
    gap: 8,
  },
  innerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 4,
  },
  blockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f9fafb',
  },
  blockName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1f2937',
  },
  blockDetail: {
    fontSize: 11,
    color: '#6b7280',
  },
  blockStats: {
    alignItems: 'flex-end',
  },
  blockTreeCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937',
  },
  blockArea: {
    fontSize: 10,
    color: '#9ca3af',
  },
  chillingBox: {
    gap: 8,
  },
  chillingStats: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  chillingBig: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0284c7',
  },
  chillingGoal: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#0284c7',
    borderRadius: 4,
  },
  chillingNote: {
    fontSize: 11,
    color: '#64748b',
    lineHeight: 15,
  },
  healthyStockText: {
    fontSize: 13,
    color: '#16a34a',
    paddingVertical: 8,
  },
  stockAlertRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  stockItemName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1f2937',
  },
  stockItemCat: {
    fontSize: 11,
    color: '#6b7280',
  },
  stockQtyBox: {
    alignItems: 'flex-end',
  },
  stockQtyAlert: {
    fontSize: 13,
    fontWeight: '700',
    color: '#dc2626',
  },
  stockThreshold: {
    fontSize: 10,
    color: '#9ca3af',
  },
  cardNavBtn: {
    marginTop: 12,
    alignItems: 'center',
    paddingVertical: 6,
  },
  cardNavText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2e7d32',
  },
  quickNavSection: {
    marginTop: 20,
    marginBottom: 30,
  },
  navGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 10,
  },
  navCard: {
    flex: 1,
    minWidth: 130,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  navIcon: {
    fontSize: 22,
    marginBottom: 6,
  },
  navTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1f2937',
  },
  navDesc: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
  },
});
