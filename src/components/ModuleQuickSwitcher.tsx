import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useStore } from '../store/useStore';

interface ModuleQuickSwitcherProps {
  currentTab: 'index' | 'log' | 'weather' | 'stock' | 'finance' | 'market' | 'documents' | 'listing';
}

export const ModuleQuickSwitcher: React.FC<ModuleQuickSwitcherProps> = ({ currentTab }) => {
  const router = useRouter();
  const { language, weatherAlerts } = useStore();

  const activeAlertCount = weatherAlerts.filter((a) => !a.isDismissed).length;

  const tabs = [
    {
      id: 'index',
      label: language === 'hi' ? '📊 ओवरव्यू' : '📊 Dashboard',
      route: '/(tabs)/',
    },
    {
      id: 'log',
      label: language === 'hi' ? '🌿 स्प्रे लॉग' : '🌿 Sprays',
      route: '/(tabs)/log',
    },
    {
      id: 'weather',
      label: language === 'hi' ? '⛈️ मौसम जोखिम' : '⛈️ Weather & Hail',
      route: '/(tabs)/weather',
      badge: activeAlertCount > 0 ? `${activeAlertCount}` : undefined,
    },
    {
      id: 'market',
      label: language === 'hi' ? '📈 मंडी भाव' : '📈 Mandi Rates',
      route: '/(tabs)/market',
    },
    {
      id: 'stock',
      label: language === 'hi' ? '📦 स्टॉक' : '📦 Stock',
      route: '/(tabs)/stock',
    },
    {
      id: 'finance',
      label: language === 'hi' ? '💰 वित्त / PMFBY' : '💰 Finance & PMFBY',
      route: '/(tabs)/finance',
    },
    {
      id: 'documents',
      label: language === 'hi' ? '📄 बिल / OCR' : '📄 Bills & OCR',
      route: '/(tabs)/documents',
    },
    {
      id: 'listing',
      label: language === 'hi' ? '🍎 बिक्री लॉट' : '🍎 Harvest Sales',
      route: '/(tabs)/listing',
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {tabs.map((t) => {
          const isActive = currentTab === t.id;
          return (
            <TouchableOpacity
              key={t.id}
              style={[styles.chip, isActive && styles.chipActive]}
              activeOpacity={0.7}
              onPress={() => {
                if (!isActive) {
                  router.push(t.route as any);
                }
              }}>
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                {t.label}
              </Text>
              {t.badge && (
                <View style={[styles.chipBadge, isActive && styles.chipBadgeActive]}>
                  <Text style={[styles.chipBadgeText, isActive && styles.chipBadgeTextActive]}>
                    {t.badge}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingVertical: 8,
  },
  scrollContent: {
    paddingHorizontal: 14,
    gap: 8,
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    borderWidth: 1.2,
    borderColor: '#e2e8f0',
  },
  chipActive: {
    backgroundColor: '#15803d',
    borderColor: '#15803d',
    shadowColor: '#15803d',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  chipTextActive: {
    color: '#ffffff',
  },
  chipBadge: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 10,
  },
  chipBadgeActive: {
    backgroundColor: '#ffffff',
  },
  chipBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#b91c1c',
  },
  chipBadgeTextActive: {
    color: '#15803d',
  },
});
