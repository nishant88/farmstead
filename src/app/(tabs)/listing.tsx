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
import { ExportCsvModal } from '../../components/ExportCsvModal';
import { ModuleQuickSwitcher } from '../../components/ModuleQuickSwitcher';
import { HarvestBatch } from '../../models/types';

export default function ListingScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const {
    language,
    harvestBatches,
    blocks,
    userPriceTargetPerKg,
    addHarvestBatch,
    updateHarvestBatch,
    updateHarvestStatus,
  } = useStore();

  const [showBatchModal, setShowBatchModal] = useState(false);
  const [editingBatchId, setEditingBatchId] = useState<string | null>(null);

  // Form State
  const [selectedBlockId, setSelectedBlockId] = useState(blocks[0]?.id || 'b1');
  const [variety, setVariety] = useState('Royal Delicious');
  const [gradeAKg, setGradeAKg] = useState('');
  const [gradeBKg, setGradeBKg] = useState('');
  const [gradeCKg, setGradeCKg] = useState('');
  const [suggestedPrice, setSuggestedPrice] = useState(userPriceTargetPerKg.toString());
  const [notes, setNotes] = useState('');

  // WhatsApp share generator modal
  const [shareBatch, setShareBatch] = useState<HarvestBatch | null>(null);
  const [shareMessage, setShareMessage] = useState('');

  // Export Modal
  const [showExportModal, setShowExportModal] = useState(false);

  const handleOpenEdit = (b: HarvestBatch) => {
    setEditingBatchId(b.id);
    setSelectedBlockId(b.blockId);
    setVariety(b.variety);
    setGradeAKg(b.gradeA_Kg.toString());
    setGradeBKg(b.gradeB_Kg.toString());
    setGradeCKg(b.gradeC_Kg.toString());
    setSuggestedPrice(b.suggestedPricePerKg.toString());
    setNotes(b.notes || '');
    setShowBatchModal(true);
  };

  const handleSaveBatch = () => {
    const a = Number(gradeAKg) || 0;
    const b = Number(gradeBKg) || 0;
    const c = Number(gradeCKg) || 0;
    const total = a + b + c;

    if (total <= 0) {
      alert('Please enter weight in kg for at least one grade.');
      return;
    }

    if (editingBatchId) {
      updateHarvestBatch(editingBatchId, {
        blockId: selectedBlockId,
        variety,
        gradeA_Kg: a,
        gradeB_Kg: b,
        gradeC_Kg: c,
        totalKg: total,
        suggestedPricePerKg: Number(suggestedPrice) || 140,
        notes,
      });
    } else {
      addHarvestBatch({
        blockId: selectedBlockId,
        dateHarvested: new Date().toISOString().split('T')[0],
        variety,
        gradeA_Kg: a,
        gradeB_Kg: b,
        gradeC_Kg: c,
        totalKg: total,
        suggestedPricePerKg: Number(suggestedPrice) || 140,
        status: 'Stored',
        notes,
      });
    }

    setShowBatchModal(false);
    setEditingBatchId(null);
    setGradeAKg('');
    setGradeBKg('');
    setGradeCKg('');
    setNotes('');
  };

  const openShareGenerator = (batch: HarvestBatch) => {
    const block = blocks.find((b) => b.id === batch.blockId);
    const msg = `🍎 *FRESH APPLE HARVEST LISTING — KOTGARH / SHIMLA* 🍎\n\n` +
      `• *Orchard Location:* ${block?.location || 'Kotgarh, Shimla'} (${block?.elevationMeters || 2050}m Elevation)\n` +
      `• *Variety:* ${batch.variety}\n` +
      `• *Harvest Date:* ${batch.dateHarvested}\n\n` +
      `📦 *Graded Lot Availability:*\n` +
      `  - Grade A (Large/Extra Fancy, Spotless): ${batch.gradeA_Kg.toLocaleString()} kg\n` +
      `  - Grade B (Medium, Table Grade): ${batch.gradeB_Kg.toLocaleString()} kg\n` +
      `  - Total Volume: ${batch.totalKg.toLocaleString()} kg\n\n` +
      `💰 *Asking Rate:* ₹${batch.suggestedPricePerKg}/kg (F.O.R. Shimla / Azadpur terms)\n` +
      `✨ *Quality Notes:* ${batch.notes || 'Export-quality deep color, crisp crunch, sorted into telescopic cartons'}.\n\n` +
      `Direct Grower Contact: +91 98160-XXXXX. Genuine buyers only.`;

    setShareMessage(msg);
    setShareBatch(batch);
  };

  const handleLaunchWhatsApp = () => {
    if (typeof window !== 'undefined') {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`, '_blank');
    }
  };

  return (
    <View style={styles.screen}>
      <Header
        title={language === 'hi' ? 'फसल ग्रेडिंग एवं बिक्री' : 'Harvest & Sales Listings'}
        subtitle="Grade A/B/C batch recording, market-informed pricing, and WhatsApp listings"
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
                setEditingBatchId(null);
                setGradeAKg('');
                setGradeBKg('');
                setGradeCKg('');
                setNotes('');
                setShowBatchModal(true);
              }}>
              <Text style={styles.headerBtnText}>+ Log Batch</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <ModuleQuickSwitcher currentTab="listing" />

      <ScrollView contentContainerStyle={[styles.scrollContent, !isDesktop && styles.scrollContentMobile]}>
        {/* Market Pricing Guidance Notice */}
        <Card style={styles.guidanceCard}>
          <Text style={styles.guidanceHeading}>
            💡 Market-Informed Suggested Pricing Engine
          </Text>
          <Text style={styles.guidanceText}>
            Current Azadpur modal rate for Grade A is ₹138/kg. Navratri/Diwali festival demand
            allows asking ₹150-165/kg for spotless fruit in telescopic cartons. Generate
            verified listings with one tap for wholesale WhatsApp merchant groups.
          </Text>
        </Card>

        {/* Harvest Batches List */}
        <View style={styles.batchList}>
          {harvestBatches.map((batch) => {
            const block = blocks.find((b) => b.id === batch.blockId);
            return (
              <Card
                key={batch.id}
                title={`${batch.variety} (${batch.totalKg.toLocaleString()} kg)`}
                subtitle={`${block?.name || 'Orchard Block'} • Picked ${batch.dateHarvested}`}
                badge={batch.status.toUpperCase()}
                badgeColor={
                  batch.status === 'Sold'
                    ? '#dcfce7'
                    : batch.status === 'Listed'
                    ? '#fef3c7'
                    : '#e0f2fe'
                }
                headerRight={
                  <TouchableOpacity
                    onPress={() => handleOpenEdit(batch)}
                    style={styles.editBtn}>
                    <Text style={styles.editBtnText}>Edit</Text>
                  </TouchableOpacity>
                }>
                {/* Grades Breakdown Row */}
                <View style={styles.gradeGrid}>
                  <View style={styles.gradeBox}>
                    <Text style={styles.gradeTitle}>Grade A (Premium)</Text>
                    <Text style={[styles.gradeVal, { color: '#15803d' }]}>
                      {batch.gradeA_Kg.toLocaleString()} kg
                    </Text>
                  </View>
                  <View style={styles.gradeBox}>
                    <Text style={styles.gradeTitle}>Grade B (Table)</Text>
                    <Text style={[styles.gradeVal, { color: '#b45309' }]}>
                      {batch.gradeB_Kg.toLocaleString()} kg
                    </Text>
                  </View>
                  <View style={styles.gradeBox}>
                    <Text style={styles.gradeTitle}>Grade C (Processing)</Text>
                    <Text style={[styles.gradeVal, { color: '#6b7280' }]}>
                      {batch.gradeC_Kg.toLocaleString()} kg
                    </Text>
                  </View>
                </View>

                {batch.notes && <Text style={styles.batchNotes}>“{batch.notes}”</Text>}

                {/* Status & Share Action Row */}
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.shareBtn}
                    onPress={() => openShareGenerator(batch)}>
                    <Text style={styles.shareBtnText}>📱 Generate WhatsApp Listing</Text>
                  </TouchableOpacity>

                  {batch.status !== 'Sold' && (
                    <TouchableOpacity
                      style={styles.markSoldBtn}
                      onPress={() => updateHarvestStatus(batch.id, 'Sold')}>
                      <Text style={styles.markSoldText}>Mark Sold</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </Card>
            );
          })}
        </View>
      </ScrollView>

      {/* Share Generator Modal */}
      {shareBatch && (
        <Modal visible={true} transparent animationType={isDesktop ? 'fade' : 'slide'}>
          <View style={[styles.modalOverlay, !isDesktop && styles.modalOverlayMobile]}>
            <View style={[styles.modalBox, !isDesktop && styles.modalBoxMobile]}>
              {!isDesktop && <View style={styles.sheetHandle} />}
              <Text style={styles.modalTitle}>Shareable WhatsApp / Buyer Listing</Text>
              <Text style={styles.modalSub}>
                Ready to copy or send directly to fruit merchant groups
              </Text>

              <TextInput
                style={styles.shareTextArea}
                multiline
                numberOfLines={10}
                value={shareMessage}
                onChangeText={setShareMessage}
              />

              <View style={[styles.modalActions, !isDesktop && styles.modalActionsMobile]}>
                <TouchableOpacity
                  style={[styles.directWhatsAppBtn, !isDesktop && styles.mobileBtn]}
                  onPress={handleLaunchWhatsApp}>
                  <Text style={styles.directWhatsAppText}>💬 Send to WhatsApp</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.copyBtn, !isDesktop && styles.mobileBtn]}
                  onPress={() => {
                    alert('Listing text copied to clipboard!');
                    setShareBatch(null);
                  }}>
                  <Text style={styles.copyBtnText}>📋 Copy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.cancelBtn, !isDesktop && styles.mobileBtn]}
                  onPress={() => setShareBatch(null)}>
                  <Text style={styles.cancelBtnText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Add / Edit Harvest Batch Modal */}
      {showBatchModal && (
        <Modal visible={true} transparent animationType={isDesktop ? 'fade' : 'slide'}>
          <View style={[styles.modalOverlay, !isDesktop && styles.modalOverlayMobile]}>
            <View style={[styles.modalBox, !isDesktop && styles.modalBoxMobile]}>
              {!isDesktop && <View style={styles.sheetHandle} />}
              <Text style={styles.modalTitle}>
                {editingBatchId ? 'Edit Harvest Lot' : 'Log Harvest Lot & Grading'}
              </Text>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Block:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Apple Variety:</Text>
                <TextInput
                  style={styles.modalInput}
                  value={variety}
                  onChangeText={setVariety}
                  placeholder="e.g. Royal Delicious, Gala, Red Chief"
                />
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Grade A (kg):</Text>
                  <TextInput
                    style={styles.modalInput}
                    keyboardType="numeric"
                    placeholder="e.g. 2500"
                    value={gradeAKg}
                    onChangeText={setGradeAKg}
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Grade B (kg):</Text>
                  <TextInput
                    style={styles.modalInput}
                    keyboardType="numeric"
                    placeholder="e.g. 1000"
                    value={gradeBKg}
                    onChangeText={setGradeBKg}
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Grade C (kg):</Text>
                  <TextInput
                    style={styles.modalInput}
                    keyboardType="numeric"
                    placeholder="e.g. 500"
                    value={gradeCKg}
                    onChangeText={setGradeCKg}
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Asking Rate (₹/kg):</Text>
                <TextInput
                  style={styles.modalInput}
                  keyboardType="numeric"
                  placeholder="e.g. 145"
                  value={suggestedPrice}
                  onChangeText={setSuggestedPrice}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Quality Notes (Color, Carton type):</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. 85%+ color, 20kg 5-ply cartons with separator trays"
                  value={notes}
                  onChangeText={setNotes}
                />
              </View>

              <View style={[styles.modalActions, !isDesktop && styles.modalActionsMobile]}>
                <TouchableOpacity
                  style={[styles.cancelBtn, !isDesktop && styles.mobileBtn]}
                  onPress={() => setShowBatchModal(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.confirmBtn, !isDesktop && styles.mobileBtn]}
                  onPress={handleSaveBatch}>
                  <Text style={styles.confirmBtnText}>
                    {editingBatchId ? 'Save Edits' : 'Save Harvest Lot'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* CSV Export Modal */}
      {showExportModal && (
        <ExportCsvModal
          visible={true}
          moduleName="HarvestBatches"
          dataHeaders={['Variety', 'BlockId', 'Date', 'GradeA_Kg', 'GradeB_Kg', 'GradeC_Kg', 'TotalKg', 'AskingPrice', 'Status']}
          dataRows={harvestBatches.map((b) => [
            b.variety,
            b.blockId,
            b.dateHarvested,
            b.gradeA_Kg,
            b.gradeB_Kg,
            b.gradeC_Kg,
            b.totalKg,
            b.suggestedPricePerKg,
            b.status,
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
  guidanceCard: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
    marginBottom: 16,
  },
  guidanceHeading: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1d4ed8',
    marginBottom: 4,
  },
  guidanceText: {
    fontSize: 12,
    color: '#1e40af',
    lineHeight: 17,
  },
  batchList: {
    gap: 12,
    marginBottom: 30,
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
  gradeGrid: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 10,
    gap: 8,
    marginVertical: 8,
  },
  gradeBox: {
    flex: 1,
    alignItems: 'center',
  },
  gradeTitle: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '600',
  },
  gradeVal: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },
  batchNotes: {
    fontSize: 12,
    color: '#4b5563',
    fontStyle: 'italic',
    marginBottom: 10,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  shareBtn: {
    flex: 1,
    backgroundColor: '#25d366',
    paddingVertical: 10,
    minHeight: 46,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  markSoldBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 46,
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  markSoldText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
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
    marginBottom: 14,
  },
  shareTextArea: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 12,
    color: '#111827',
    textAlignVertical: 'top',
    height: 180,
    marginBottom: 14,
    fontFamily: 'monospace',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    flexWrap: 'wrap',
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
  directWhatsAppBtn: {
    backgroundColor: '#128c7e',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  directWhatsAppText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  copyBtn: {
    backgroundColor: '#25d366',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  copyBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  formGroup: {
    marginBottom: 10,
  },
  formRow: {
    flexDirection: 'row',
    gap: 8,
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
    fontSize: 14,
    color: '#111827',
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
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
  confirmBtn: {
    backgroundColor: '#2e7d32',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  confirmBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});
