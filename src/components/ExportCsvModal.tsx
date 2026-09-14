import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, useWindowDimensions } from 'react-native';

interface ExportCsvModalProps {
  visible: boolean;
  moduleName: string;
  dataHeaders: string[];
  dataRows: (string | number)[][];
  onClose: () => void;
}

export const ExportCsvModal: React.FC<ExportCsvModalProps> = ({
  visible,
  moduleName,
  dataHeaders,
  dataRows,
  onClose,
}) => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const [copied, setCopied] = useState(false);

  // Generate CSV text string
  const csvContent = [
    dataHeaders.join(','),
    ...dataRows.map((row) =>
      row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(',')
    ),
  ].join('\n');

  const handleDownloadOrCopy = () => {
    if (typeof window !== 'undefined' && window.document) {
      // Browser environment: trigger file download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute(
        'download',
        `OrchardLedger_${moduleName}_${new Date().toISOString().split('T')[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      onClose();
    }, 1500);
  };

  return (
    <Modal visible={visible} transparent animationType={isDesktop ? 'fade' : 'slide'}>
      <View style={[styles.overlay, !isDesktop && styles.overlayMobile]}>
        <View style={[styles.box, !isDesktop && styles.boxMobile]}>
          {!isDesktop && <View style={styles.sheetHandle} />}
          <Text style={styles.title}>Export {moduleName} as CSV</Text>
          <Text style={styles.subtitle}>
            Formatted for Kisan Credit Card (KCC) loan renewal, PMFBY insurance claims, and
            horticulture subsidy audits.
          </Text>

          <View style={styles.previewBox}>
            <Text style={styles.previewHeader}>CSV Content Preview ({dataRows.length} rows):</Text>
            <TextInput
              style={styles.csvText}
              multiline
              editable={false}
              value={csvContent.slice(0, 400) + (csvContent.length > 400 ? '\n...[truncated]' : '')}
            />
          </View>

          <View style={[styles.actionRow, !isDesktop && styles.actionRowMobile]}>
            <TouchableOpacity style={[styles.cancelBtn, !isDesktop && styles.mobileBtn]} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.exportBtn, !isDesktop && styles.mobileBtn]} onPress={handleDownloadOrCopy}>
              <Text style={styles.exportText}>
                {copied ? '✓ Exported File' : '📥 Download CSV File'}
              </Text>
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  overlayMobile: {
    justifyContent: 'flex-end',
    padding: 0,
  },
  box: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 500,
  },
  boxMobile: {
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
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    marginBottom: 12,
    lineHeight: 16,
  },
  previewBox: {
    marginBottom: 16,
  },
  previewHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4b5563',
    marginBottom: 4,
  },
  csvText: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 10,
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#334155',
    maxHeight: 120,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  actionRowMobile: {
    flexDirection: 'column',
    gap: 8,
    marginTop: 10,
  },
  mobileBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    minHeight: 48,
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  cancelText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4b5563',
  },
  exportBtn: {
    backgroundColor: '#2e7d32',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  exportText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
});
