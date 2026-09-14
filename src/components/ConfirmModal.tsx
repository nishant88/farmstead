import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, useWindowDimensions } from 'react-native';

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  subtitle?: string;
  advisoryNote?: string;
  details: { label: string; value: string }[];
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  title,
  subtitle,
  advisoryNote,
  details,
  confirmText = 'Confirm & Save',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
}) => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  return (
    <Modal visible={visible} transparent animationType={isDesktop ? 'fade' : 'slide'}>
      <View style={[styles.overlay, !isDesktop && styles.overlayMobile]}>
        <View style={[styles.content, !isDesktop && styles.contentMobile]}>
          {!isDesktop && <View style={styles.sheetHandle} />}

          <View style={styles.header}>
            <View style={styles.manualTag}>
              <Text style={styles.manualTagText}>MANUAL REVIEW REQUIRED</Text>
            </View>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>

          {advisoryNote && (
            <View style={styles.advisoryBox}>
              <Text style={styles.advisoryIcon}>ℹ️</Text>
              <Text style={styles.advisoryText}>{advisoryNote}</Text>
            </View>
          )}

          <View style={styles.detailsList}>
            {details.map((item, index) => (
              <View key={index} style={styles.detailRow}>
                <Text style={styles.detailLabel}>{item.label}</Text>
                <Text style={styles.detailValue}>{item.value}</Text>
              </View>
            ))}
          </View>

          <View style={[styles.actionRow, !isDesktop && styles.actionRowMobile]}>
            <TouchableOpacity style={[styles.cancelBtn, !isDesktop && styles.mobileBtn]} onPress={onCancel}>
              <Text style={styles.cancelBtnText}>{cancelText}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.confirmBtn, !isDesktop && styles.mobileBtn]} onPress={onConfirm}>
              <Text style={styles.confirmBtnText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  overlayMobile: {
    justifyContent: 'flex-end',
    padding: 0,
  },
  content: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 500,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  contentMobile: {
    maxWidth: '100%',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#cbd5e1',
    alignSelf: 'center',
    marginBottom: 14,
  },
  header: {
    marginBottom: 12,
  },
  manualTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 6,
  },
  manualTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#92400e',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  subtitle: {
    fontSize: 13,
    color: '#4b5563',
    marginTop: 2,
  },
  advisoryBox: {
    flexDirection: 'row',
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
    gap: 8,
  },
  advisoryIcon: {
    fontSize: 14,
  },
  advisoryText: {
    fontSize: 12,
    color: '#166534',
    flex: 1,
    lineHeight: 16,
  },
  detailsList: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 13,
    color: '#6b7280',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1f2937',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
  },
  actionRowMobile: {
    flexDirection: 'column',
    gap: 8,
  },
  mobileBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    minHeight: 48,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
  },
  confirmBtn: {
    backgroundColor: '#2e7d32',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  confirmBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
});
