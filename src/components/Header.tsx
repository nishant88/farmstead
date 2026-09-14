import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Linking,
  useWindowDimensions,
} from 'react-native';
import { useStore } from '../store/useStore';
import { ORCHARD_LOCATIONS } from '../constants/locations';
import { OrchardLocation } from '../models/types';

interface HeaderProps {
  title: string;
  subtitle?: string;
  rightAction?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, rightAction }) => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const {
    language,
    setLanguage,
    activeLocation,
    setActiveLocation,
    weatherAlerts,
  } = useStore();

  const [showLocationModal, setShowLocationModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Custom location entry toggle & state
  const [showCustomEntry, setShowCustomEntry] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customElevation, setCustomElevation] = useState('');
  const [customDistrict, setCustomDistrict] = useState('Distt Shimla, Himachal Pradesh');

  const activeAlertCount = weatherAlerts.filter((a) => !a.isDismissed).length;

  const categories = ['All', 'Kotkhai Belt', 'Upper Shimla', 'Kinnaur & Kullu', 'Other Regions'];

  // Filtered locations
  const filteredLocations = useMemo(() => {
    return ORCHARD_LOCATIONS.filter((loc) => {
      const matchesCategory =
        selectedCategory === 'All' || loc.category === selectedCategory;

      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        loc.name.toLowerCase().includes(q) ||
        loc.district.toLowerCase().includes(q) ||
        (loc.plusCode && loc.plusCode.toLowerCase().includes(q)) ||
        (loc.pincode && loc.pincode.toLowerCase().includes(q)) ||
        loc.elevationMeters.toString().includes(q) ||
        (loc.description && loc.description.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleApplyCustomLocation = () => {
    if (!customName.trim()) {
      alert('Please enter an orchard location name.');
      return;
    }
    const elev = Number(customElevation);
    if (!elev || elev <= 0) {
      alert('Please enter a valid elevation in meters.');
      return;
    }

    const newLoc: OrchardLocation = {
      name: customName.trim(),
      elevationMeters: Math.round(elev),
      district: customDistrict.trim() || 'Himachal Pradesh',
      category: 'Upper Shimla',
      chillingZone:
        elev >= 2200
          ? 'High Chill (>2,200m)'
          : elev >= 1800
          ? 'Mid Chill (1,800-2,200m)'
          : 'Valley Bench (<1,800m)',
      description: `Grower-specified private orchard elevation calibrated at ${Math.round(elev)}m MSL.`,
    };

    setActiveLocation(newLoc);
    setShowCustomEntry(false);
    setShowLocationModal(false);
  };

  return (
    <View style={styles.container}>
      {/* Top Meta Bar: Location Pill + Alerts (Left), Offline Status + Language (Right) */}
      <View style={styles.topRow}>
        <View style={styles.topLeftGroup}>
          <TouchableOpacity
            style={styles.locationBadge}
            activeOpacity={0.7}
            onPress={() => setShowLocationModal(true)}>
            <Text style={styles.locationDot}>📍</Text>
            <Text
              style={[
                styles.locationText,
                { maxWidth: isDesktop ? 300 : width < 380 ? 150 : 200 },
              ]}
              numberOfLines={1}>
              {activeLocation.name}
            </Text>
            <Text style={styles.elevPill}>
              {activeLocation.elevationMeters}m ▾
            </Text>
          </TouchableOpacity>

          {activeAlertCount > 0 && (
            <View style={styles.alertBadge}>
              <Text style={styles.alertText}>
                ⚠️ {activeAlertCount}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.topRightGroup}>
          <View style={styles.syncBadge}>
            <View style={styles.syncIndicator} />
            <Text style={styles.syncText}>
              {isDesktop
                ? language === 'hi'
                  ? 'ऑफलाइन तैयार'
                  : 'Offline-Ready'
                : 'Offline'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.langBtn}
            activeOpacity={0.7}
            onPress={() => setLanguage(language === 'en' ? 'hi' : 'en')}>
            <Text style={styles.langBtnText}>
              {language === 'en' ? '🌐 हिंदी' : '🌐 EN'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Screen Title & Action Button Row */}
      <View style={[styles.titleRow, !isDesktop && styles.titleRowMobile]}>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <Text style={[styles.title, !isDesktop && styles.titleMobile]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.subtitle, !isDesktop && styles.subtitleMobile]} numberOfLines={isDesktop ? 2 : 1}>
              {subtitle}
            </Text>
          )}
        </View>
        {rightAction && <View style={styles.rightActionContainer}>{rightAction}</View>}
      </View>

      {/* Responsive Location Selector Modal (Mobile Bottom Sheet / Desktop Centered) */}
      {showLocationModal && (
        <Modal visible={true} transparent animationType="slide">
          <View style={[styles.modalOverlay, isDesktop && styles.modalOverlayDesktop]}>
            <TouchableOpacity
              style={styles.modalBackdrop}
              activeOpacity={1}
              onPress={() => setShowLocationModal(false)}
            />

            <View style={[styles.modalBox, isDesktop && styles.modalBoxDesktop]}>
              {/* Drag Handle for Mobile */}
              {!isDesktop && (
                <View style={styles.dragHandleContainer}>
                  <View style={styles.dragHandle} />
                </View>
              )}

              {/* Header */}
              <View style={styles.modalTopRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalTitle}>Select Orchard Location & Elevation</Text>
                  <Text style={styles.modalSub}>
                    Calibrated for Kotkhai, Upper Shimla & Himalayan micro-climates (changes every 200m).
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.closeIconBtn}
                  onPress={() => setShowLocationModal(false)}>
                  <Text style={styles.closeIconText}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Search Bar */}
              <View style={styles.searchRow}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search Kotkhai, Shahoon (3HVR), Kiari, Gumma, Shimla..."
                  placeholderTextColor="#9ca3af"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Text style={styles.clearSearchText}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Category Filter Chips */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryScroll}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryChip,
                      selectedCategory === cat && styles.categoryChipActive,
                      cat === 'Kotkhai Belt' && styles.kotkhaiHighlightChip,
                    ]}
                    onPress={() => setSelectedCategory(cat)}>
                    <Text
                      style={[
                        styles.categoryChipText,
                        selectedCategory === cat && styles.categoryChipTextActive,
                        cat === 'Kotkhai Belt' && styles.kotkhaiHighlightText,
                      ]}>
                      {cat === 'Kotkhai Belt' ? '🍏 Kotkhai Belt' : cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Location List */}
              <ScrollView style={styles.locationListScroll} showsVerticalScrollIndicator={true}>
                {filteredLocations.length === 0 ? (
                  <View style={styles.noResultsBox}>
                    <Text style={styles.noResultsText}>No locations match "{searchQuery}"</Text>
                    <Text style={styles.noResultsSub}>
                      You can add your custom orchard elevation below.
                    </Text>
                  </View>
                ) : (
                  filteredLocations.map((loc, idx) => {
                    const isActive = activeLocation.name === loc.name;
                    return (
                      <TouchableOpacity
                        key={idx}
                        style={[styles.locCard, isActive && styles.locCardActive]}
                        activeOpacity={0.7}
                        onPress={() => {
                          setActiveLocation(loc);
                          setShowLocationModal(false);
                        }}>
                        <View style={styles.locCardMain}>
                          <View style={styles.locCardTop}>
                            <View style={styles.titleWithBadges}>
                              <Text style={[styles.locName, isActive && styles.locNameActive]}>
                                {loc.name}
                              </Text>
                              {loc.plusCode && (
                                <View style={styles.plusCodeTag}>
                                  <Text style={styles.plusCodeTagText}>📍 {loc.plusCode}</Text>
                                </View>
                              )}
                            </View>
                            <View style={styles.elevationBadge}>
                              <Text style={styles.elevationMetersText}>
                                {loc.elevationMeters}m MSL
                              </Text>
                              <Text style={styles.elevationFeetText}>
                                ~{Math.round(loc.elevationMeters * 3.28084)} ft
                              </Text>
                            </View>
                          </View>

                          <View style={styles.locDetailsRow}>
                            <Text style={styles.locDistrict}>
                              {loc.district} {loc.pincode ? `• PIN ${loc.pincode}` : ''}
                            </Text>
                            {loc.chillingZone && (
                              <Text style={styles.chillingZoneBadge}>
                                ❄️ {loc.chillingZone}
                              </Text>
                            )}
                          </View>

                          {loc.description && (
                            <Text style={styles.locDescText} numberOfLines={2}>
                              {loc.description}
                            </Text>
                          )}

                          <View style={styles.locActionRow}>
                            {loc.googleMapsUrl && (
                              <TouchableOpacity
                                style={styles.mapsLinkBtn}
                                onPress={() => Linking.openURL(loc.googleMapsUrl!)}>
                                <Text style={styles.mapsLinkText}>🗺️ View on Maps</Text>
                              </TouchableOpacity>
                            )}

                            {isActive ? (
                              <View style={styles.activeCheckBadge}>
                                <Text style={styles.activeCheckText}>✓ Active</Text>
                              </View>
                            ) : (
                              <Text style={styles.tapToSelectText}>Tap to select</Text>
                            )}
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })
                )}

                {/* Custom Location Entry */}
                <View style={styles.customSection}>
                  <TouchableOpacity
                    style={styles.customToggleBtn}
                    onPress={() => setShowCustomEntry(!showCustomEntry)}>
                    <Text style={styles.customToggleText}>
                      {showCustomEntry
                        ? '▲ Hide Custom Orchard Input'
                        : '➕ Set Custom Orchard Name & Exact Elevation'}
                    </Text>
                  </TouchableOpacity>

                  {showCustomEntry && (
                    <View style={styles.customFormBox}>
                      <Text style={styles.customFormTitle}>
                        Enter Custom Micro-Elevation Details
                      </Text>
                      <TextInput
                        style={styles.customInput}
                        placeholder="Orchard / Ridge Name (e.g. Upper Kotkhai Dhar)"
                        placeholderTextColor="#9ca3af"
                        value={customName}
                        onChangeText={setCustomName}
                      />
                      <TextInput
                        style={styles.customInput}
                        placeholder="Exact Elevation in Meters (e.g. 2350)"
                        placeholderTextColor="#9ca3af"
                        keyboardType="numeric"
                        value={customElevation}
                        onChangeText={setCustomElevation}
                      />
                      <TextInput
                        style={styles.customInput}
                        placeholder="District / Tehsil (e.g. Kotkhai, Shimla)"
                        placeholderTextColor="#9ca3af"
                        value={customDistrict}
                        onChangeText={setCustomDistrict}
                      />
                      <TouchableOpacity
                        style={styles.applyCustomBtn}
                        onPress={handleApplyCustomLocation}>
                        <Text style={styles.applyCustomBtnText}>
                          Apply Custom Orchard Elevation
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </ScrollView>

              {/* Bottom Close Button */}
              <TouchableOpacity
                style={styles.closeModalBtn}
                onPress={() => setShowLocationModal(false)}>
                <Text style={styles.closeModalText}>Close Window</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  topLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  topRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f8e9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#c5e1a5',
    maxWidth: '85%',
  },
  locationDot: {
    fontSize: 10,
    marginRight: 4,
  },
  locationText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#33691e',
  },
  elevPill: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2e7d32',
    marginLeft: 3,
  },
  syncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 10,
  },
  syncIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2e7d32',
    marginRight: 4,
  },
  syncText: {
    fontSize: 10,
    color: '#2e7d32',
    fontWeight: '700',
  },
  alertBadge: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  alertText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#b91c1c',
  },
  langBtn: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  langBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  titleRowMobile: {
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  titleMobile: {
    fontSize: 19,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 1,
  },
  subtitleMobile: {
    fontSize: 11,
  },
  rightActionContainer: {
    marginLeft: 8,
  },

  // Modal / Bottom Sheet Styles
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
    maxWidth: 620,
    maxHeight: '85%',
    paddingBottom: 16,
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
  modalTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
  },
  modalSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  closeIconBtn: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    marginLeft: 8,
  },
  closeIconText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
  },

  // Search Bar
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1.2,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
    minHeight: 44,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0f172a',
    padding: 0,
  },
  clearSearchText: {
    fontSize: 14,
    color: '#94a3b8',
    paddingHorizontal: 6,
  },

  // Category Filter Chips
  categoryScroll: {
    marginBottom: 10,
    maxHeight: 38,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  categoryChipActive: {
    backgroundColor: '#15803d',
    borderColor: '#15803d',
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  categoryChipTextActive: {
    color: '#ffffff',
  },
  kotkhaiHighlightChip: {
    borderColor: '#86efac',
    backgroundColor: '#f0fdf4',
  },
  kotkhaiHighlightText: {
    color: '#166534',
    fontWeight: '700',
  },

  // Location Cards List
  locationListScroll: {
    maxHeight: 380,
  },
  noResultsBox: {
    padding: 24,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
  },
  noResultsSub: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  locCard: {
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    marginBottom: 10,
    padding: 12,
  },
  locCardActive: {
    backgroundColor: '#f0fdf4',
    borderColor: '#4ade80',
    borderWidth: 1.5,
  },
  locCardMain: {
    flex: 1,
  },
  locCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  titleWithBadges: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  locName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  locNameActive: {
    color: '#15803d',
  },
  plusCodeTag: {
    backgroundColor: '#e0f2fe',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  plusCodeTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0369a1',
  },
  elevationBadge: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  elevationMetersText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#166534',
  },
  elevationFeetText: {
    fontSize: 10,
    color: '#64748b',
  },
  locDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    marginTop: 2,
    marginBottom: 4,
  },
  locDistrict: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '500',
  },
  chillingZoneBadge: {
    fontSize: 10,
    fontWeight: '600',
    color: '#0284c7',
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  locDescText: {
    fontSize: 11,
    color: '#64748b',
    lineHeight: 15,
    marginTop: 2,
    marginBottom: 6,
  },
  locActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  mapsLinkBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  mapsLinkText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563eb',
  },
  activeCheckBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  activeCheckText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803d',
  },
  tapToSelectText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8',
  },

  // Custom Elevation Entry
  customSection: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 8,
  },
  customToggleBtn: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  customToggleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563eb',
  },
  customFormBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  customFormTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  customInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#1e293b',
    marginBottom: 8,
    minHeight: 44,
  },
  applyCustomBtn: {
    backgroundColor: '#0f766e',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyCustomBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },

  // Modal Bottom Close
  closeModalBtn: {
    marginTop: 12,
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
  },
  closeModalText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
});
