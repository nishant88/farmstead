import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useStore } from '../store/useStore';

export default function RootLayout() {
  const seedData = useStore((state) => state.seedData);
  const refreshMandiPrices = useStore((state) => state.refreshMandiPrices);
  const mandiAutoSyncEnabled = useStore((state) => state.mandiAutoSyncEnabled);
  const mandiSyncIntervalMinutes = useStore((state) => state.mandiSyncIntervalMinutes);

  useEffect(() => {
    seedData();
  }, [seedData]);

  // 15-Minute Background Cron Job for Mandi & Market Intelligence
  useEffect(() => {
    if (!mandiAutoSyncEnabled) return;

    const intervalMs = (mandiSyncIntervalMinutes || 15) * 60 * 1000;
    const timer = setInterval(() => {
      refreshMandiPrices();
    }, intervalMs);

    return () => clearInterval(timer);
  }, [mandiAutoSyncEnabled, mandiSyncIntervalMinutes, refreshMandiPrices]);

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
