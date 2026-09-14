import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { WeatherAlert } from '../models/types';
import { useStore } from '../store/useStore';

interface AlertBannerProps {
  alert: WeatherAlert;
  onAction?: () => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ alert, onAction }) => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const { dismissAlert } = useStore();

  const getTierColors = (tier: 1 | 2 | 3) => {
    switch (tier) {
      case 3:
        return {
          bg: '#fffbfb',
          border: '#fecaca',
          accent: '#dc2626',
          badgeBg: '#fee2e2',
          badgeBorder: '#fca5a5',
          badgeText: '#b91c1c',
          titleColor: '#991b1b',
          tierLabel: 'TIER 3 • NOWCAST (0-24h)',
          icon: '🚨',
          actionBtnBg: '#dc2626',
        };
      case 2:
        return {
          bg: '#fffdfa',
          border: '#fed7aa',
          accent: '#d97706',
          badgeBg: '#fef3c7',
          badgeBorder: '#fcd34d',
          badgeText: '#b45309',
          titleColor: '#92400e',
          tierLabel: 'TIER 2 • FORECAST (3-10d)',
          icon: '🌧️',
          actionBtnBg: '#d97706',
        };
      case 1:
      default:
        return {
          bg: '#f8fafc',
          border: '#bae6fd',
          accent: '#0284c7',
          badgeBg: '#e0f2fe',
          badgeBorder: '#7dd3fc',
          badgeText: '#0369a1',
          titleColor: '#075985',
          tierLabel: 'TIER 1 • SEASONAL (4-5w)',
          icon: '📅',
          actionBtnBg: '#0284c7',
        };
    }
  };

  const styleConfig = getTierColors(alert.tier);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: styleConfig.bg,
          borderColor: styleConfig.border,
          borderLeftColor: styleConfig.accent,
        },
      ]}>
      {/* Top Header: Tier Badge (Left) and Dismiss Button (Right) */}
      <View style={styles.topHeaderRow}>
        <View
          style={[
            styles.tierBadge,
            {
              backgroundColor: styleConfig.badgeBg,
              borderColor: styleConfig.badgeBorder,
            },
          ]}>
          <Text style={styles.tierIcon}>{styleConfig.icon}</Text>
          <Text style={[styles.tierText, { color: styleConfig.badgeText }]}>
            {styleConfig.tierLabel}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => dismissAlert(alert.id)}
          style={styles.dismissBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityLabel="Dismiss alert">
          <Text style={styles.dismissText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Metadata Sub-strip: Confidence + Timestamp */}
      {(alert.confidence || alert.date) && (
        <View style={styles.metaStrip}>
          {alert.confidence ? (
            <View style={styles.metaPill}>
              <Text style={styles.metaDot}>🎯</Text>
              <Text style={styles.metaConfidenceText} numberOfLines={1}>
                {alert.confidence}
              </Text>
            </View>
          ) : null}
          {alert.date ? (
            <View style={styles.metaPill}>
              <Text style={styles.metaDot}>⏱️</Text>
              <Text style={styles.metaDateText} numberOfLines={1}>
                {alert.date}
              </Text>
            </View>
          ) : null}
        </View>
      )}

      {/* Title & Message */}
      <Text style={[styles.title, { color: styleConfig.titleColor }]}>{alert.title}</Text>
      <Text style={styles.message}>{alert.message}</Text>

      {/* Responsive Footer: Source info and Action Button */}
      <View style={[styles.footerRow, !isDesktop && styles.footerRowMobile]}>
        <View style={styles.sourceContainer}>
          <Text style={styles.sourcePrefix}>Source:</Text>
          <Text style={styles.sourceText} numberOfLines={isDesktop ? 1 : 2}>
            {alert.source}
          </Text>
        </View>

        {alert.actionLabel && (
          <TouchableOpacity
            style={[
              styles.actionBtn,
              { backgroundColor: styleConfig.actionBtnBg },
              !isDesktop && styles.actionBtnMobile,
            ]}
            activeOpacity={0.8}
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
    borderRadius: 14,
    borderWidth: 1,
    borderLeftWidth: 4.5,
    padding: 14,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  topHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  tierIcon: {
    fontSize: 11,
    marginRight: 4,
  },
  tierText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  dismissBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '800',
    lineHeight: 14,
  },
  metaStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaDot: {
    fontSize: 10,
  },
  metaConfidenceText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  metaDateText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '500',
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20,
    marginBottom: 4,
  },
  message: {
    fontSize: 13,
    lineHeight: 19,
    color: '#334155',
    marginBottom: 12,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.06)',
    gap: 8,
  },
  footerRowMobile: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 10,
  },
  sourceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    gap: 4,
  },
  sourcePrefix: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
  },
  sourceText: {
    fontSize: 11,
    color: '#475569',
    flexShrink: 1,
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  actionBtnMobile: {
    width: '100%',
    paddingVertical: 10,
    minHeight: 40,
    borderRadius: 8,
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});
