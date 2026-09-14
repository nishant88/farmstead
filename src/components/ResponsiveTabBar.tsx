import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MoreModulesModal } from './MoreModulesModal';

export const ResponsiveTabBar = (props: any) => {
  const { state, descriptors, navigation } = props;
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isDesktop = width >= 768;

  const [showMoreModal, setShowMoreModal] = useState(false);

  const activeRouteName = state?.routes[state.index]?.name || 'index';

  // Desktop Layout: All 8 modules displayed with generous spacing
  if (isDesktop) {
    return (
      <View
        style={[
          styles.barDesktop,
          { paddingBottom: Math.max(insets.bottom, 10) },
        ]}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const icons: Record<string, string> = {
            index: '📊',
            log: '🌿',
            weather: '⛈️',
            stock: '📦',
            finance: '💰',
            market: '📈',
            documents: '📄',
            listing: '🍎',
          };

          return (
            <TouchableOpacity
              key={route.key}
              style={[styles.desktopTab, isFocused && styles.desktopTabActive]}
              onPress={onPress}>
              <Text style={styles.desktopTabIcon}>{icons[route.name] || '📌'}</Text>
              <Text
                style={[
                  styles.desktopTabLabel,
                  isFocused && styles.desktopTabLabelActive,
                ]}>
                {options.title || route.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  // Mobile Handheld Layout: 4 Core Modules + 1 "More" Module Sheet Trigger
  const isSecondaryActive = ['stock', 'finance', 'documents', 'listing'].includes(activeRouteName);

  const secondaryMeta: Record<string, { label: string; icon: string }> = {
    stock: { label: 'Stock', icon: '📦' },
    finance: { label: 'Finance', icon: '💰' },
    documents: { label: 'Bills', icon: '📄' },
    listing: { label: 'Sales', icon: '🍎' },
  };

  const mobilePrimaryTabs = [
    { name: 'index', label: 'Home', icon: '📊' },
    { name: 'log', label: 'Sprays', icon: '🌿' },
    { name: 'weather', label: 'Weather', icon: '⛈️' },
    { name: 'market', label: 'Mandi', icon: '📈' },
  ];

  return (
    <>
      <View
        style={[
          styles.barMobile,
          { paddingBottom: Math.max(insets.bottom, 10) },
        ]}>
        {mobilePrimaryTabs.map((tab) => {
          const isFocused = activeRouteName === tab.name;
          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.mobileTab}
              activeOpacity={0.7}
              onPress={() => {
                navigation.navigate(tab.name);
              }}>
              <View
                style={[
                  styles.mobileTabPill,
                  isFocused && styles.mobileTabPillActive,
                ]}>
                <Text
                  style={[
                    styles.mobileTabIcon,
                    isFocused && styles.mobileTabIconActive,
                  ]}>
                  {tab.icon}
                </Text>
              </View>
              <Text
                style={[
                  styles.mobileTabLabel,
                  isFocused && styles.mobileTabLabelActive,
                ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* 5th Tab: Active Secondary Indicator or "More" Sheet Trigger */}
        <TouchableOpacity
          style={styles.mobileTab}
          activeOpacity={0.7}
          onPress={() => setShowMoreModal(true)}>
          <View
            style={[
              styles.mobileTabPill,
              isSecondaryActive && styles.mobileTabPillActive,
            ]}>
            <Text
              style={[
                styles.mobileTabIcon,
                isSecondaryActive && styles.mobileTabIconActive,
              ]}>
              {isSecondaryActive
                ? secondaryMeta[activeRouteName]?.icon || '⋯'
                : '⋯'}
            </Text>
          </View>
          <Text
            style={[
              styles.mobileTabLabel,
              isSecondaryActive && styles.mobileTabLabelActive,
            ]}>
            {isSecondaryActive
              ? secondaryMeta[activeRouteName]?.label || 'More'
              : 'More'}
          </Text>
        </TouchableOpacity>
      </View>

      <MoreModulesModal
        visible={showMoreModal}
        onClose={() => setShowMoreModal(false)}
        activeRoute={activeRouteName}
      />
    </>
  );
};

const styles = StyleSheet.create({
  // Desktop
  barDesktop: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 8,
    paddingHorizontal: 16,
    justifyContent: 'space-around',
    height: 68,
  },
  desktopTab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  desktopTabActive: {
    backgroundColor: '#f0fdf4',
  },
  desktopTabIcon: {
    fontSize: 18,
    marginBottom: 3,
  },
  desktopTabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  desktopTabLabelActive: {
    color: '#15803d',
    fontWeight: '800',
  },

  // Mobile
  barMobile: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 6,
    height: Platform.select({ web: 66, default: 64 }),
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -2 },
    elevation: 8,
  },
  mobileTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    minHeight: 48,
  },
  mobileTabPill: {
    width: 42,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileTabPillActive: {
    backgroundColor: '#dcfce7',
  },
  mobileTabIcon: {
    fontSize: 18,
    opacity: 0.8,
  },
  mobileTabIconActive: {
    opacity: 1,
    transform: [{ scale: 1.1 }],
  },
  mobileTabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 2,
  },
  mobileTabLabelActive: {
    color: '#15803d',
    fontWeight: '800',
  },
});
