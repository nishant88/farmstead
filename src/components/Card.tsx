import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp, useWindowDimensions } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  title?: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  headerRight?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  title,
  subtitle,
  badge,
  badgeColor = '#e8f5e9',
  headerRight,
}) => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  return (
    <View style={[styles.card, !isDesktop && styles.cardMobile, style]}>
      {(title || badge || headerRight) && (
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <View style={styles.titleRow}>
              {title && (
                <Text style={[styles.title, !isDesktop && styles.titleMobile]}>
                  {title}
                </Text>
              )}
              {badge && (
                <View style={[styles.badge, { backgroundColor: badgeColor }]}>
                  <Text style={styles.badgeText}>{badge}</Text>
                </View>
              )}
            </View>
            {subtitle && (
              <Text style={[styles.subtitle, !isDesktop && styles.subtitleMobile]}>
                {subtitle}
              </Text>
            )}
          </View>
          {headerRight && <View style={styles.headerRightBox}>{headerRight}</View>}
        </View>
      )}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1.2,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardMobile: {
    padding: 13,
    marginBottom: 12,
    borderRadius: 13,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  titleContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.2,
  },
  titleMobile: {
    fontSize: 15,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  subtitleMobile: {
    fontSize: 11,
    marginTop: 1,
  },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803d',
  },
  headerRightBox: {
    marginLeft: 6,
  },
});
