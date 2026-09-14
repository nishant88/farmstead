import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  useWindowDimensions,
} from 'react-native';
import { useStore } from '../../store/useStore';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { MandiTrendChart } from '../../components/VisualChart';
import { ModuleQuickSwitcher } from '../../components/ModuleQuickSwitcher';

export default function MarketScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const {
    language,
    mandiPrices,
    festivalDemands,
    farmerSales,
    userPriceTargetPerKg,
    setUserPriceTarget,
    lastMandiRefresh,
    lastMandiRefreshTimestamp,
    mandiAutoSyncEnabled,
    mandiSyncIntervalMinutes,
    mandiPriceAlertActive,
    mandiPriceAlertMessage,
    toggleMandiAutoSync,
    setMandiSyncIntervalMinutes,
    refreshMandiPrices,
    logFarmerMandiSale,
  } = useStore();

  const [editingTarget, setEditingTarget] = useState(false);
  const [tempTarget, setTempTarget] = useState(userPriceTargetPerKg.toString());

  // 15-Minute Cron Countdown state
  const [countdownSeconds, setCountdownSeconds] = useState(15 * 60);
  const [isSyncing, setIsSyncing] = useState(false);

  // Log Actual Sale Modal
  const [showLogSaleModal, setShowLogSaleModal] = useState(false);
  const [saleMandi, setSaleMandi] = useState('Azadpur');
  const [saleGrade, setSaleGrade] = useState<'A' | 'B' | 'C'>('A');
  const [salePrice, setSalePrice] = useState('');
  const [saleBuyer, setSaleBuyer] = useState('');

  // Ticker countdown timer (every second)
  useEffect(() => {
    const updateCountdown = () => {
      const intervalSec = (mandiSyncIntervalMinutes || 15) * 60;
      const elapsedSec = Math.floor((Date.now() - (lastMandiRefreshTimestamp || Date.now())) / 1000);
      const remaining = Math.max(0, intervalSec - elapsedSec);
      setCountdownSeconds(remaining);

      // Auto-trigger sync when timer reaches 0
      if (remaining === 0 && mandiAutoSyncEnabled) {
        refreshMandiPrices();
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [lastMandiRefreshTimestamp, mandiSyncIntervalMinutes, mandiAutoSyncEnabled, refreshMandiPrices]);

  const handleManualSync = () => {
    setIsSyncing(true);
    refreshMandiPrices();
    setTimeout(() => {
      setIsSyncing(false);
    }, 600);
  };

  const handleSaveTarget = () => {
    setUserPriceTarget(Number(tempTarget) || 135);
    setEditingTarget(false);
  };

  const handleSaveActualSale = () => {
    if (!salePrice || !saleBuyer) return;
    const priceNum = Number(salePrice) || 0;
    const modalAvg = 138; // Azadpur modal approx
    logFarmerMandiSale({
      mandi: saleMandi,
      date: new Date().toISOString().split('T')[0],
      grade: saleGrade,
      pricePerKg: priceNum,
      buyer: saleBuyer,
      varianceFromModal: priceNum - modalAvg,
    });
    setShowLogSaleModal(false);
    setSalePrice('');
    setSaleBuyer('');
  };

  const minutesRemaining = Math.floor(countdownSeconds / 60);
  const secondsRemainder = countdownSeconds % 60;
  const formattedCountdown = `${minutesRemaining.toString().padStart(2, '0')}:${secondsRemainder
    .toString()
    .padStart(2, '0')}`;

  // Find if any mandi currently hits or exceeds target
  const targetMetMandis = mandiPrices.filter(
    (mp) => Math.round(mp.modalPrice / 100) >= userPriceTargetPerKg
  );

  return (
    <View style={styles.screen}>
      <Header
        title={language === 'hi' ? 'मंडी भाव एवं बाज़ार विश्लेषण' : 'Market Intelligence'}
        subtitle="15-minute live Agmarknet cron sync, intraday price spreads & festival demand"
        rightAction={
          <View style={styles.headerBtnRow}>
            <TouchableOpacity
              style={styles.logSaleBtn}
              onPress={() => setShowLogSaleModal(true)}>
              <Text style={styles.logSaleBtnText}>+ Log Actual Sale</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.refreshBtn, isSyncing && styles.refreshBtnSpinning]}
              onPress={handleManualSync}>
              <Text style={styles.refreshBtnText}>{isSyncing ? '⏳' : '🔄 Sync'}</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <ModuleQuickSwitcher currentTab="market" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 15-Minute Cron & Market Intelligence Scheduler Card */}
        <Card style={styles.cronCard}>
          <View style={styles.cronHeaderRow}>
            <View style={styles.cronBadgeGroup}>
              <View
                style={[
                  styles.cronIndicatorDot,
                  { backgroundColor: mandiAutoSyncEnabled ? '#22c55e' : '#f59e0b' },
                ]}
              />
              <Text style={styles.cronTitle}>
                {mandiAutoSyncEnabled ? '15-MIN AGMARKNET CRON ACTIVE' : '15-MIN CRON PAUSED'}
              </Text>
            </View>
            <View style={styles.syncFreqTag}>
              <Text style={styles.syncFreqText}>
                Every {mandiSyncIntervalMinutes} Min
              </Text>
            </View>
          </View>

          <View style={styles.cronBodyRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.countdownLabel}>Next Intraday Price Refresh in:</Text>
              <Text style={styles.countdownValue}>
                {mandiAutoSyncEnabled ? formattedCountdown : 'Paused'}
              </Text>
              <Text style={styles.lastSyncSub}>
                Last auction sync: {lastMandiRefresh} • Automated background ticker
              </Text>
            </View>

            <View style={styles.cronControlBtns}>
              <TouchableOpacity
                style={[
                  styles.cronToggleBtn,
                  { backgroundColor: mandiAutoSyncEnabled ? '#fef2f2' : '#f0fdf4' },
                ]}
                onPress={toggleMandiAutoSync}>
                <Text
                  style={[
                    styles.cronToggleText,
                    { color: mandiAutoSyncEnabled ? '#b91c1c' : '#15803d' },
                  ]}>
                  {mandiAutoSyncEnabled ? '⏸ Pause Cron' : '▶ Resume Cron'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.forceSyncBtn}
                onPress={handleManualSync}>
                <Text style={styles.forceSyncText}>⚡ Force Sync</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Sync Frequency Chips */}
          <View style={styles.intervalRow}>
            <Text style={styles.intervalLabel}>Cron Frequency:</Text>
            {[
              { min: 5, label: '5m (Auction Rush)' },
              { min: 15, label: '15m (Standard Agmarknet)' },
              { min: 30, label: '30m (Low Bandwidth)' },
            ].map((item) => (
              <TouchableOpacity
                key={item.min}
                style={[
                  styles.intervalChip,
                  mandiSyncIntervalMinutes === item.min && styles.intervalChipActive,
                ]}
                onPress={() => setMandiSyncIntervalMinutes(item.min)}>
                <Text
                  style={[
                    styles.intervalChipText,
                    mandiSyncIntervalMinutes === item.min && styles.intervalChipTextActive,
                  ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Dynamic Target Price Achievement Banner */}
        {targetMetMandis.length > 0 && (
          <View style={styles.targetMetBanner}>
            <Text style={styles.targetMetIcon}>🎉</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.targetMetTitle}>
                TARGET SELLING PRICE MET!
              </Text>
              <Text style={styles.targetMetDesc}>
                {targetMetMandis.map((m) => `${m.mandiName} (₹${Math.round(m.modalPrice / 100)}/kg)`).join(', ')}{' '}
                reached or exceeded your target rate of ₹{userPriceTargetPerKg}/kg. Commission agents are bidding strongly.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.targetActionBtn}
              onPress={() => setShowLogSaleModal(true)}>
              <Text style={styles.targetActionBtnText}>Log Sale</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* User Manual Price Target Card */}
        <Card style={styles.targetCard}>
          <View style={styles.targetRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.targetHeading}>YOUR DESIRED SALE TARGET (GRADE A)</Text>
              <Text style={styles.targetPrice}>₹{userPriceTargetPerKg} / kg</Text>
              <Text style={styles.targetQuintal}>
                Equivalent: ₹{(userPriceTargetPerKg * 100).toLocaleString('en-IN')} / quintal
              </Text>
              <Text style={styles.targetSub}>
                Flagged automatically across all screens when Azadpur, Gumma (Kotkhai), or Bhattakuffer rates reach this threshold.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.targetEditBtn}
              onPress={() => setEditingTarget(!editingTarget)}>
              <Text style={styles.targetEditText}>
                {editingTarget ? 'Close' : 'Edit Target'}
              </Text>
            </TouchableOpacity>
          </View>

          {editingTarget && (
            <View style={styles.targetInputBox}>
              <Text style={styles.inputLabel}>Set Target Price per kg (₹):</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={tempTarget}
                  onChangeText={setTempTarget}
                />
                <TouchableOpacity
                  style={styles.saveTargetBtn}
                  onPress={handleSaveTarget}>
                  <Text style={styles.saveTargetText}>Save Target</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Card>

        {/* Live Intraday Mandi Quotes Ticker */}
        <View style={styles.tickerSection}>
          <Text style={styles.tickerHeader}>LIVE APMC INTRADAY AUCTION QUOTES</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tickerScroll}>
            {mandiPrices.map((mp) => {
              const perKg = Math.round(mp.modalPrice / 100);
              const isUp = mp.trend === 'up';
              const isDown = mp.trend === 'down';
              return (
                <View key={mp.id} style={styles.tickerCard}>
                  <Text style={styles.tickerMandi}>{mp.mandiName}</Text>
                  <View style={styles.tickerPriceRow}>
                    <Text style={styles.tickerPrice}>₹{perKg}/kg</Text>
                    <Text
                      style={[
                        styles.tickerTrend,
                        { color: isUp ? '#15803d' : isDown ? '#b91c1c' : '#4b5563' },
                      ]}>
                      {isUp ? '▲ Up' : isDown ? '▼ Down' : '● Stable'}
                    </Text>
                  </View>
                  <Text style={styles.tickerQtl}>₹{mp.modalPrice.toLocaleString('en-IN')}/qtl</Text>
                </View>
              );
            })}
          </ScrollView>
        </View>

        {/* Reference Mandi Spot Prices with Historical 5-Day Trend */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Daily Spot Rates & Spreads</Text>
          <Text style={styles.syncMeta}>15m Agmarknet sync: {lastMandiRefresh}</Text>
        </View>

        <View style={styles.mandiList}>
          {mandiPrices.map((mp) => {
            const modalPerKg = Math.round(mp.modalPrice / 100);
            const isTargetMet = modalPerKg >= userPriceTargetPerKg;
            const spread = mp.maxPrice - mp.minPrice;

            return (
              <Card
                key={mp.id}
                title={mp.mandiName}
                subtitle={`${mp.state} • ${mp.variety}`}
                badge={isTargetMet ? '🎯 TARGET MET' : `${mp.trend.toUpperCase()} TREND`}
                badgeColor={isTargetMet ? '#dcfce7' : mp.trend === 'up' ? '#e0f2fe' : '#f3f4f6'}>
                <View style={styles.priceOverview}>
                  <View style={styles.modalPriceBox}>
                    <Text style={styles.modalLabel}>Modal Price (Quintal)</Text>
                    <Text style={styles.modalRate}>
                      ₹{mp.modalPrice.toLocaleString('en-IN')}
                    </Text>
                    <Text style={styles.kgEquivalent}>~₹{modalPerKg}/kg</Text>
                  </View>

                  <View style={styles.rangeBox}>
                    <View style={styles.rangeRow}>
                      <Text style={styles.rangeLabel}>Day Min:</Text>
                      <Text style={styles.rangeVal}>₹{mp.minPrice.toLocaleString('en-IN')}</Text>
                    </View>
                    <View style={styles.rangeRow}>
                      <Text style={styles.rangeLabel}>Day Max:</Text>
                      <Text style={styles.rangeVal}>₹{mp.maxPrice.toLocaleString('en-IN')}</Text>
                    </View>
                    <View style={styles.rangeRow}>
                      <Text style={styles.rangeLabel}>Daily Spread:</Text>
                      <Text style={[styles.rangeVal, { color: '#b45309' }]}>
                        ₹{spread.toLocaleString('en-IN')}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* 5-Day Trend Visual Chart */}
                {mp.history && (
                  <MandiTrendChart
                    history={mp.history}
                    title={`${mp.mandiName} 5-Day & Intraday Modal Trend`}
                  />
                )}

                <View style={styles.mandiInsight}>
                  <Text style={styles.insightText}>
                    💡 Spread Analysis: A ₹{spread.toLocaleString()} spread reflects wide grading
                    variance. Spotless Grade A in telescopic cartons secures top band; Grade B
                    averages mid-band.
                  </Text>
                </View>
              </Card>
            );
          })}
        </View>

        {/* Farmer Historical Sale Price Log vs Market */}
        <Card
          title="Your Historical Realized Prices vs Mandi Trend"
          subtitle="Tracks your personal bargaining power over time"
          badge={`${farmerSales.length} Recorded`}>
          {farmerSales.length === 0 ? (
            <Text style={styles.emptyText}>No farmer sales logged yet.</Text>
          ) : (
            farmerSales.map((fs) => (
              <View key={fs.id} style={styles.saleLogRow}>
                <View>
                  <Text style={styles.saleBuyer}>{fs.buyer} ({fs.mandi})</Text>
                  <Text style={styles.saleDate}>{fs.date} • Grade {fs.grade}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.salePrice}>₹{fs.pricePerKg}/kg</Text>
                  <Text
                    style={[
                      styles.saleVariance,
                      { color: fs.varianceFromModal >= 0 ? '#15803d' : '#b91c1c' },
                    ]}>
                    {fs.varianceFromModal >= 0 ? `+₹${fs.varianceFromModal}` : `-₹${Math.abs(fs.varianceFromModal)}`} vs Mandi
                  </Text>
                </View>
              </View>
            ))
          )}
        </Card>

        {/* Indian Festival Demand Calendar */}
        <View style={[styles.sectionHeaderRow, { marginTop: 16 }]}>
          <Text style={styles.sectionTitle}>🇮🇳 Festival Demand Calendar</Text>
          <Text style={styles.syncMeta}>Directional Harvest & Sale Windows</Text>
        </View>

        <View style={styles.festivalList}>
          {festivalDemands.map((f) => (
            <Card
              key={f.id}
              title={f.festivalName}
              subtitle={`${f.dateWindow} • In ${f.weeksAway} Weeks`}
              badge={`Demand: ${f.demandLevel}`}
              badgeColor={
                f.demandLevel === 'Peak'
                  ? '#fee2e2'
                  : f.demandLevel === 'Very High'
                  ? '#fef3c7'
                  : '#e0f2fe'
              }>
              <Text style={styles.festivalAdvisory}>{f.advisory}</Text>
              <View style={styles.targetGradesRow}>
                <Text style={styles.targetGradeTitle}>Recommended Stock Focus:</Text>
                {f.targetGrades.map((g, i) => (
                  <View key={i} style={styles.gradeBadge}>
                    <Text style={styles.gradeBadgeText}>{g}</Text>
                  </View>
                ))}
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>

      {/* Modal: Log Actual Sale (Bottom Sheet on Mobile) */}
      {showLogSaleModal && (
        <Modal visible={true} transparent animationType="slide">
          <View style={[styles.modalOverlay, isDesktop && styles.modalOverlayDesktop]}>
            <TouchableOpacity
              style={styles.modalBackdrop}
              activeOpacity={1}
              onPress={() => setShowLogSaleModal(false)}
            />
            <View style={[styles.modalBox, isDesktop && styles.modalBoxDesktop]}>
              {!isDesktop && (
                <View style={styles.dragHandleContainer}>
                  <View style={styles.dragHandle} />
                </View>
              )}
              <Text style={styles.modalTitle}>Log Your Actual Realized Sale</Text>
              <Text style={styles.modalSub}>
                Compare your negotiated price against Agmarknet daily modal readings.
              </Text>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Mandi / Delivery Point:</Text>
                <TextInput
                  style={styles.modalInput}
                  value={saleMandi}
                  onChangeText={setSaleMandi}
                  placeholder="e.g. Azadpur, Gumma (Kotkhai) or Bhattakuffer"
                />
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Realized Rate (₹/kg):</Text>
                  <TextInput
                    style={styles.modalInput}
                    keyboardType="numeric"
                    placeholder="e.g. 142"
                    value={salePrice}
                    onChangeText={setSalePrice}
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Grade Sold:</Text>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    {(['A', 'B', 'C'] as const).map((g) => (
                      <TouchableOpacity
                        key={g}
                        style={[
                          styles.chip,
                          saleGrade === g && styles.chipActive,
                          { flex: 1, alignItems: 'center' },
                        ]}
                        onPress={() => setSaleGrade(g)}>
                        <Text
                          style={[
                            styles.chipText,
                            saleGrade === g && styles.chipTextActive,
                          ]}>
                          Grade {g}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Buyer / Commission Agent / Ladani:</Text>
                <TextInput
                  style={styles.modalInput}
                  value={saleBuyer}
                  onChangeText={setSaleBuyer}
                  placeholder="e.g. Shree Balaji Traders or Reliance Fresh"
                />
              </View>

              <View style={styles.modalActionRow}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setShowLogSaleModal(false)}>
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalConfirmBtn}
                  onPress={handleSaveActualSale}>
                  <Text style={styles.modalConfirmText}>Save Sale Entry</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    padding: 14,
    gap: 12,
    paddingBottom: 90,
  },
  headerBtnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  logSaleBtn: {
    backgroundColor: '#15803d',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  logSaleBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  refreshBtn: {
    backgroundColor: '#0284c7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  refreshBtnSpinning: {
    opacity: 0.7,
  },
  refreshBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },

  // 15-Minute Cron Card
  cronCard: {
    backgroundColor: '#f8fafc',
    borderColor: '#cbd5e1',
    borderWidth: 1.5,
  },
  cronHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cronBadgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cronIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  cronTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#334155',
    letterSpacing: 0.5,
  },
  syncFreqTag: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  syncFreqText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  cronBodyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  countdownLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  countdownValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0f766e',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.5,
  },
  lastSyncSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  cronControlBtns: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  cronToggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cronToggleText: {
    fontSize: 11,
    fontWeight: '700',
  },
  forceSyncBtn: {
    backgroundColor: '#0f766e',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  forceSyncText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  intervalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  intervalLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    marginRight: 4,
  },
  intervalChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  intervalChipActive: {
    backgroundColor: '#0f766e',
    borderColor: '#0f766e',
  },
  intervalChipText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
  },
  intervalChipTextActive: {
    color: '#ffffff',
  },

  // Target Met Banner
  targetMetBanner: {
    backgroundColor: '#f0fdf4',
    borderWidth: 2,
    borderColor: '#22c55e',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#15803d',
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  targetMetIcon: {
    fontSize: 24,
  },
  targetMetTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#15803d',
    letterSpacing: 0.3,
  },
  targetMetDesc: {
    fontSize: 12,
    color: '#166534',
    marginTop: 2,
    lineHeight: 16,
  },
  targetActionBtn: {
    backgroundColor: '#15803d',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  targetActionBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },

  // Target Card
  targetCard: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
  },
  targetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  targetHeading: {
    fontSize: 10,
    fontWeight: '800',
    color: '#047857',
    letterSpacing: 0.5,
  },
  targetPrice: {
    fontSize: 26,
    fontWeight: '900',
    color: '#065f46',
    marginTop: 2,
  },
  targetQuintal: {
    fontSize: 12,
    color: '#047857',
    fontWeight: '600',
    marginTop: 1,
  },
  targetSub: {
    fontSize: 11,
    color: '#065f46',
    marginTop: 4,
    lineHeight: 15,
  },
  targetEditBtn: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#6ee7b7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  targetEditText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#047857',
  },
  targetInputBox: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#d1fae5',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 14,
    color: '#111827',
    width: 120,
  },
  saveTargetBtn: {
    backgroundColor: '#047857',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
    justifyContent: 'center',
  },
  saveTargetText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },

  // Live Ticker
  tickerSection: {
    marginTop: 4,
  },
  tickerHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  tickerScroll: {
    paddingBottom: 4,
  },
  tickerCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginRight: 8,
    minWidth: 140,
  },
  tickerMandi: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 2,
  },
  tickerPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  tickerPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f766e',
  },
  tickerTrend: {
    fontSize: 10,
    fontWeight: '700',
  },
  tickerQtl: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 1,
  },

  // Mandi List
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  syncMeta: {
    fontSize: 11,
    color: '#6b7280',
  },
  mandiList: {
    gap: 12,
  },
  priceOverview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  modalPriceBox: {
    flex: 1,
  },
  modalLabel: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '600',
  },
  modalRate: {
    fontSize: 22,
    fontWeight: '800',
    color: '#15803d',
    marginTop: 2,
  },
  kgEquivalent: {
    fontSize: 12,
    color: '#166534',
    fontWeight: '700',
  },
  rangeBox: {
    flex: 1,
    alignItems: 'flex-end',
    gap: 2,
  },
  rangeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  rangeLabel: {
    fontSize: 11,
    color: '#6b7280',
  },
  rangeVal: {
    fontSize: 11,
    fontWeight: '700',
    color: '#374151',
  },
  mandiInsight: {
    backgroundColor: '#f8fafc',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  insightText: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 15,
  },

  // Farmer Realized Sales Log
  saleLogRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  saleBuyer: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  saleDate: {
    fontSize: 11,
    color: '#6b7280',
  },
  salePrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  saleVariance: {
    fontSize: 10,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    paddingVertical: 8,
  },

  // Festival Calendar
  festivalList: {
    gap: 8,
    marginBottom: 30,
  },
  festivalAdvisory: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
    marginBottom: 8,
  },
  targetGradesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  targetGradeTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4b5563',
  },
  gradeBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  gradeBadgeText: {
    fontSize: 11,
    color: '#1f2937',
    fontWeight: '600',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  modalOverlayDesktop: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalBox: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 24,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: -4 },
    shadowRadius: 16,
    elevation: 10,
  },
  modalBoxDesktop: {
    borderRadius: 16,
    width: '100%',
    maxWidth: 500,
    maxHeight: '85%',
    paddingBottom: 18,
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#cbd5e1',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  modalSub: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
    marginBottom: 14,
  },
  formGroup: {
    marginBottom: 10,
  },
  formRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modalInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#111827',
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  chipActive: {
    backgroundColor: '#dcfce7',
    borderColor: '#86efac',
  },
  chipText: {
    fontSize: 11,
    color: '#4b5563',
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#166534',
  },
  modalActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 12,
  },
  modalCancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  modalCancelText: {
    fontSize: 13,
    color: '#4b5563',
    fontWeight: '600',
  },
  modalConfirmBtn: {
    backgroundColor: '#15803d',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  modalConfirmText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
});
