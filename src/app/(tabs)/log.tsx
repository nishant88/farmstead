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
import { Treatment } from '../../models/types';

export default function SprayLogScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const {
    language,
    treatments,
    blocks,
    addTreatment,
    updateTreatment,
    confirmTreatment,
    deleteTreatment,
  } = useStore();

  const [selectedBlockId, setSelectedBlockId] = useState<string>('all');
  const [filterPest, setFilterPest] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formBlockId, setFormBlockId] = useState(blocks[0]?.id || 'b1');
  const [productName, setProductName] = useState('');
  const [dosage, setDosage] = useState('');
  const [quantity, setQuantity] = useState('');
  const [cost, setCost] = useState('');
  const [targetPest, setTargetPest] = useState('');
  const [weatherAtTime, setWeatherAtTime] = useState('Clear, Calm wind (<8 km/h)');
  const [activeWarning, setActiveWarning] = useState<string | null>(null);

  // CSV Export Modal
  const [showExportModal, setShowExportModal] = useState(false);

  // Manual trigger confirmation modal state
  const [pendingConfirmation, setPendingConfirmation] = useState<{
    id: string;
    product: string;
    qty: number;
    cost: number;
    stockDeductionNote: string;
  } | null>(null);

  // Simulated "Identify from photo" advisory draft
  const [aiDraftModal, setAiDraftModal] = useState<{
    pest: string;
    confidence: number;
    suggestedProduct: string;
    suggestedDosage: string;
    advisory: string;
  } | null>(null);

  const checkOveruseWarning = (product: string) => {
    const lower = product.toLowerCase();
    const recentCaptan = treatments.some((t) =>
      t.productName.toLowerCase().includes('captan')
    );
    if (lower.includes('hmo') && recentCaptan) {
      return '⚠️ Chemical Conflict Warning: Horticultural Mineral Oil (HMO) applied within 14 days of Captan or Sulphur causes severe phytotoxicity and leaf scorch in apple foliage.';
    }
    if (lower.includes('dithiocarbamate') || lower.includes('mancozeb')) {
      const mancozebCount = treatments.filter((t) =>
        t.productName.toLowerCase().includes('mancozeb')
      ).length;
      if (mancozebCount >= 3) {
        return '⚠️ Resistance Warning: Mancozeb applied more than 3 times in a single season increases fungal resistance risk (UHF Nauni guidelines).';
      }
    }
    return null;
  };

  const handleProductChange = (text: string) => {
    setProductName(text);
    const warning = checkOveruseWarning(text);
    setActiveWarning(warning);
  };

  const handleOpenEdit = (t: Treatment) => {
    setEditingId(t.id);
    setFormBlockId(t.blockId);
    setProductName(t.productName);
    setDosage(t.dosage);
    setQuantity(t.quantity.toString());
    setCost(t.cost.toString());
    setTargetPest(t.targetPest);
    setWeatherAtTime(t.weatherAtTime);
    setActiveWarning(t.overuseWarning || null);
    setShowFormModal(true);
  };

  const handleSaveTreatment = () => {
    if (!productName || !quantity || !cost) {
      alert('Please fill in Product Name, Quantity, and Cost.');
      return;
    }

    const qtyNum = Number(quantity) || 1;
    const costNum = Number(cost) || 0;

    if (editingId) {
      // Update existing
      updateTreatment(editingId, {
        blockId: formBlockId,
        productName,
        quantity: qtyNum,
        dosage,
        cost: costNum,
        targetPest,
        weatherAtTime,
        overuseWarning: activeWarning || undefined,
      });
      setShowFormModal(false);
      setEditingId(null);
    } else {
      // Add new draft
      const newEntry = addTreatment({
        blockId: formBlockId,
        date: new Date().toISOString().split('T')[0],
        treeCountOrArea: 'Block trees',
        productName,
        quantity: qtyNum,
        dosage: dosage || 'Standard recommended dilution',
        cost: costNum,
        targetPest: targetPest || 'General preventative spray',
        weatherAtTime,
        isConfirmed: false,
        overuseWarning: activeWarning || undefined,
      });

      setShowFormModal(false);
      setPendingConfirmation({
        id: newEntry.id,
        product: newEntry.productName,
        qty: qtyNum,
        cost: costNum,
        stockDeductionNote: `Deduct ${qtyNum} units from Inventory and record ₹${costNum.toLocaleString()} in Expenses.`,
      });
    }

    setProductName('');
    setDosage('');
    setQuantity('');
    setCost('');
    setTargetPest('');
    setActiveWarning(null);
  };

  const handleTriggerPhotoId = () => {
    setAiDraftModal({
      pest: 'Apple Scab (Venturia inaequalis) - Olive Green Leaf Lesion',
      confidence: 94,
      suggestedProduct: 'Captan 50 WP',
      suggestedDosage: '250g / 100L water',
      advisory:
        'Advisory only: Confirm with your local Block Horticulture Development Officer (HDO) or KVK scientist before spraying. Never auto-spray.',
    });
  };

  const handleApplyAiDraft = () => {
    if (!aiDraftModal) return;
    setEditingId(null);
    setProductName(aiDraftModal.suggestedProduct);
    setDosage(aiDraftModal.suggestedDosage);
    setTargetPest(aiDraftModal.pest);
    setQuantity('4');
    setCost('3400');
    setAiDraftModal(null);
    setShowFormModal(true);
  };

  const filteredTreatments = treatments.filter((t) => {
    const matchesBlock = selectedBlockId === 'all' || t.blockId === selectedBlockId;
    const matchesPest = filterPest === 'All' || t.targetPest.toLowerCase().includes(filterPest.toLowerCase());
    const matchesQuery =
      t.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.targetPest.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesBlock && matchesPest && matchesQuery;
  });

  return (
    <View style={styles.screen}>
      <Header
        title={language === 'hi' ? 'कीटनाशक एवं स्प्रे लॉग' : 'Crop & Pesticide Log'}
        subtitle="Spray records, chemical overuse flags, and verified inventory deductions"
        rightAction={
          <View style={styles.headerBtnRow}>
            <TouchableOpacity
              style={styles.exportBtn}
              onPress={() => setShowExportModal(true)}>
              <Text style={styles.exportBtnText}>📥 CSV</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerBtn}
              onPress={() => {
                setEditingId(null);
                setProductName('');
                setQuantity('');
                setCost('');
                setDosage('');
                setTargetPest('');
                setActiveWarning(null);
                setShowFormModal(true);
              }}>
              <Text style={styles.headerBtnText}>+ Log Spray</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <ModuleQuickSwitcher currentTab="log" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Manual Photo Diagnostic Banner */}
        <Card
          title="Manual AI Pest / Disease Diagnostic"
          subtitle="Advisory assistance only — requires your explicit manual confirmation"
          badge="Manual Trigger"
          badgeColor="#e0e7ff">
          <Text style={styles.aiHelpText}>
            Notice suspicious olive lesions, powery mildew, or mite webbing? Upload an
            orchard leaf photo to generate an advisory suggestion.
          </Text>
          <TouchableOpacity style={styles.photoIdBtn} onPress={handleTriggerPhotoId}>
            <Text style={styles.photoIdBtnText}>📸 Tap: Identify From Photo</Text>
          </TouchableOpacity>
        </Card>

        {/* Search & Filter Controls */}
        <View style={styles.filterRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="🔍 Filter by chemical or disease..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Block Filter Scroll */}
        <View style={styles.blockFilterBox}>
          <Text style={styles.filterTitle}>Block Timeline:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[
                styles.chip,
                selectedBlockId === 'all' && styles.chipActive,
              ]}
              onPress={() => setSelectedBlockId('all')}>
              <Text
                style={[
                  styles.chipText,
                  selectedBlockId === 'all' && styles.chipTextActive,
                ]}>
                All Blocks ({treatments.length})
              </Text>
            </TouchableOpacity>
            {blocks.map((b) => (
              <TouchableOpacity
                key={b.id}
                style={[
                  styles.chip,
                  selectedBlockId === b.id && styles.chipActive,
                ]}
                onPress={() => setSelectedBlockId(b.id)}>
                <Text
                  style={[
                    styles.chipText,
                    selectedBlockId === b.id && styles.chipTextActive,
                  ]}>
                  {b.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Timeline Entries */}
        <View style={styles.timelineList}>
          {filteredTreatments.length === 0 ? (
            <Card>
              <Text style={styles.emptyText}>No spray records match your criteria.</Text>
            </Card>
          ) : (
            filteredTreatments.map((t) => {
              const block = blocks.find((b) => b.id === t.blockId);
              return (
                <Card
                  key={t.id}
                  title={`${t.productName} (${t.quantity} units)`}
                  subtitle={`${block?.name || 'Orchard'} • ${t.date}`}
                  badge={t.isConfirmed ? 'Linked & Confirmed' : 'Draft Pending'}
                  badgeColor={t.isConfirmed ? '#dcfce7' : '#fef3c7'}
                  headerRight={
                    <View style={styles.actionBtnRow}>
                      <TouchableOpacity
                        onPress={() => handleOpenEdit(t)}
                        style={styles.editBtn}>
                        <Text style={styles.editBtnText}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => deleteTreatment(t.id)}
                        style={styles.delBtn}>
                        <Text style={styles.delBtnText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  }>
                  <View style={styles.treatmentGrid}>
                    <View style={styles.tCol}>
                      <Text style={styles.tKey}>Target Disease:</Text>
                      <Text style={styles.tVal}>{t.targetPest}</Text>
                    </View>
                    <View style={styles.tCol}>
                      <Text style={styles.tKey}>Dosage Dilution:</Text>
                      <Text style={styles.tVal}>{t.dosage}</Text>
                    </View>
                    <View style={styles.tCol}>
                      <Text style={styles.tKey}>Total Cost:</Text>
                      <Text style={styles.tVal}>₹{t.cost.toLocaleString('en-IN')}</Text>
                    </View>
                    <View style={styles.tCol}>
                      <Text style={styles.tKey}>Weather at Spray:</Text>
                      <Text style={styles.tVal}>{t.weatherAtTime}</Text>
                    </View>
                  </View>

                  {t.overuseWarning && (
                    <View style={styles.savedWarningBox}>
                      <Text style={styles.savedWarningText}>{t.overuseWarning}</Text>
                    </View>
                  )}

                  {!t.isConfirmed && (
                    <TouchableOpacity
                      style={styles.confirmPendingBtn}
                      onPress={() =>
                        setPendingConfirmation({
                          id: t.id,
                          product: t.productName,
                          qty: t.quantity,
                          cost: t.cost,
                          stockDeductionNote: `Deduct ${t.quantity} units & record ₹${t.cost} expense.`,
                        })
                      }>
                      <Text style={styles.confirmPendingBtnText}>
                        Tap to Confirm & Link to Stock/Expenses →
                      </Text>
                    </TouchableOpacity>
                  )}
                </Card>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Add / Edit Spray Modal (Bottom sheet on mobile) */}
      {showFormModal && (
        <Modal visible={true} transparent animationType="slide">
          <View style={[styles.modalOverlay, isDesktop && styles.modalOverlayDesktop]}>
            <TouchableOpacity
              style={styles.modalBackdrop}
              activeOpacity={1}
              onPress={() => setShowFormModal(false)}
            />
            <View style={[styles.modalBox, isDesktop && styles.modalBoxDesktop]}>
              {!isDesktop && (
                <View style={styles.dragHandleContainer}>
                  <View style={styles.dragHandle} />
                </View>
              )}
              <Text style={styles.modalTitle}>
                {editingId ? 'Edit Spray Record' : 'Record Chemical Treatment'}
              </Text>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Block / Field:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {blocks.map((b) => (
                    <TouchableOpacity
                      key={b.id}
                      style={[
                        styles.chip,
                        formBlockId === b.id && styles.chipActive,
                      ]}
                      onPress={() => setFormBlockId(b.id)}>
                      <Text
                        style={[
                          styles.chipText,
                          formBlockId === b.id && styles.chipTextActive,
                        ]}>
                        {b.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Product Name / Chemical:</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. Captan 50 WP, HMO, Mancozeb"
                  value={productName}
                  onChangeText={handleProductChange}
                />
              </View>

              {activeWarning && (
                <View style={styles.warningBox}>
                  <Text style={styles.warningText}>{activeWarning}</Text>
                </View>
              )}

              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Dosage (per 100L):</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="e.g. 250g / 100L"
                    value={dosage}
                    onChangeText={setDosage}
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Quantity Applied:</Text>
                  <TextInput
                    style={styles.modalInput}
                    keyboardType="numeric"
                    placeholder="e.g. 4"
                    value={quantity}
                    onChangeText={setQuantity}
                  />
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Total Cost (₹):</Text>
                  <TextInput
                    style={styles.modalInput}
                    keyboardType="numeric"
                    placeholder="e.g. 3400"
                    value={cost}
                    onChangeText={setCost}
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Target Disease:</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="e.g. Apple Scab"
                    value={targetPest}
                    onChangeText={setTargetPest}
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Weather Conditions During Spray:</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. Clear, Calm (<5 km/h wind)"
                  value={weatherAtTime}
                  onChangeText={setWeatherAtTime}
                />
              </View>

              <View style={styles.modalActionRow}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setShowFormModal(false)}>
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalConfirmBtn}
                  onPress={handleSaveTreatment}>
                  <Text style={styles.modalConfirmText}>
                    {editingId ? 'Save Edits' : 'Review & Confirm'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Manual Trigger Link Confirmation Modal */}
      {pendingConfirmation && (
        <ConfirmModal
          visible={true}
          title="Confirm Spray Application"
          subtitle="Links to Inventory (stock deduction) & Finance (expense)"
          advisoryNote="Confirming this entry will automatically deduct stock from Inventory and generate a linked expense in Finance."
          details={[
            { label: 'Product Applied', value: pendingConfirmation.product },
            { label: 'Quantity to Deduct', value: `${pendingConfirmation.qty} units` },
            { label: 'Expense to Record', value: `₹${pendingConfirmation.cost.toLocaleString('en-IN')}` },
            { label: 'Audit Link', value: pendingConfirmation.stockDeductionNote },
          ]}
          confirmText="Confirm & Commit Changes"
          cancelText="Keep as Unconfirmed Draft"
          onConfirm={() => {
            confirmTreatment(pendingConfirmation.id);
            setPendingConfirmation(null);
          }}
          onCancel={() => setPendingConfirmation(null)}
        />
      )}

      {/* AI Photo ID Modal */}
      {aiDraftModal && (
        <ConfirmModal
          visible={true}
          title="Advisory Foliar Diagnostic"
          subtitle={`Confidence: ${aiDraftModal.confidence}%`}
          advisoryNote={aiDraftModal.advisory}
          details={[
            { label: 'Visual Lesion', value: aiDraftModal.pest },
            { label: 'Suggested Chemical', value: aiDraftModal.suggestedProduct },
            { label: 'Recommended Dose', value: aiDraftModal.suggestedDosage },
            { label: 'Farmer Control', value: 'Pre-fills draft log for manual editing' },
          ]}
          confirmText="Pre-fill Spray Entry"
          cancelText="Dismiss Advisory"
          onConfirm={handleApplyAiDraft}
          onCancel={() => setAiDraftModal(null)}
        />
      )}

      {/* CSV Export Modal */}
      {showExportModal && (
        <ExportCsvModal
          visible={true}
          moduleName="SprayLogs"
          dataHeaders={['Date', 'BlockId', 'Product', 'Quantity', 'Cost', 'TargetPest', 'Weather', 'Confirmed']}
          dataRows={treatments.map((t) => [
            t.date,
            t.blockId,
            t.productName,
            t.quantity,
            t.cost,
            t.targetPest,
            t.weatherAtTime,
            t.isConfirmed ? 'Yes' : 'No',
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
  headerBtnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  exportBtn: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  exportBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
  },
  headerBtn: {
    backgroundColor: '#2e7d32',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  headerBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  aiHelpText: {
    fontSize: 13,
    color: '#4b5563',
    lineHeight: 18,
    marginBottom: 10,
  },
  photoIdBtn: {
    backgroundColor: '#3b82f6',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  photoIdBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  filterRow: {
    marginBottom: 10,
  },
  searchInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#111827',
  },
  blockFilterBox: {
    marginBottom: 14,
  },
  filterTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6b7280',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: '#dcfce7',
    borderColor: '#86efac',
  },
  chipText: {
    fontSize: 12,
    color: '#4b5563',
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#166534',
    fontWeight: '700',
  },
  timelineList: {
    gap: 8,
    marginBottom: 30,
  },
  emptyText: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    paddingVertical: 10,
  },
  actionBtnRow: {
    flexDirection: 'row',
    gap: 6,
  },
  editBtn: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  editBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4b5563',
  },
  delBtn: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  delBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#dc2626',
  },
  treatmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 10,
  },
  tCol: {
    flex: 1,
    minWidth: 140,
  },
  tKey: {
    fontSize: 11,
    color: '#6b7280',
  },
  tVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 1,
  },
  savedWarningBox: {
    marginTop: 8,
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fde68a',
    padding: 8,
    borderRadius: 6,
  },
  savedWarningText: {
    fontSize: 11,
    color: '#92400e',
    fontWeight: '600',
    lineHeight: 15,
  },
  confirmPendingBtn: {
    marginTop: 10,
    backgroundColor: '#dcfce7',
    borderWidth: 1,
    borderColor: '#86efac',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  confirmPendingBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#166534',
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
    marginBottom: 12,
  },
  formGroup: {
    marginBottom: 10,
  },
  formRow: {
    flexDirection: 'row',
    gap: 10,
  },
  label: {
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
  warningBox: {
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fde68a',
    padding: 8,
    borderRadius: 6,
    marginBottom: 10,
  },
  warningText: {
    fontSize: 11,
    color: '#b45309',
    fontWeight: '600',
    lineHeight: 15,
  },
  modalActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 12,
  },
  modalCancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  modalCancelText: {
    fontSize: 13,
    color: '#4b5563',
    fontWeight: '600',
  },
  modalConfirmBtn: {
    backgroundColor: '#2e7d32',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalConfirmText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
});
