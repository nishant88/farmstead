import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { WeatherAlert } from '../models/types';
import { useStore } from '../store/useStore';

interface AlertBannerProps {
  alert: WeatherAlert;
  onAction?: () => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ alert, onAction }) => {
  const { dismissAlert } = useStore();

  const getTierColors = (tier: 1 | 2 | 3) => {
    switch (tier) {
      case 3:
        return {
          bg: '#fef2f2',
          border: '#fecaca',
          badgeBg: '#fee2e2',
          badgeText: '#dc2626',
          titleColor: '#991b1b',
          tierLabel: 'TIER 3 • NOWCAST (0-24h)',
          icon: '⚡',
        };
      case 2:
        return {
          bg: '#fffbeb',
          border: '#fde68a',
          badgeBg: '#fef3c7',
          badgeText: '#d97706',
          titleColor: '#92400e',
          tierLabel: 'TIER 2 • SHORT-RANGE (3-10d)',
          icon: '🌧️',
        };
      case 1:
      default:
        return {
          bg: '#f0f9ff',
          border: '#bae6fd',
          badgeBg: '#e0f2fe',
          badgeText: '#0284c7',
          titleColor: '#075985',
          tierLabel: 'TIER 1 • SEASONAL (4-5w)',
          icon: '📅',
        };
    }
  };

  const styleConfig = getTierColors(alert.tier);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: styleConfig.bg, borderColor: styleConfig.border },
      ]}>
      <View style={styles.topRow}>
        <View style={styles.badgeRow}>
          <View style={[styles.tierBadge, { backgroundColor: styleConfig.badgeBg }]}>
            <Text style={styles.icon}>{styleConfig.icon}</Text>
            <Text style={[styles.tierText, { color: styleConfig.badgeText }]}>
              {styleConfig.tierLabel}
            </Text>
          </View>
          <Text style={styles.confidenceText}>{alert.confidence}</Text>
        </View>
        <TouchableOpacity
          onPress={() => dismissAlert(alert.id)}
          style={styles.dismissBtn}
          accessibilityLabel="Dismiss alert">
          <Text style={styles.dismissText}>✕</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.title, { color: styleConfig.titleColor }]}>{alert.title}</Text>
      <Text style={styles.message}>{alert.message}</Text>

      <View style={styles.footerRow}>
        <Text style={styles.sourceText}>Source: {alert.source}</Text>
        {alert.actionLabel && (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: styleConfig.badgeText }]}
            onPress={onAction}>
            <Text style={styles.actionBtnText}>{alert.actionLabel} →</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 14,
    marginBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  icon: {
    fontSize: 11,
    marginRight: 4,
  },
  tierText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  confidenceText: {
    fontSize: 11,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  dismissBtn: {
    padding: 4,
  },
  dismissText: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
    color: '#374151',
    marginBottom: 10,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  sourceText: {
    fontSize: 11,
    color: '#6b7280',
    flex: 1,
    marginRight: 8,
  },
  actionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
});
