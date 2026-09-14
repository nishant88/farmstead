import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Linking,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useStore } from '../../store/useStore';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { AlertBanner } from '../../components/AlertBanner';
import { ModuleQuickSwitcher } from '../../components/ModuleQuickSwitcher';

export default function WeatherRiskScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const {
    language,
    weatherAlerts,
    blocks,
    activeLocation,
    chillingHoursAccumulated,
    chillingHoursTarget,
    selectedVarietyForChilling,
    setSelectedVarietyForChilling,
    lastWeatherRefresh,
    refreshWeatherNow,
    logHailDamage,
  } = useStore();

  // Modals for Alert Actions
  const [showHailDamageModal, setShowHailDamageModal] = useState(false);
  const [showSpraySafeModal, setShowSpraySafeModal] = useState(false);

  // Hail damage form
  const [damageBlockId, setDamageBlockId] = useState(blocks[0]?.id || 'b1');
  const [damagePercent, setDamagePercent] = useState('40');
  const [damageTrees, setDamageTrees] = useState('250');
  const [damageNotes, setDamageNotes] = useState('');

  const tier3Alerts = weatherAlerts.filter((a) => a.tier === 3);
  const tier2Alerts = weatherAlerts.filter((a) => a.tier === 2);
  const tier1Alerts = weatherAlerts.filter((a) => a.tier === 1);

  // Variety chilling requirements
  const appleVarieties = [
    { name: 'Royal Delicious (Standard)', target: 1100 },
    { name: 'Scarlet Spur / Red Delicious', target: 900 },
    { name: 'Gala / Early Windsor', target: 700 },
    { name: 'Golden Delicious', target: 800 },
  ];

  // 48-Hour Spray Safe Window Table
  const sprayWindows = [
    { time: 'Today 10:00 - 14:00', wind: '5 km/h', rain: '5%', safe: true, advice: 'Optimal: Low wind, foliar uptake rapid' },
    { time: 'Today 14:00 - 18:00', wind: '9 km/h', rain: '15%', safe: true, advice: 'Acceptable before evening humidity' },
    { time: 'Tomorrow 06:00 - 11:00', wind: '18 km/h', rain: '45%', safe: false, advice: 'UNSAFE: Gusty wind spray drift' },
    { time: 'Tomorrow 12:00 - 18:00', wind: '35 km/h', rain: '85%', safe: false, advice: 'UNSAFE: Heavy rain will wash off chemical' },
  ];

  const handleSaveDamageReport = () => {
    logHailDamage({
      blockId: damageBlockId,
      date: new Date().toISOString().split('T')[0],
      estimatedDamagePercent: Number(damagePercent) || 0,
      affectedTrees: Number(damageTrees) || 0,
      notes: damageNotes || 'Hailstorm event recorded by grower.',
    });
    setShowHailDamageModal(false);
    alert('Hail damage incident logged! Ready to link with PMFBY Insurance claim.');
    router.push('/(tabs)/finance' as any);
  };

  return (
    <View style={styles.screen}>
      <Header
        title={language === 'hi' ? 'मौसम एवं ओलावृष्टि जोखिम' : 'Weather & Hail Risk System'}
        subtitle="Tiered forecasting calibrated to your orchard's exact elevation"
        rightAction={
          <TouchableOpacity
            style={styles.refreshBtn}
            onPress={refreshWeatherNow}>
            <Text style={styles.refreshBtnText}>🔄 Check Weather Now</Text>
          </TouchableOpacity>
        }
      />

      <ModuleQuickSwitcher currentTab="weather" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hyperlocal Station Header */}
        <Card style={styles.locHeaderCard}>
          <View style={styles.locRow}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <View style={styles.locTagRow}>
                <Text style={styles.locTag}>METEOROLOGICAL NOWCAST GRID</Text>
                {activeLocation.plusCode && (
                  <View style={styles.plusCodePill}>
                    <Text style={styles.plusCodePillText}>📍 {activeLocation.plusCode}</Text>
                  </View>
                )}
                {activeLocation.chillingZone && (
                  <View style={styles.chillingZonePill}>
                    <Text style={styles.chillingZonePillText}>{activeLocation.chillingZone}</Text>
                  </View>
                )}
              </View>

              <Text style={styles.locName}>{activeLocation.name}</Text>
              <Text style={styles.locMeta}>
                Elevation: {activeLocation.elevationMeters}m MSL (~{Math.round(activeLocation.elevationMeters * 3.28084)} ft) • {activeLocation.district}
                {activeLocation.pincode ? ` • PIN ${activeLocation.pincode}` : ''}
              </Text>
              {activeLocation.coordinates && (
                <Text style={styles.coordMeta}>
                  🌐 Coordinates: {activeLocation.coordinates}
                </Text>
              )}
              {activeLocation.description && (
                <Text style={styles.descMeta}>
                  {activeLocation.description}
                </Text>
              )}
              <Text style={styles.lastSync}>Last radar query: {lastWeatherRefresh}</Text>
            </View>

            <View style={styles.locRightCol}>
              <View style={styles.statusBadge}>
                <Text style={styles.statusBadgeText}>Live Doppler Feed</Text>
              </View>
              {activeLocation.googleMapsUrl && (
                <TouchableOpacity
                  style={styles.mapsBtn}
                  onPress={() => Linking.openURL(activeLocation.googleMapsUrl!)}>
                  <Text style={styles.mapsBtnText}>🗺️ View on Maps</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Card>

        {/* Quick Action Hub for Hail & Spraying */}
        <Card
          title="Direct Grower Action Triggers"
          subtitle="Links weather intelligence directly into farm operations">
          <View style={styles.actionHubGrid}>
            <TouchableOpacity
              style={[styles.hubBtn, { backgroundColor: '#fee2e2', borderColor: '#fca5a5' }]}
              onPress={() => setShowHailDamageModal(true)}>
              <Text style={styles.hubIcon}>📸</Text>
              <Text style={[styles.hubTitle, { color: '#991b1b' }]}>Log Hail Damage</Text>
              <Text style={styles.hubSub}>Record photo & % crop loss for PMFBY</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.hubBtn, { backgroundColor: '#f0fdf4', borderColor: '#86efac' }]}
              onPress={() => setShowSpraySafeModal(true)}>
              <Text style={styles.hubIcon}>🌤️</Text>
              <Text style={[styles.hubTitle, { color: '#166534' }]}>Spray-Safe Window</Text>
              <Text style={styles.hubSub}>48h wind & rain drift forecast</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.hubBtn, { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }]}
              onPress={() => router.push('/(tabs)/finance' as any)}>
              <Text style={styles.hubIcon}>🛡️</Text>
              <Text style={[styles.hubTitle, { color: '#1e40af' }]}>Check PMFBY Policy</Text>
              <Text style={styles.hubSub}>Hail scheme closes March 31</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Chilling Hours Accumulation with Variety Picker */}
        <Card
          title="Winter Chilling Accumulation (<7.2°C)"
          badge={chillingHoursAccumulated >= chillingHoursTarget ? 'Target Met' : 'Tracking'}
          badgeColor={chillingHoursAccumulated >= chillingHoursTarget ? '#dcfce7' : '#fef3c7'}>
          <Text style={styles.varietyLabel}>Select Variety to Benchmark:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
            {appleVarieties.map((v) => (
              <TouchableOpacity
                key={v.name}
                style={[
                  styles.varChip,
                  selectedVarietyForChilling === v.name && styles.varChipActive,
                ]}
                onPress={() => setSelectedVarietyForChilling(v.name, v.target)}>
                <Text
                  style={[
                    styles.varChipText,
                    selectedVarietyForChilling === v.name && styles.varChipTextActive,
                  ]}>
                  {v.name} ({v.target}h)
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.chillingBox}>
            <View style={styles.chillingStats}>
              <Text style={styles.chillingBig}>{chillingHoursAccumulated}</Text>
              <Text style={styles.chillingGoal}>/ {chillingHoursTarget} Hours</Text>
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
            <Text style={styles.chillingAdvisory}>
              Dormancy models indicate uniform bud break is likely. Winter temperatures in{' '}
              {activeLocation.name} reached optimal threshold for {selectedVarietyForChilling}.
            </Text>
          </View>
        </Card>

        {/* TIER 3: Near-Term Radar Nowcast (0 - 24 Hours) */}
        <View style={styles.tierSection}>
          <View style={styles.tierHeader}>
            <Text style={[styles.tierTitle, { color: '#991b1b' }]}>
              🚨 TIER 3: Near-Term Nowcast (0 – 24 Hours)
            </Text>
            <Text style={styles.tierBadge}>Highest Confidence • IMD Radar</Text>
          </View>
          <Text style={styles.tierDesc}>
            Action window: Secure hail netting, postpone spray mixtures, or deploy orchard heaters.
          </Text>
          {tier3Alerts.map((alert) => (
            <AlertBanner
              key={alert.id}
              alert={alert}
              onAction={() => setShowHailDamageModal(true)}
            />
          ))}
        </View>

        {/* TIER 2: Short-Range Forecast (3 - 10 Days) */}
        <View style={styles.tierSection}>
          <View style={styles.tierHeader}>
            <Text style={[styles.tierTitle, { color: '#92400e' }]}>
              🌧️ TIER 2: Short-Range Weather Window (3 – 10 Days)
            </Text>
            <Text style={styles.tierBadge}>Numerical Model Grid</Text>
          </View>
          <Text style={styles.tierDesc}>
            Confidence sharpens as date nears. Essential for planning protective fungicide sprays.
          </Text>
          {tier2Alerts.map((alert) => (
            <AlertBanner
              key={alert.id}
              alert={alert}
              onAction={() => setShowSpraySafeModal(true)}
            />
          ))}
        </View>

        {/* TIER 1: Probabilistic Seasonal Outlook (4 - 5 Weeks) */}
        <View style={styles.tierSection}>
          <View style={styles.tierHeader}>
            <Text style={[styles.tierTitle, { color: '#075985' }]}>
              📅 TIER 1: Seasonal / Monthly Outlook (4 – 5 Weeks)
            </Text>
            <Text style={styles.tierBadge}>Heads-up Probabilistic Risk</Text>
          </View>
          <Text style={styles.tierDesc}>
            Not an event prediction. Informs anti-hail net inventory purchases and insurance policies.
          </Text>
          {tier1Alerts.map((alert) => (
            <AlertBanner
              key={alert.id}
              alert={alert}
              onAction={() => router.push('/(tabs)/finance' as any)}
            />
          ))}
        </View>
      </ScrollView>

      {/* Modal: Hail Damage Reporter (Bottom Sheet on Mobile) */}
      {showHailDamageModal && (
        <Modal visible={true} transparent animationType="slide">
          <View style={[styles.modalOverlay, isDesktop && styles.modalOverlayDesktop]}>
            <TouchableOpacity
              style={styles.modalBackdrop}
              activeOpacity={1}
              onPress={() => setShowHailDamageModal(false)}
            />
            <View style={[styles.modalBox, isDesktop && styles.modalBoxDesktop]}>
              {!isDesktop && (
                <View style={styles.dragHandleContainer}>
                  <View style={styles.dragHandle} />
                </View>
              )}
              <Text style={styles.modalTitle}>Log Field Hailstorm Damage</Text>
              <Text style={styles.modalSub}>
                Formalize damage proof for RWBCIS / PMFBY revenue loss claims and KCC loans.
              </Text>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Damaged Block:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {blocks.map((b) => (
                    <TouchableOpacity
                      key={b.id}
                      style={[styles.varChip, damageBlockId === b.id && styles.varChipActive]}
                      onPress={() => setDamageBlockId(b.id)}>
                      <Text
                        style={[
                          styles.varChipText,
                          damageBlockId === b.id && styles.varChipTextActive,
                        ]}>
                        {b.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Estimated Crop Damage (%):</Text>
                  <TextInput
                    style={styles.modalInput}
                    keyboardType="numeric"
                    value={damagePercent}
                    onChangeText={setDamagePercent}
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Affected Tree Count:</Text>
                  <TextInput
                    style={styles.modalInput}
                    keyboardType="numeric"
                    value={damageTrees}
                    onChangeText={setDamageTrees}
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Observations (Hail size, leaf shredding):</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. Marble-sized hail for 15 minutes. Fruitlets pitted."
                  value={damageNotes}
                  onChangeText={setDamageNotes}
                />
              </View>

              <View style={styles.photoSimulateBox}>
                <Text style={styles.photoSimulateText}>
                  📸 Simulated photo attached: `hail_damage_block2_2026.jpg`
                </Text>
              </View>

              <View style={styles.modalActionRow}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setShowHailDamageModal(false)}>
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalConfirmBtn}
                  onPress={handleSaveDamageReport}>
                  <Text style={styles.modalConfirmText}>Submit Damage Report</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Modal: Spray-Safe Window Analyzer (Bottom Sheet on Mobile) */}
      {showSpraySafeModal && (
        <Modal visible={true} transparent animationType="slide">
          <View style={[styles.modalOverlay, isDesktop && styles.modalOverlayDesktop]}>
            <TouchableOpacity
              style={styles.modalBackdrop}
              activeOpacity={1}
              onPress={() => setShowSpraySafeModal(false)}
            />
            <View style={[styles.modalBox, isDesktop && styles.modalBoxDesktop]}>
              {!isDesktop && (
                <View style={styles.dragHandleContainer}>
                  <View style={styles.dragHandle} />
                </View>
              )}
              <Text style={styles.modalTitle}>48-Hour Spray-Safe Windows</Text>
              <Text style={styles.modalSub}>
                Calculates foliar wash-off and wind drift risks for {activeLocation.name}.
              </Text>

              <View style={styles.windowTable}>
                {sprayWindows.map((w, i) => (
                  <View key={i} style={styles.windowRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.windowTime}>{w.time}</Text>
                      <Text style={styles.windowAdvice}>{w.advice}</Text>
                      <Text style={styles.windowStats}>
                        Wind: {w.wind} • Rain Prob: {w.rain}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.safeBadge,
                        { backgroundColor: w.safe ? '#dcfce7' : '#fee2e2' },
                      ]}>
                      <Text
                        style={[
                          styles.safeBadgeText,
                          { color: w.safe ? '#15803d' : '#991b1b' },
                        ]}>
                        {w.safe ? '✓ SPRAY SAFE' : '✕ DO NOT SPRAY'}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setShowSpraySafeModal(false)}>
                <Text style={styles.closeBtnText}>Close Window</Text>
              </TouchableOpacity>
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
    backgroundColor: '#f8faf9',
  },
  scrollContent: {
    padding: 14,
    paddingBottom: 90,
    maxWidth: 1000,
    width: '100%',
    alignSelf: 'center',
  },
  refreshBtn: {
    backgroundColor: '#0284c7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  refreshBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  locHeaderCard: {
    backgroundColor: '#f0fdfa',
    borderColor: '#99f6e4',
  },
  locRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  locTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
  },
  plusCodePill: {
    backgroundColor: '#0284c7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  plusCodePillText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
  },
  chillingZonePill: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  chillingZonePillText: {
    color: '#0369a1',
    fontSize: 9,
    fontWeight: '700',
  },
  coordMeta: {
    fontSize: 11,
    color: '#0f766e',
    fontWeight: '600',
    marginTop: 2,
  },
  descMeta: {
    fontSize: 11,
    color: '#334155',
    lineHeight: 16,
    marginTop: 3,
  },
  locRightCol: {
    alignItems: 'flex-end',
    gap: 8,
  },
  mapsBtn: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#0f766e',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  mapsBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0f766e',
  },
  locTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0f766e',
    letterSpacing: 0.5,
  },
  locName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#134e4a',
    marginTop: 2,
  },
  locMeta: {
    fontSize: 12,
    color: '#115e59',
    marginTop: 2,
  },
  lastSync: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 6,
  },
  statusBadge: {
    backgroundColor: '#ccfbf1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0f766e',
  },
  actionHubGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  hubBtn: {
    flex: 1,
    minWidth: 140,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  hubIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  hubTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  hubSub: {
    fontSize: 10,
    color: '#4b5563',
    marginTop: 2,
  },
  varietyLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6b7280',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  varChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: '#f3f4f6',
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  varChipActive: {
    backgroundColor: '#dcfce7',
    borderColor: '#86efac',
  },
  varChipText: {
    fontSize: 11,
    color: '#4b5563',
    fontWeight: '600',
  },
  varChipTextActive: {
    color: '#166534',
    fontWeight: '700',
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
    fontSize: 26,
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
  },
  chillingAdvisory: {
    fontSize: 11,
    color: '#64748b',
    lineHeight: 15,
  },
  tierSection: {
    marginBottom: 14,
  },
  tierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 2,
  },
  tierTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  tierBadge: {
    fontSize: 10,
    color: '#6b7280',
    fontWeight: '600',
  },
  tierDesc: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
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
    maxWidth: 520,
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
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  modalInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 13,
    color: '#111827',
  },
  photoSimulateBox: {
    backgroundColor: '#f1f5f9',
    padding: 8,
    borderRadius: 6,
    marginVertical: 10,
  },
  photoSimulateText: {
    fontSize: 11,
    color: '#475569',
    fontFamily: 'monospace',
  },
  modalActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 10,
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
    backgroundColor: '#dc2626',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  modalConfirmText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  windowTable: {
    gap: 8,
    marginVertical: 10,
  },
  windowRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  windowTime: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1e293b',
  },
  windowAdvice: {
    fontSize: 11,
    color: '#475569',
  },
  windowStats: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
  },
  safeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  safeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  closeBtn: {
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 10,
  },
  closeBtnText: {
    fontSize: 13,
    color: '#0284c7',
    fontWeight: '700',
  },
});
