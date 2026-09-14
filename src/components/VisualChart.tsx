import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MandiHistoryPoint } from '../models/types';

interface MandiTrendChartProps {
  history: MandiHistoryPoint[];
  title?: string;
}

export const MandiTrendChart: React.FC<MandiTrendChartProps> = ({ history, title }) => {
  if (!history || history.length === 0) return null;

  const maxVal = Math.max(...history.map((h) => h.modalPrice));
  const minVal = Math.min(...history.map((h) => h.modalPrice));
  const range = maxVal - minVal || 1;

  return (
    <View style={styles.chartCard}>
      {title && <Text style={styles.chartTitle}>{title}</Text>}
      <View style={styles.chartGrid}>
        {history.map((point, index) => {
          const heightPercent = Math.max(
            20,
            Math.min(100, Math.round(((point.modalPrice - minVal * 0.9) / (maxVal - minVal * 0.9)) * 100))
          );
          return (
            <View key={index} style={styles.barCol}>
              <Text style={styles.barValue}>₹{(point.modalPrice / 100).toFixed(0)}</Text>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    { height: `${heightPercent}%`, backgroundColor: '#2e7d32' },
                  ]}
                />
              </View>
              <Text style={styles.barDay}>{point.day}</Text>
            </View>
          );
        })}
      </View>
      <View style={styles.chartFooter}>
        <Text style={styles.footerNote}>
          5-Day Trend: Fluctuating between ₹{(minVal / 100).toFixed(0)}/kg and ₹{(maxVal / 100).toFixed(0)}/kg modal
        </Text>
      </View>
    </View>
  );
};

interface SpendRevenueBarProps {
  spend: number;
  revenue: number;
  budget: number;
}

export const SpendRevenueBar: React.FC<SpendRevenueBarProps> = ({ spend, revenue, budget }) => {
  const maxAxis = Math.max(revenue, budget, spend) || 1;
  const spendPct = Math.min(100, Math.round((spend / maxAxis) * 100));
  const revPct = Math.min(100, Math.round((revenue / maxAxis) * 100));
  const budgetPct = Math.min(100, Math.round((budget / maxAxis) * 100));

  return (
    <View style={styles.compContainer}>
      {/* Revenue Bar */}
      <View style={styles.compRow}>
        <View style={styles.labelCol}>
          <Text style={styles.compLabel}>Revenue Realized</Text>
          <Text style={[styles.compValue, { color: '#15803d' }]}>
            ₹{revenue.toLocaleString('en-IN')}
          </Text>
        </View>
        <View style={styles.compTrack}>
          <View style={[styles.compFill, { width: `${revPct}%`, backgroundColor: '#15803d' }]} />
        </View>
      </View>

      {/* Spend Bar */}
      <View style={styles.compRow}>
        <View style={styles.labelCol}>
          <Text style={styles.compLabel}>Actual Spend</Text>
          <Text style={[styles.compValue, { color: '#b91c1c' }]}>
            ₹{spend.toLocaleString('en-IN')}
          </Text>
        </View>
        <View style={styles.compTrack}>
          <View style={[styles.compFill, { width: `${spendPct}%`, backgroundColor: '#b91c1c' }]} />
        </View>
      </View>

      {/* Season Budget Bar */}
      <View style={styles.compRow}>
        <View style={styles.labelCol}>
          <Text style={styles.compLabel}>Planned Season Cap</Text>
          <Text style={styles.compValue}>₹{budget.toLocaleString('en-IN')}</Text>
        </View>
        <View style={styles.compTrack}>
          <View style={[styles.compFill, { width: `${budgetPct}%`, backgroundColor: '#64748b' }]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  chartCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    padding: 12,
    marginVertical: 8,
  },
  chartTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },
  chartGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 110,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 4,
  },
  barCol: {
    alignItems: 'center',
    flex: 1,
  },
  barValue: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803d',
    marginBottom: 4,
  },
  barTrack: {
    width: 14,
    height: 70,
    backgroundColor: '#e2e8f0',
    borderRadius: 7,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 7,
  },
  barDay: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 4,
    fontWeight: '600',
  },
  chartFooter: {
    marginTop: 6,
  },
  footerNote: {
    fontSize: 10,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  compContainer: {
    gap: 10,
    paddingVertical: 4,
  },
  compRow: {
    gap: 4,
  },
  labelCol: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  compLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4b5563',
  },
  compValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1e293b',
  },
  compTrack: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  compFill: {
    height: '100%',
    borderRadius: 4,
  },
});
