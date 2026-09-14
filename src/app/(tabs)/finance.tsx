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
import { ExpenseCategory, Expense, Revenue } from '../../models/types';

export default function FinanceScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const {
    language,
    expenses,
    revenues,
    insurancePolicies,
    addExpense,
    updateExpense,
    deleteExpense,
    addRevenue,
    updateRevenue,
    deleteRevenue,
    recordInsuranceClaim,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'expenses' | 'revenues' | 'insurance' | 'budget'>('expenses');

  // Add/Edit Expense
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editingExpId, setEditingExpId] = useState<string | null>(null);
  const [expCategory, setExpCategory] = useState<ExpenseCategory>('Labor');
  const [expAmount, setExpAmount] = useState('');
  const [expDesc, setExpDesc] = useState('');

  // Add/Edit Revenue
  const [showRevenueModal, setShowRevenueModal] = useState(false);
  const [editingRevId, setEditingRevId] = useState<string | null>(null);
  const [revBuyer, setRevBuyer] = useState('');
  const [revQty, setRevQty] = useState('');
  const [revGrade, setRevGrade] = useState<'A' | 'B' | 'C'>('A');
  const [revPrice, setRevPrice] = useState('');
  const [revStatus, setRevStatus] = useState<'Paid' | 'Pending'>('Paid');

  // Insurance Claim
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimAmount, setClaimAmount] = useState('');

  // CSV Export Modal
  const [showExportModal, setShowExportModal] = useState(false);

  const expenseCategories: ExpenseCategory[] = [
    'Pesticides & Sprays',
    'Fertilizer & Soil',
    'Labor',
    'Irrigation & Power',
    'Equipment & Maintenance',
    'Packaging',
    'Transport & Logistics',
    'Insurance Premiums',
    'Admin/Other',
  ];

  const budgetAllocations: { category: ExpenseCategory; budget: number }[] = [
    { category: 'Pesticides & Sprays', budget: 35000 },
    { category: 'Labor', budget: 50000 },
    { category: 'Fertilizer & Soil', budget: 25000 },
    { category: 'Packaging', budget: 30000 },
    { category: 'Transport & Logistics', budget: 20000 },
    { category: 'Equipment & Maintenance', budget: 15000 },
    { category: 'Insurance Premiums', budget: 15000 },
  ];

  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalRevenue = revenues.reduce((sum, r) => sum + r.totalAmount, 0);

  const handleOpenEditExpense = (exp: Expense) => {
    setEditingExpId(exp.id);
    setExpCategory(exp.category);
    setExpAmount(exp.amount.toString());
    setExpDesc(exp.description);
    setShowExpenseModal(true);
  };

  const handleSaveExpense = () => {
    if (!expAmount || !expDesc) return;
    const amountNum = Number(expAmount) || 0;

    if (editingExpId) {
      updateExpense(editingExpId, {
        category: expCategory,
        amount: amountNum,
        description: expDesc,
      });
    } else {
      addExpense({
        category: expCategory,
        amount: amountNum,
        description: expDesc,
        date: new Date().toISOString().split('T')[0],
      });
    }
    setShowExpenseModal(false);
    setEditingExpId(null);
    setExpAmount('');
    setExpDesc('');
  };

  const handleOpenEditRevenue = (rev: Revenue) => {
    setEditingRevId(rev.id);
    setRevBuyer(rev.buyer);
    setRevQty(rev.quantitySoldKg.toString());
    setRevGrade(rev.grade);
    setRevPrice(rev.pricePerKg.toString());
    setRevStatus(rev.paymentStatus === 'Paid' ? 'Paid' : 'Pending');
    setShowRevenueModal(true);
  };

  const handleSaveRevenue = () => {
    if (!revBuyer || !revQty || !revPrice) return;
    const qty = Number(revQty) || 0;
    const price = Number(revPrice) || 0;

    if (editingRevId) {
      updateRevenue(editingRevId, {
        buyer: revBuyer,
        quantitySoldKg: qty,
        grade: revGrade,
        pricePerKg: price,
        totalAmount: qty * price,
        paymentStatus: revStatus,
      });
    } else {
      addRevenue({
        buyer: revBuyer,
        quantitySoldKg: qty,
        grade: revGrade,
        pricePerKg: price,
        totalAmount: qty * price,
        paymentStatus: revStatus,
        date: new Date().toISOString().split('T')[0],
      });
    }
    setShowRevenueModal(false);
    setEditingRevId(null);
    setRevBuyer('');
    setRevQty('');
    setRevPrice('');
  };

  const handleFileClaim = () => {
    if (!claimAmount || insurancePolicies.length === 0) return;
    recordInsuranceClaim(insurancePolicies[0].id, Number(claimAmount) || 0);
    setShowClaimModal(false);
    setClaimAmount('');
  };

  return (
    <View style={styles.screen}>
      <Header
        title={language === 'hi' ? 'वित्त एवं फसल बीमा' : 'Finance & Crop Insurance'}
        subtitle="Full income ledger, category budgets, and PMFBY / WBCIS weather policies"
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
                if (activeTab === 'revenues') {
                  setEditingRevId(null);
                  setRevBuyer('');
                  setRevQty('');
                  setRevPrice('');
                  setShowRevenueModal(true);
                } else if (activeTab === 'insurance') {
                  setClaimAmount('');
                  setShowClaimModal(true);
                } else {
                  setEditingExpId(null);
                  setExpAmount('');
                  setExpDesc('');
                  setShowExpenseModal(true);
                }
              }}>
              <Text style={styles.headerBtnText}>
                {activeTab === 'revenues'
                  ? '+ Log Revenue'
                  : activeTab === 'insurance'
                  ? '+ Claim'
                  : '+ Add Expense'}
              </Text>
            </TouchableOpacity>
          </View>
        }
      />

      <ModuleQuickSwitcher currentTab="finance" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Navigation Sub-Tabs */}
        <View style={styles.subTabBar}>
          {[
            { id: 'expenses', label: `Expenses (₹${(totalExpense / 1000).toFixed(1)}k)` },
            { id: 'revenues', label: `Revenue (₹${(totalRevenue / 1000).toFixed(1)}k)` },
            { id: 'insurance', label: 'PMFBY Insurance' },
            { id: 'budget', label: 'Budget vs Actual' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.subTabBtn,
                activeTab === tab.id && styles.subTabBtnActive,
              ]}
              onPress={() => setActiveTab(tab.id as any)}>
              <Text
                style={[
                  styles.subTabText,
                  activeTab === tab.id && styles.subTabTextActive,
                ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 1. EXPENSES VIEW */}
        {activeTab === 'expenses' && (
          <View>
            <View style={styles.summaryBar}>
              <Text style={styles.summaryTitle}>Total Recorded Expenses</Text>
              <Text style={styles.summaryValueRed}>
                ₹{totalExpense.toLocaleString('en-IN')}
              </Text>
            </View>

            {expenses.map((exp) => (
              <Card
                key={exp.id}
                title={`₹${exp.amount.toLocaleString('en-IN')}`}
                subtitle={`${exp.category} • ${exp.date}`}
                headerRight={
                  <View style={styles.actionBtnRow}>
                    <TouchableOpacity
                      onPress={() => handleOpenEditExpense(exp)}
                      style={styles.editBtn}>
                      <Text style={styles.editBtnText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => deleteExpense(exp.id)}
                      style={styles.deleteBtn}>
                      <Text style={styles.deleteBtnText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                }>
                <Text style={styles.expDescription}>{exp.description}</Text>
                {exp.linkedTreatmentId && (
                  <View style={styles.linkedTag}>
                    <Text style={styles.linkedTagText}>
                      🔗 Auto-linked from Spray Log ({exp.linkedTreatmentId})
                    </Text>
                  </View>
                )}
              </Card>
            ))}
          </View>
        )}

        {/* 2. REVENUES VIEW */}
        {activeTab === 'revenues' && (
          <View>
            <View style={styles.summaryBar}>
              <Text style={styles.summaryTitle}>Total Realized Revenue</Text>
              <Text style={styles.summaryValueGreen}>
                ₹{totalRevenue.toLocaleString('en-IN')}
              </Text>
            </View>

            {revenues.map((rev) => (
              <Card
                key={rev.id}
                title={`₹${rev.totalAmount.toLocaleString('en-IN')}`}
                subtitle={`Buyer: ${rev.buyer} • ${rev.date}`}
                badge={`Grade ${rev.grade} • ${rev.paymentStatus}`}
                badgeColor={rev.paymentStatus === 'Paid' ? '#dcfce7' : '#fef3c7'}
                headerRight={
                  <View style={styles.actionBtnRow}>
                    <TouchableOpacity
                      onPress={() => handleOpenEditRevenue(rev)}
                      style={styles.editBtn}>
                      <Text style={styles.editBtnText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => deleteRevenue(rev.id)}
                      style={styles.deleteBtn}>
                      <Text style={styles.deleteBtnText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                }>
                <View style={styles.revDetailsRow}>
                  <Text style={styles.revStat}>
                    Volume: <Text style={styles.bold}>{rev.quantitySoldKg.toLocaleString()} kg</Text>
                  </Text>
                  <Text style={styles.revStat}>
                    Rate: <Text style={styles.bold}>₹{rev.pricePerKg}/kg</Text>
                  </Text>
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* 3. CROP INSURANCE TRACKER (PMFBY / WBCIS) */}
        {activeTab === 'insurance' && (
          <View>
            <View style={styles.insuranceReminderBox}>
              <View style={styles.reminderTop}>
                <Text style={styles.reminderBadge}>DEADLINE REMINDER</Text>
                <Text style={styles.reminderDate}>Window closes March 31</Text>
              </View>
              <Text style={styles.reminderTitle}>
                RWBCIS Apple Hail & Weather Insurance Enrollment Open
              </Text>
              <Text style={styles.reminderBody}>
                Under HP Govt notification, loanee and non-loanee apple growers must submit
                khasra/revenue records to Lokmitra Kendra by March 31. Hail damage coverage
                is valid from April 1 to June 30.
              </Text>
            </View>

            {insurancePolicies.map((pol) => (
              <Card
                key={pol.id}
                title={pol.schemeName}
                subtitle={`Policy #${pol.policyNumber} • Status: ${pol.status}`}
                badge={pol.status}
                badgeColor="#dcfce7">
                <View style={styles.insuranceGrid}>
                  <View style={styles.insCol}>
                    <Text style={styles.insLabel}>Sum Insured</Text>
                    <Text style={styles.insVal}>₹{pol.sumInsured.toLocaleString('en-IN')}</Text>
                  </View>
                  <View style={styles.insCol}>
                    <Text style={styles.insLabel}>Farmer Premium Paid</Text>
                    <Text style={styles.insVal}>₹{pol.premiumPaid.toLocaleString('en-IN')}</Text>
                  </View>
                  <View style={styles.insCol}>
                    <Text style={styles.insLabel}>Claim Amount Logged</Text>
                    <Text style={[styles.insVal, { color: '#16a34a' }]}>
                      ₹{(pol.claimAmountLogged || 0).toLocaleString('en-IN')}
                    </Text>
                  </View>
                </View>

                <Text style={styles.policyNotes}>{pol.notes}</Text>

                <TouchableOpacity
                  style={styles.claimBtn}
                  onPress={() => setShowClaimModal(true)}>
                  <Text style={styles.claimBtnText}>+ Log Hail / Weather Claim Event</Text>
                </TouchableOpacity>
              </Card>
            ))}
          </View>
        )}

        {/* 4. BUDGET VS ACTUALS */}
        {activeTab === 'budget' && (
          <View>
            <Card
              title="Seasonal Category Budgets vs Actual Spend"
              subtitle="Over-budget categories flagged to prevent runaway costs">
              {budgetAllocations.map((b) => {
                const spent = expenses
                  .filter((e) => e.category === b.category)
                  .reduce((sum, e) => sum + e.amount, 0);
                const percent = Math.min(100, Math.round((spent / b.budget) * 100));
                const isOver = spent > b.budget;

                return (
                  <View key={b.category} style={styles.budgetRow}>
                    <View style={styles.budgetHeader}>
                      <Text style={styles.budgetCat}>{b.category}</Text>
                      <Text
                        style={[
                          styles.budgetStats,
                          isOver && { color: '#dc2626', fontWeight: '800' },
                        ]}>
                        ₹{spent.toLocaleString('en-IN')} / ₹{b.budget.toLocaleString('en-IN')}{' '}
                        ({percent}%) {isOver ? '⚠️ OVER BUDGET' : ''}
                      </Text>
                    </View>
                    <View style={styles.budgetBarBg}>
                      <View
                        style={[
                          styles.budgetBarFill,
                          {
                            width: `${percent}%`,
                            backgroundColor: isOver ? '#dc2626' : '#2e7d32',
                          },
                        ]}
                      />
                    </View>
                  </View>
                );
              })}
            </Card>
          </View>
        )}
      </ScrollView>

      {/* Expense Modal (Bottom Sheet on Mobile) */}
      {showExpenseModal && (
        <Modal visible={true} transparent animationType="slide">
          <View style={[styles.modalOverlay, isDesktop && styles.modalOverlayDesktop]}>
            <TouchableOpacity
              style={styles.modalBackdrop}
              activeOpacity={1}
              onPress={() => setShowExpenseModal(false)}
            />
            <View style={[styles.modalBox, isDesktop && styles.modalBoxDesktop]}>
              {!isDesktop && (
                <View style={styles.dragHandleContainer}>
                  <View style={styles.dragHandle} />
                </View>
              )}
              <Text style={styles.modalTitle}>
                {editingExpId ? 'Edit Farm Expense' : 'Record Farm Expense'}
              </Text>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Category:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {expenseCategories.map((c) => (
                    <TouchableOpacity
                      key={c}
                      style={[
                        styles.chip,
                        expCategory === c && styles.chipActive,
                      ]}
                      onPress={() => setExpCategory(c)}>
                      <Text
                        style={[
                          styles.chipText,
                          expCategory === c && styles.chipTextActive,
                        ]}>
                        {c}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Amount (₹):</Text>
                <TextInput
                  style={styles.modalInput}
                  keyboardType="numeric"
                  placeholder="e.g. 8500"
                  value={expAmount}
                  onChangeText={setExpAmount}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Description / Vendor:</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. 5 days pruning labor or Diesel for power sprayer"
                  value={expDesc}
                  onChangeText={setExpDesc}
                />
              </View>

              <View style={styles.modalActionRow}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setShowExpenseModal(false)}>
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalConfirmBtn}
                  onPress={handleSaveExpense}>
                  <Text style={styles.modalConfirmText}>
                    {editingExpId ? 'Save Edits' : 'Save Expense'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Revenue Modal (Bottom Sheet on Mobile) */}
      {showRevenueModal && (
        <Modal visible={true} transparent animationType="slide">
          <View style={[styles.modalOverlay, isDesktop && styles.modalOverlayDesktop]}>
            <TouchableOpacity
              style={styles.modalBackdrop}
              activeOpacity={1}
              onPress={() => setShowRevenueModal(false)}
            />
            <View style={[styles.modalBox, isDesktop && styles.modalBoxDesktop]}>
              {!isDesktop && (
                <View style={styles.dragHandleContainer}>
                  <View style={styles.dragHandle} />
                </View>
              )}
              <Text style={styles.modalTitle}>
                {editingRevId ? 'Edit Harvest Sale' : 'Record Harvest Sale (Revenue)'}
              </Text>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Buyer / Mandi Merchant:</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. Sharma Fruit Co. (Azadpur Mandi)"
                  value={revBuyer}
                  onChangeText={setRevBuyer}
                />
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Weight Sold (kg):</Text>
                  <TextInput
                    style={styles.modalInput}
                    keyboardType="numeric"
                    placeholder="e.g. 2000"
                    value={revQty}
                    onChangeText={setRevQty}
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Price / kg (₹):</Text>
                  <TextInput
                    style={styles.modalInput}
                    keyboardType="numeric"
                    placeholder="e.g. 140"
                    value={revPrice}
                    onChangeText={setRevPrice}
                  />
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Apple Grade:</Text>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    {(['A', 'B', 'C'] as const).map((g) => (
                      <TouchableOpacity
                        key={g}
                        style={[
                          styles.chip,
                          revGrade === g && styles.chipActive,
                          { flex: 1, alignItems: 'center' },
                        ]}
                        onPress={() => setRevGrade(g)}>
                        <Text
                          style={[
                            styles.chipText,
                            revGrade === g && styles.chipTextActive,
                          ]}>
                          {g}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Payment Status:</Text>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    {(['Paid', 'Pending'] as const).map((s) => (
                      <TouchableOpacity
                        key={s}
                        style={[
                          styles.chip,
                          revStatus === s && styles.chipActive,
                          { flex: 1, alignItems: 'center' },
                        ]}
                        onPress={() => setRevStatus(s)}>
                        <Text
                          style={[
                            styles.chipText,
                            revStatus === s && styles.chipTextActive,
                          ]}>
                          {s}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              <View style={styles.modalActionRow}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setShowRevenueModal(false)}>
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalConfirmBtn}
                  onPress={handleSaveRevenue}>
                  <Text style={styles.modalConfirmText}>
                    {editingRevId ? 'Save Edits' : 'Save Sale'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Insurance Claim Modal */}
      {showClaimModal && (
        <Modal visible={true} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Log PMFBY Insurance Claim</Text>
              <Text style={styles.modalSub}>
                Record settlement payout from Agricultural Insurance Company of India (AIC).
              </Text>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Claim Payout Amount (₹):</Text>
                <TextInput
                  style={styles.modalInput}
                  keyboardType="numeric"
                  placeholder="e.g. 75000"
                  value={claimAmount}
                  onChangeText={setClaimAmount}
                />
              </View>

              <View style={styles.modalActionRow}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setShowClaimModal(false)}>
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalConfirmBtn}
                  onPress={handleFileClaim}>
                  <Text style={styles.modalConfirmText}>Record Settlement</Text>
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
          moduleName={activeTab === 'revenues' ? 'RevenueLedger' : 'ExpenseLedger'}
          dataHeaders={
            activeTab === 'revenues'
              ? ['Date', 'Buyer', 'QuantityKg', 'Grade', 'PricePerKg', 'TotalAmount', 'Status']
              : ['Date', 'Category', 'Amount', 'Description', 'LinkedTreatmentId']
          }
          dataRows={
            activeTab === 'revenues'
              ? revenues.map((r) => [
                  r.date,
                  r.buyer,
                  r.quantitySoldKg,
                  r.grade,
                  r.pricePerKg,
                  r.totalAmount,
                  r.paymentStatus,
                ])
              : expenses.map((e) => [
                  e.date,
                  e.category,
                  e.amount,
                  e.description,
                  e.linkedTreatmentId || 'None',
                ])
          }
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
  subTabBar: {
    flexDirection: 'row',
    backgroundColor: '#e5e7eb',
    borderRadius: 10,
    padding: 3,
    marginBottom: 16,
  },
  subTabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  subTabBtnActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  subTabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6b7280',
  },
  subTabTextActive: {
    color: '#111827',
    fontWeight: '800',
  },
  summaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
  },
  summaryValueRed: {
    fontSize: 18,
    fontWeight: '800',
    color: '#dc2626',
  },
  summaryValueGreen: {
    fontSize: 18,
    fontWeight: '800',
    color: '#15803d',
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
  expDescription: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
  },
  linkedTag: {
    marginTop: 6,
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  linkedTagText: {
    fontSize: 11,
    color: '#2563eb',
    fontWeight: '600',
  },
  revDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  revStat: {
    fontSize: 13,
    color: '#4b5563',
  },
  bold: {
    fontWeight: '700',
    color: '#111827',
  },
  insuranceReminderBox: {
    backgroundColor: '#fef3c7',
    borderWidth: 1.5,
    borderColor: '#fde68a',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  reminderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  reminderBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#92400e',
    backgroundColor: '#fde68a',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  reminderDate: {
    fontSize: 11,
    fontWeight: '700',
    color: '#b45309',
  },
  reminderTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#92400e',
    marginBottom: 4,
  },
  reminderBody: {
    fontSize: 12,
    color: '#78350f',
    lineHeight: 17,
  },
  insuranceGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  insCol: {
    flex: 1,
  },
  insLabel: {
    fontSize: 10,
    color: '#6b7280',
    fontWeight: '600',
  },
  insVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
    marginTop: 2,
  },
  policyNotes: {
    fontSize: 12,
    color: '#4b5563',
    lineHeight: 16,
    marginBottom: 12,
  },
  claimBtn: {
    backgroundColor: '#15803d',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  claimBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  budgetRow: {
    marginBottom: 14,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  budgetCat: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1f2937',
  },
  budgetStats: {
    fontSize: 12,
    color: '#4b5563',
  },
  budgetBarBg: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  budgetBarFill: {
    height: '100%',
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
    marginBottom: 12,
  },
  modalSub: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 14,
  },
  formGroup: {
    marginBottom: 12,
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
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  modalCancelText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4b5563',
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
