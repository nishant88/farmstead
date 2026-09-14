import React, { useState } from 'react';
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
import { ConfirmModal } from '../../components/ConfirmModal';
import { ExportCsvModal } from '../../components/ExportCsvModal';
import { ModuleQuickSwitcher } from '../../components/ModuleQuickSwitcher';

export default function DocumentsScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const {
    language,
    documents,
    confirmDocumentBill,
    deleteDocument,
    addDocument,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Simulated OCR Bill Scanner Draft state
  const [showScanPreviewModal, setShowScanPreviewModal] = useState(false);
  const [pendingReviewDocId, setPendingReviewDocId] = useState<string | null>(null);

  // New Document upload modal
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocCat, setNewDocCat] = useState<'Bill/Invoice' | 'Hail Damage Photo' | 'Soil Test' | 'Insurance Claim'>('Hail Damage Photo');

  // CSV Export Modal
  const [showExportModal, setShowExportModal] = useState(false);

  const categories = ['All', 'Bill/Invoice', 'Hail Damage Photo', 'Soil Test', 'Insurance Claim'];

  const filteredDocs = documents.filter((doc) => {
    const matchesCat = selectedCategory === 'All' || doc.category === selectedCategory;
    const matchesQuery =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.extractedDraft?.vendor || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const handleSimulateNewBillScan = () => {
    setShowScanPreviewModal(true);
  };

  const handleCreateScannedDocDraft = () => {
    addDocument({
      title: 'Draft Scan: Kotgarh Petrol Pump (Diesel for Power Sprayer)',
      category: 'Bill/Invoice',
      date: new Date().toISOString().split('T')[0],
      isConfirmed: false,
      extractedDraft: {
        vendor: 'Kotgarh Fuel & Auto Spares',
        item: 'Diesel 35 Liters @ ₹88/L',
        quantity: 35,
        amount: 3080,
        date: new Date().toISOString().split('T')[0],
      },
    });
    setShowScanPreviewModal(false);
  };

  const handleCreateManualDoc = () => {
    if (!newDocTitle) return;
    addDocument({
      title: newDocTitle,
      category: newDocCat,
      date: new Date().toISOString().split('T')[0],
      isConfirmed: true,
    });
    setShowUploadModal(false);
    setNewDocTitle('');
  };

  const pendingReviewDoc = documents.find((d) => d.id === pendingReviewDocId);

  return (
    <View style={styles.screen}>
      <Header
        title={language === 'hi' ? 'दस्तावेज़ एवं बिल स्कैनर' : 'Documents & OCR Bills'}
        subtitle="Receipt scanner, hail damage photos, and evidence library with manual verification"
        rightAction={
          <View style={styles.headerBtnRow}>
            <TouchableOpacity
              style={styles.exportBtn}
              onPress={() => setShowExportModal(true)}>
              <Text style={styles.exportBtnText}>📥 CSV</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.scanBtn}
              onPress={handleSimulateNewBillScan}>
              <Text style={styles.scanBtnText}>📸 Scan</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.uploadBtn}
              onPress={() => setShowUploadModal(true)}>
              <Text style={styles.uploadBtnText}>+ Photo</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <ModuleQuickSwitcher currentTab="documents" />

      <ScrollView contentContainerStyle={[styles.scrollContent, !isDesktop && styles.scrollContentMobile]}>
        {/* Search & Filter Bar */}
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            placeholder="🔍 Search all records across bills, damage photos, soil tests..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.catScroll}>
          {categories.map((c) => (
            <TouchableOpacity
              key={c}
              style={[
                styles.catChip,
                selectedCategory === c && styles.catChipActive,
              ]}
              onPress={() => setSelectedCategory(c)}>
              <Text
                style={[
                  styles.catChipText,
                  selectedCategory === c && styles.catChipTextActive,
                ]}>
                {c}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* OCR Principle Banner */}
        <Card style={styles.principleCard}>
          <Text style={styles.principleTitle}>
            🛡️ Strict Manual Confirmation Principle
          </Text>
          <Text style={styles.principleBody}>
            OCR-extracted bill data is always presented as an editable draft. It is never
            written into your Stock balances or Finance ledger without your explicit tap of
            approval.
          </Text>
        </Card>

        {/* Documents & Bills List */}
        <View style={styles.docList}>
          {filteredDocs.length === 0 ? (
            <Card>
              <Text style={styles.emptyText}>No documents match your search criteria.</Text>
            </Card>
          ) : (
            filteredDocs.map((doc) => (
              <Card
                key={doc.id}
                title={doc.title}
                subtitle={`${doc.category} • Added ${doc.date}`}
                badge={doc.isConfirmed ? 'Verified & Linked' : '⚠️ Pending Review'}
                badgeColor={doc.isConfirmed ? '#dcfce7' : '#fef3c7'}
                headerRight={
                  <TouchableOpacity
                    onPress={() => deleteDocument(doc.id)}
                    style={styles.deleteBtn}>
                    <Text style={styles.deleteBtnText}>Delete</Text>
                  </TouchableOpacity>
                }>
                {doc.extractedDraft ? (
                  <View style={styles.draftBox}>
                    <Text style={styles.draftHeading}>OCR Extracted Draft Details:</Text>
                    <View style={styles.draftRow}>
                      <Text style={styles.draftLabel}>Vendor:</Text>
                      <Text style={styles.draftVal}>{doc.extractedDraft.vendor}</Text>
                    </View>
                    <View style={styles.draftRow}>
                      <Text style={styles.draftLabel}>Item/Service:</Text>
                      <Text style={styles.draftVal}>{doc.extractedDraft.item}</Text>
                    </View>
                    <View style={styles.draftRow}>
                      <Text style={styles.draftLabel}>Extracted Total:</Text>
                      <Text style={[styles.draftVal, { color: '#b91c1c' }]}>
                        ₹{doc.extractedDraft.amount?.toLocaleString('en-IN')}
                      </Text>
                    </View>

                    {!doc.isConfirmed ? (
                      <TouchableOpacity
                        style={styles.reviewBtn}
                        onPress={() => setPendingReviewDocId(doc.id)}>
                        <Text style={styles.reviewBtnText}>
                          Tap to Review & Commit to Finance Ledger →
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.verifiedRow}>
                        <Text style={styles.verifiedText}>
                          ✓ Committed to Finance Ledger
                        </Text>
                      </View>
                    )}
                  </View>
                ) : (
                  <View style={styles.fileBox}>
                    <Text style={styles.fileIcon}>
                      {doc.category === 'Hail Damage Photo' ? '📸' : '📄'}
                    </Text>
                    <Text style={styles.fileText}>
                      Document archived permanently for audit, loan application, and insurance
                      inspection proof.
                    </Text>
                  </View>
                )}
              </Card>
            ))
          )}
        </View>
      </ScrollView>

      {/* OCR Scan Simulator Preview Modal */}
      {showScanPreviewModal && (
        <Modal visible={true} transparent animationType={isDesktop ? 'fade' : 'slide'}>
          <View style={[styles.modalOverlay, !isDesktop && styles.modalOverlayMobile]}>
            <View style={[styles.modalBox, !isDesktop && styles.modalBoxMobile]}>
              {!isDesktop && <View style={styles.sheetHandle} />}
              <Text style={styles.modalTitle}>Paper Bill Camera OCR Simulator</Text>
              <Text style={styles.modalSub}>
                Simulating camera snapshot and bounding box text extraction...
              </Text>

              <View style={styles.simulatedReceipt}>
                <View style={styles.receiptTop}>
                  <Text style={styles.receiptVendor}>KOTGARH FUEL & AUTO SPARES</Text>
                  <Text style={styles.receiptMeta}>GSTIN: 02AAACK9821R1ZX • INVOICE #892</Text>
                </View>
                <View style={styles.receiptBoundingBox}>
                  <Text style={styles.receiptItem}>[OCR DETECTED] High Speed Diesel - 35 L</Text>
                  <Text style={styles.receiptRate}>Rate: ₹88.00 / Liter</Text>
                  <Text style={styles.receiptTotal}>Total: ₹3,080.00</Text>
                </View>
                <Text style={styles.receiptFoot}>Date: {new Date().toISOString().split('T')[0]}</Text>
              </View>

              <View style={[styles.modalActions, !isDesktop && styles.modalActionsMobile]}>
                <TouchableOpacity
                  style={[styles.cancelBtn, !isDesktop && styles.mobileBtn]}
                  onPress={() => setShowScanPreviewModal(false)}>
                  <Text style={styles.cancelBtnText}>Discard</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.confirmBtn, !isDesktop && styles.mobileBtn]}
                  onPress={handleCreateScannedDocDraft}>
                  <Text style={styles.confirmBtnText}>Extract Draft for Review</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Manual Upload Photo/Document Modal */}
      {showUploadModal && (
        <Modal visible={true} transparent animationType={isDesktop ? 'fade' : 'slide'}>
          <View style={[styles.modalOverlay, !isDesktop && styles.modalOverlayMobile]}>
            <View style={[styles.modalBox, !isDesktop && styles.modalBoxMobile]}>
              {!isDesktop && <View style={styles.sheetHandle} />}
              <Text style={styles.modalTitle}>Attach Photo or Document</Text>
              <Text style={styles.modalSub}>
                Upload orchard condition, hail damage, or soil nutrient certificates.
              </Text>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Document Title:</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. Hail Damage - Block 2 Western Slope"
                  value={newDocTitle}
                  onChangeText={setNewDocTitle}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Category:</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                  {(['Hail Damage Photo', 'Soil Test', 'Insurance Claim', 'Bill/Invoice'] as const).map(
                    (cat) => (
                      <TouchableOpacity
                        key={cat}
                        style={[
                          styles.catChip,
                          newDocCat === cat && styles.catChipActive,
                        ]}
                        onPress={() => setNewDocCat(cat)}>
                        <Text
                          style={[
                            styles.catChipText,
                            newDocCat === cat && styles.catChipTextActive,
                          ]}>
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    )
                  )}
                </View>
              </View>

              <View style={[styles.modalActions, !isDesktop && styles.modalActionsMobile]}>
                <TouchableOpacity
                  style={[styles.cancelBtn, !isDesktop && styles.mobileBtn]}
                  onPress={() => setShowUploadModal(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.confirmBtn, !isDesktop && styles.mobileBtn]}
                  onPress={handleCreateManualDoc}>
                  <Text style={styles.confirmBtnText}>Attach Document</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Manual Review Modal */}
      {pendingReviewDoc && pendingReviewDoc.extractedDraft && (
        <ConfirmModal
          visible={true}
          title="Review & Confirm Bill OCR"
          subtitle="Verify the digitized values before saving to your official records"
          advisoryNote={`Confirming this bill will record a ₹${pendingReviewDoc.extractedDraft.amount?.toLocaleString('en-IN')} expense in your Finance ledger.`}
          details={[
            { label: 'Vendor', value: pendingReviewDoc.extractedDraft.vendor || 'Unknown' },
            { label: 'Purchased Item', value: pendingReviewDoc.extractedDraft.item || 'General' },
            { label: 'Billed Amount', value: `₹${pendingReviewDoc.extractedDraft.amount?.toLocaleString('en-IN')}` },
            { label: 'Receipt Date', value: pendingReviewDoc.extractedDraft.date || 'Today' },
          ]}
          confirmText="Confirm & Save to Expenses"
          cancelText="Keep as Unconfirmed Draft"
          onConfirm={() => {
            confirmDocumentBill(pendingReviewDoc.id);
            setPendingReviewDocId(null);
          }}
          onCancel={() => setPendingReviewDocId(null)}
        />
      )}

      {/* CSV Export Modal */}
      {showExportModal && (
        <ExportCsvModal
          visible={true}
          moduleName="DocumentsArchive"
          dataHeaders={['Title', 'Category', 'Date', 'Vendor', 'Amount', 'Confirmed']}
          dataRows={documents.map((d) => [
            d.title,
            d.category,
            d.date,
            d.extractedDraft?.vendor || 'N/A',
            d.extractedDraft?.amount || 0,
            d.isConfirmed ? 'Yes' : 'No',
          ])}
          onClose={() => setShowExportModal(false)}
        />
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
    padding: 16,
    maxWidth: 1000,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: 90,
  },
  scrollContentMobile: {
    padding: 12,
    paddingBottom: 90,
  },
  headerBtnRow: {
    flexDirection: 'row',
    gap: 6,
  },
  exportBtn: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  exportBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
  },
  scanBtn: {
    backgroundColor: '#0284c7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  scanBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  uploadBtn: {
    backgroundColor: '#2e7d32',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  uploadBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  searchBar: {
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
  },
  catScroll: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#e5e7eb',
    marginRight: 8,
  },
  catChipActive: {
    backgroundColor: '#2e7d32',
  },
  catChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4b5563',
  },
  catChipTextActive: {
    color: '#ffffff',
  },
  principleCard: {
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
    marginBottom: 14,
  },
  principleTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#92400e',
    marginBottom: 4,
  },
  principleBody: {
    fontSize: 12,
    color: '#78350f',
    lineHeight: 16,
  },
  docList: {
    gap: 8,
    marginBottom: 30,
  },
  deleteBtn: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: '#fee2e2',
  },
  deleteBtnText: {
    fontSize: 11,
    color: '#dc2626',
    fontWeight: '700',
  },
  draftBox: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 10,
    marginTop: 4,
    gap: 4,
  },
  draftHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6b7280',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  draftRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  draftLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  draftVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1f2937',
  },
  reviewBtn: {
    marginTop: 10,
    backgroundColor: '#2e7d32',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  reviewBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  verifiedRow: {
    marginTop: 6,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803d',
  },
  fileBox: {
    backgroundColor: '#f9fafb',
    padding: 10,
    borderRadius: 6,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  fileIcon: {
    fontSize: 20,
  },
  fileText: {
    fontSize: 12,
    color: '#4b5563',
    flex: 1,
    lineHeight: 16,
  },
  emptyText: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    paddingVertical: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalOverlayMobile: {
    justifyContent: 'flex-end',
    padding: 0,
  },
  modalBox: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 500,
  },
  modalBoxMobile: {
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
  simulatedReceipt: {
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#94a3b8',
    borderRadius: 8,
    padding: 14,
    marginBottom: 14,
  },
  receiptTop: {
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
    paddingBottom: 6,
    marginBottom: 8,
  },
  receiptVendor: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  receiptMeta: {
    fontSize: 10,
    color: '#64748b',
  },
  receiptBoundingBox: {
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: '#f59e0b',
    borderRadius: 4,
    padding: 8,
    gap: 2,
  },
  receiptItem: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400e',
  },
  receiptRate: {
    fontSize: 11,
    color: '#78350f',
  },
  receiptTotal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#b45309',
    marginTop: 2,
  },
  receiptFoot: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 8,
    fontStyle: 'italic',
  },
  formGroup: {
    marginBottom: 12,
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
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#111827',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 10,
  },
  modalActionsMobile: {
    flexDirection: 'column',
    gap: 8,
    marginTop: 14,
  },
  mobileBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    minHeight: 48,
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  cancelBtnText: {
    fontSize: 13,
    color: '#4b5563',
    fontWeight: '600',
  },
  confirmBtn: {
    backgroundColor: '#2e7d32',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  confirmBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
});
