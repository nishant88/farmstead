import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useStore } from '../store/useStore';

interface MoreModulesModalProps {
  visible: boolean;
  onClose: () => void;
  activeRoute?: string;
}

export const MoreModulesModal: React.FC<MoreModulesModalProps> = ({
  visible,
  onClose,
  activeRoute,
}) => {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const {
    stockItems,
    documents,
    harvestBatches,
    insurancePolicies,
    language,
  } = useStore();

  const lowStockCount = stockItems.filter(
    (i) => i.currentQuantity <= i.reorderThreshold
  ).length;

  const unconfirmedDocsCount = documents.filter((d) => !d.isConfirmed).length;
  const totalBatchesCount = harvestBatches.length;
  const activeInsuranceCount = insurancePolicies.filter((p) => p.status === 'Active').length;

  const modules = [
    {
      id: 'stock',
      title: language === 'hi' ? 'स्टॉक एवं कीटनाशक' : 'Inventory & Stock',
      subtitle:
        language === 'hi'
          ? 'कीटनाशक रजिस्टर, CIB विषाक्तता वर्ग, पुनःआदेश अलर्ट'
          : 'Chemical register, CIB hazard classes & reorders',
      icon: '📦',
      route: '/(tabs)/stock',
      badge: lowStockCount > 0 ? `${lowStockCount} Low` : 'Optimal',
      badgeColor: lowStockCount > 0 ? '#fee2e2' : '#dcfce7',
      badgeTextColor: lowStockCount > 0 ? '#b91c1c' : '#15803d',
    },
    {
      id: 'finance',
      title: language === 'hi' ? 'वित्त एवं PMFBY बीमा' : 'Finance & PMFBY',
      subtitle:
        language === 'hi'
          ? 'सीजन खर्च, आय, WBCIS फसल बीमा व दावा रजिस्टर'
          : 'Seasonal expenses, revenues & WBCIS claim tracking',
      icon: '💰',
      route: '/(tabs)/finance',
      badge: `${activeInsuranceCount} Policy Active`,
      badgeColor: '#eff6ff',
      badgeTextColor: '#1d4ed8',
    },
    {
      id: 'documents',
      title: language === 'hi' ? 'बिल एवं OCR स्कैनर' : 'Bills & OCR Library',
      subtitle:
        language === 'hi'
          ? 'कागजी बिल कैमरा स्कैनर, ओलावृष्टि फोटो, मिट्टी परीक्षण'
          : 'Receipt camera scanner, hail damage photos & soil tests',
      icon: '📄',
      route: '/(tabs)/documents',
      badge: unconfirmedDocsCount > 0 ? `${unconfirmedDocsCount} Drafts` : 'Verified',
      badgeColor: unconfirmedDocsCount > 0 ? '#fef3c7' : '#f3f4f6',
      badgeTextColor: unconfirmedDocsCount > 0 ? '#b45309' : '#4b5563',
    },
    {
      id: 'listing',
      title: language === 'hi' ? 'फसल बिक्री लॉट' : 'Harvest Lots & Sales',
      subtitle:
        language === 'hi'
          ? 'ग्रेड A/B/C लॉट, व्हाट्सएप कैटलॉग जेनरेटर, मंडी प्रेषण'
          : 'Graded batches, WhatsApp catalog generator & buyer dispatch',
      icon: '🍎',
      route: '/(tabs)/listing',
      badge: `${totalBatchesCount} Batches`,
      badgeColor: '#fdf2f8',
      badgeTextColor: '#be185d',
    },
  ];

  const handleNavigate = (route: string) => {
    onClose();
    router.push(route as any);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={[styles.overlay, isDesktop && styles.overlayDesktop]}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={[styles.sheetContainer, isDesktop && styles.sheetDesktop]}>
          {/* Bottom Sheet Drag Handle */}
          <View style={styles.dragHandleContainer}>
            <View style={styles.dragHandle} />
          </View>

          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.sheetTitle}>
                {language === 'hi' ? 'अतिरिक्त ऑर्चर्ड मॉड्यूल' : 'All Orchard Modules'}
              </Text>
              <Text style={styles.sheetSub}>
                {language === 'hi'
                  ? 'त्वरित नेविगेशन के लिए किसी भी मॉड्यूल पर टैप करें'
                  : 'Tap to access inventory, finance, bills or sales'}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Modules List */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.moduleList}>
            {modules.map((m) => {
              const isActive = activeRoute?.includes(m.id);
              return (
                <TouchableOpacity
                  key={m.id}
                  style={[styles.moduleCard, isActive && styles.moduleCardActive]}
                  onPress={() => handleNavigate(m.route)}>
                  <View style={styles.moduleIconBox}>
                    <Text style={styles.moduleIcon}>{m.icon}</Text>
                  </View>
                  <View style={styles.moduleContent}>
                    <View style={styles.moduleTitleRow}>
                      <Text style={[styles.moduleTitle, isActive && styles.moduleTitleActive]}>
                        {m.title}
                      </Text>
                      <View style={[styles.moduleBadge, { backgroundColor: m.badgeColor }]}>
                        <Text style={[styles.moduleBadgeText, { color: m.badgeTextColor }]}>
                          {m.badge}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.moduleSubtitle} numberOfLines={2}>
                      {m.subtitle}
                    </Text>
                  </View>
                  <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Bottom Dismiss */}
          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelBtnText}>
              {language === 'hi' ? 'बंद करें' : 'Close Menu'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  overlayDesktop: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sheetContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 28,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    elevation: 10,
  },
  sheetDesktop: {
    borderRadius: 20,
    width: '100%',
    maxWidth: 520,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  dragHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#cbd5e1',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
    paddingTop: 2,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  sheetSub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
  },
  closeBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
  },
  moduleList: {
    gap: 10,
    paddingBottom: 8,
  },
  moduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  moduleCardActive: {
    backgroundColor: '#f0fdf4',
    borderColor: '#4ade80',
  },
  moduleIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  moduleIcon: {
    fontSize: 22,
  },
  moduleContent: {
    flex: 1,
  },
  moduleTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  moduleTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
  },
  moduleTitleActive: {
    color: '#15803d',
  },
  moduleBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  moduleBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  moduleSubtitle: {
    fontSize: 11,
    color: '#64748b',
    lineHeight: 15,
  },
  chevron: {
    fontSize: 20,
    fontWeight: '600',
    color: '#94a3b8',
    marginLeft: 4,
  },
  cancelBtn: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
});
