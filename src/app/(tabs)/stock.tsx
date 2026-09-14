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
import { StockItem } from '../../models/types';

export default function StockScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const {
    language,
    stockItems,
    stockTransactions,
    addStockItem,
    updateStockItem,
    adjustStockQuantity,
    deleteStockItem,
  } = useStore();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // In / Out Adjustment
  const [adjustItem, setAdjustItem] = useState<{
    item: StockItem;
    type: 'IN' | 'OUT';
  } | null>(null);
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustNotes, setAdjustNotes] = useState('');

  // Form State
  const [itemName, setItemName] = useState('');
  const [itemCat, setItemCat] = useState<StockItem['category']>('Fungicide');
  const [itemUnit, setItemUnit] = useState('kg');
  const [itemQty, setItemQty] = useState('');
  const [itemThreshold, setItemThreshold] = useState('');
  const [itemCost, setItemCost] = useState('');
  const [itemSupplier, setItemSupplier] = useState('');
  const [itemExpiry, setItemExpiry] = useState('');
  const [itemHazard, setItemHazard] = useState<StockItem['hazardClass']>('Blue (Moderately Toxic)');

  // Export Modal
  const [showExportModal, setShowExportModal] = useState(false);

  const categories = [
    'All',
    'Fungicide',
    'Insecticide',
    'Fertilizer',
    'Packaging',
    'Tools',
    'Growth Regulator',
  ];

  const filteredItems =
    selectedCategory === 'All'
      ? stockItems
      : stockItems.filter((i) => i.category === selectedCategory);

  const handleOpenEdit = (item: StockItem) => {
    setEditingItemId(item.id);
    setItemName(item.name);
    setItemCat(item.category);
    setItemUnit(item.unit);
    setItemQty(item.currentQuantity.toString());
    setItemThreshold(item.reorderThreshold.toString());
    setItemCost(item.unitCost.toString());
    setItemSupplier(item.supplier);
    setItemExpiry(item.expiryDate || '');
    setItemHazard(item.hazardClass || 'Blue (Moderately Toxic)');
    setShowItemModal(true);
  };

  const handleSaveItem = () => {
    if (!itemName || !itemQty || !itemCost) {
      alert('Please enter Name, Quantity, and Unit Cost.');
      return;
    }

    if (editingItemId) {
      updateStockItem(editingItemId, {
        name: itemName,
        category: itemCat,
        unit: itemUnit,
        currentQuantity: Number(itemQty) || 0,
        reorderThreshold: Number(itemThreshold) || 5,
        unitCost: Number(itemCost) || 0,
        supplier: itemSupplier,
        expiryDate: itemExpiry || undefined,
        hazardClass: itemHazard,
      });
    } else {
      addStockItem({
        name: itemName,
        category: itemCat,
        unit: itemUnit,
        currentQuantity: Number(itemQty) || 0,
        reorderThreshold: Number(itemThreshold) || 5,
        unitCost: Number(itemCost) || 0,
        supplier: itemSupplier || 'Local Dealer',
        expiryDate: itemExpiry || undefined,
        hazardClass: itemHazard,
      });
    }

    setShowItemModal(false);
    setEditingItemId(null);
  };

  const handleApplyAdjustment = () => {
    if (!adjustItem || !adjustQty) return;
    const qty = Number(adjustQty) || 0;
    if (qty <= 0) return;
    adjustStockQuantity(adjustItem.item.id, qty, adjustItem.type, adjustNotes);
    setAdjustItem(null);
    setAdjustQty('');
    setAdjustNotes('');
  };

  return (
    <View style={styles.screen}>
      <Header
        title={language === 'hi' ? 'स्टॉक एवं इन्वेंटरी' : 'Inventory & Stock'}
        subtitle="Agrochemical register, chemical toxicity codes, and in/out audit history"
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
                setEditingItemId(null);
                setItemName('');
                setItemQty('');
                setItemCost('');
                setItemSupplier('');
                setItemExpiry('');
                setShowItemModal(true);
              }}>
              <Text style={styles.headerBtnText}>+ Add Item</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <ModuleQuickSwitcher currentTab="stock" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Category Filter Scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.catScroll}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.catChip,
                selectedCategory === cat && styles.catChipActive,
              ]}
              onPress={() => setSelectedCategory(cat)}>
              <Text
                style={[
                  styles.catChipText,
                  selectedCategory === cat && styles.catChipTextActive,
                ]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Stock Items Grid */}
        <View style={styles.stockGrid}>
          {filteredItems.map((item) => {
            const isLow = item.currentQuantity <= item.reorderThreshold;
            return (
              <Card
                key={item.id}
                title={item.name}
                subtitle={`${item.category} • Dealer: ${item.supplier}`}
                badge={isLow ? '⚠️ REORDER NEEDED' : 'IN STOCK'}
                badgeColor={isLow ? '#fee2e2' : '#dcfce7'}
                headerRight={
                  <View style={styles.actionBtnRow}>
                    <TouchableOpacity
                      onPress={() => handleOpenEdit(item)}
                      style={styles.editBtn}>
                      <Text style={styles.editBtnText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => deleteStockItem(item.id)}
                      style={styles.delBtn}>
                      <Text style={styles.delBtnText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                }>
                <View style={styles.itemMetrics}>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Balance:</Text>
                    <Text style={[styles.metricValue, isLow && { color: '#dc2626' }]}>
                      {item.currentQuantity} {item.unit}
                    </Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Threshold:</Text>
                    <Text style={styles.metricValue}>
                      {item.reorderThreshold} {item.unit}
                    </Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Unit Cost:</Text>
                    <Text style={styles.metricValue}>
                      ₹{item.unitCost.toLocaleString('en-IN')}/{item.unit}
                    </Text>
                  </View>
                  {item.expiryDate && (
                    <View style={styles.metricItem}>
                      <Text style={styles.metricLabel}>Expiry Date:</Text>
                      <Text style={styles.metricValue}>{item.expiryDate}</Text>
                    </View>
                  )}
                </View>

                {item.hazardClass && (
                  <View style={styles.hazardBadge}>
                    <Text style={styles.hazardText}>
                      🏷️ Toxicity Class: {item.hazardClass}
                    </Text>
                  </View>
                )}

                {/* Manual Stock In / Out Action Buttons */}
                <View style={styles.stockActionRow}>
                  <TouchableOpacity
                    style={[styles.stockBtn, styles.stockInBtn]}
                    onPress={() => setAdjustItem({ item, type: 'IN' })}>
                    <Text style={styles.stockInText}>+ Add Stock (IN)</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.stockBtn, styles.stockOutBtn]}
                    onPress={() => setAdjustItem({ item, type: 'OUT' })}>
                    <Text style={styles.stockOutText}>- Use Stock (OUT)</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            );
          })}
        </View>

        {/* In/Out Transaction Audit History */}
        <Card
          title="Stock In/Out Audit Trail"
          subtitle="Linked automatically from Crop Sprays and paper bill scans"
          badge={`${stockTransactions.length} Logged`}>
          {stockTransactions.length === 0 ? (
            <Text style={styles.emptyText}>No stock transactions recorded yet.</Text>
          ) : (
            stockTransactions.map((tx) => (
              <View key={tx.id} style={styles.txRow}>
                <View style={styles.txTypeBadge}>
                  <Text
                    style={[
                      styles.txTypeText,
                      tx.type === 'IN' ? styles.txIn : styles.txOut,
                    ]}>
                    {tx.type === 'IN' ? '▲ IN' : '▼ OUT'}
                  </Text>
                </View>
                <View style={styles.txDetails}>
                  <Text style={styles.txNotes}>{tx.notes || 'Usage logged'}</Text>
                  <Text style={styles.txDate}>{tx.date}</Text>
                </View>
                <Text
                  style={[
                    styles.txQty,
                    tx.type === 'IN' ? { color: '#16a34a' } : { color: '#dc2626' },
                  ]}>
                  {tx.type === 'IN' ? '+' : '-'}
                  {tx.quantity}
                </Text>
              </View>
            ))
          )}
        </Card>
      </ScrollView>

      {/* Manual Stock In / Out Adjustment Modal (Bottom Sheet on Mobile) */}
      {adjustItem && (
        <Modal visible={true} transparent animationType="slide">
          <View style={[styles.modalOverlay, isDesktop && styles.modalOverlayDesktop]}>
            <TouchableOpacity
              style={styles.modalBackdrop}
              activeOpacity={1}
              onPress={() => setAdjustItem(null)}
            />
            <View style={[styles.modalBox, isDesktop && styles.modalBoxDesktop]}>
              {!isDesktop && (
                <View style={styles.dragHandleContainer}>
                  <View style={styles.dragHandle} />
                </View>
              )}
              <Text style={styles.modalTitle}>
                {adjustItem.type === 'IN' ? 'Record Stock Intake (IN)' : 'Record Stock Usage (OUT)'}
              </Text>
              <Text style={styles.modalSub}>
                {adjustItem.item.name} (Current: {adjustItem.item.currentQuantity}{' '}
                {adjustItem.item.unit})
              </Text>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>
                  Quantity to {adjustItem.type === 'IN' ? 'Add' : 'Deduct'} ({adjustItem.item.unit}):
                </Text>
                <TextInput
                  style={styles.modalInput}
                  keyboardType="numeric"
                  placeholder="e.g. 5"
                  value={adjustQty}
                  onChangeText={setAdjustQty}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Audit Note / Purpose:</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. Received new shipment from Kisan Kendra"
                  value={adjustNotes}
                  onChangeText={setAdjustNotes}
                />
              </View>

              <View style={styles.modalActionRow}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setAdjustItem(null)}>
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalConfirmBtn}
                  onPress={handleApplyAdjustment}>
                  <Text style={styles.modalConfirmText}>Confirm Adjustment</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Add / Edit Stock Item Modal (Bottom Sheet on Mobile) */}
      {showItemModal && (
        <Modal visible={true} transparent animationType="slide">
          <View style={[styles.modalOverlay, isDesktop && styles.modalOverlayDesktop]}>
            <TouchableOpacity
              style={styles.modalBackdrop}
              activeOpacity={1}
              onPress={() => setShowItemModal(false)}
            />
            <View style={[styles.modalBox, isDesktop && styles.modalBoxDesktop]}>
              {!isDesktop && (
                <View style={styles.dragHandleContainer}>
                  <View style={styles.dragHandle} />
                </View>
              )}
              <Text style={styles.modalTitle}>
                {editingItemId ? 'Edit Stock Register Item' : 'Add Item to Chemical Register'}
              </Text>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Product / Item Name:</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. Captan 50 WP, Mancozeb"
                  value={itemName}
                  onChangeText={setItemName}
                />
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Balance Quantity:</Text>
                  <TextInput
                    style={styles.modalInput}
                    keyboardType="numeric"
                    value={itemQty}
                    onChangeText={setItemQty}
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Unit:</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={itemUnit}
                    onChangeText={setItemUnit}
                  />
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Unit Cost (₹):</Text>
                  <TextInput
                    style={styles.modalInput}
                    keyboardType="numeric"
                    value={itemCost}
                    onChangeText={setItemCost}
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Reorder Min:</Text>
                  <TextInput
                    style={styles.modalInput}
                    keyboardType="numeric"
                    value={itemThreshold}
                    onChangeText={setItemThreshold}
                  />
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Supplier:</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={itemSupplier}
                    onChangeText={setItemSupplier}
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Expiry Date:</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="YYYY-MM-DD"
                    value={itemExpiry}
                    onChangeText={setItemExpiry}
                  />
                </View>
              </View>

              <View style={styles.modalActionRow}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setShowItemModal(false)}>
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalConfirmBtn}
                  onPress={handleSaveItem}>
                  <Text style={styles.modalConfirmText}>
                    {editingItemId ? 'Save Changes' : 'Save to Register'}
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
          moduleName="InventoryRegister"
          dataHeaders={['Name', 'Category', 'Unit', 'Quantity', 'ReorderThreshold', 'UnitCost', 'Supplier', 'ExpiryDate']}
          dataRows={stockItems.map((s) => [
            s.name,
            s.category,
            s.unit,
            s.currentQuantity,
            s.reorderThreshold,
            s.unitCost,
            s.supplier,
            s.expiryDate || 'N/A',
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
    padding: 14,
    paddingBottom: 90,
    maxWidth: 1000,
    width: '100%',
    alignSelf: 'center',
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
  stockGrid: {
    gap: 8,
    marginBottom: 16,
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
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: '#fee2e2',
  },
  delBtnText: {
    fontSize: 11,
    color: '#dc2626',
    fontWeight: '700',
  },
  itemMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  metricItem: {
    flex: 1,
    minWidth: 100,
  },
  metricLabel: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginTop: 2,
  },
  hazardBadge: {
    backgroundColor: '#f8fafc',
    padding: 6,
    borderRadius: 4,
    marginBottom: 10,
  },
  hazardText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  stockActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  stockBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  stockInBtn: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#86efac',
  },
  stockInText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803d',
  },
  stockOutBtn: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  stockOutText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#b91c1c',
  },
  emptyText: {
    fontSize: 13,
    color: '#6b7280',
    paddingVertical: 8,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  txTypeBadge: {
    marginRight: 10,
  },
  txTypeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  txIn: {
    color: '#16a34a',
  },
  txOut: {
    color: '#dc2626',
  },
  txDetails: {
    flex: 1,
  },
  txNotes: {
    fontSize: 13,
    color: '#1f2937',
    fontWeight: '600',
  },
  txDate: {
    fontSize: 11,
    color: '#9ca3af',
  },
  txQty: {
    fontSize: 14,
    fontWeight: '800',
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
    marginBottom: 4,
  },
  modalSub: {
    fontSize: 13,
    color: '#6b7280',
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
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#111827',
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
