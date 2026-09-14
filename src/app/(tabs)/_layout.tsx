import { Tabs } from 'expo-router';
import { ResponsiveTabBar } from '../../components/ResponsiveTabBar';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <ResponsiveTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}>
      <Tabs.Screen name="index" options={{ title: 'Dashboard' }} />
      <Tabs.Screen name="log" options={{ title: 'Sprays' }} />
      <Tabs.Screen name="weather" options={{ title: 'Hail/Risk' }} />
      <Tabs.Screen name="stock" options={{ title: 'Stock' }} />
      <Tabs.Screen name="finance" options={{ title: 'Finance' }} />
      <Tabs.Screen name="market" options={{ title: 'Mandi' }} />
      <Tabs.Screen name="documents" options={{ title: 'Bills' }} />
      <Tabs.Screen name="listing" options={{ title: 'Sales' }} />
    </Tabs>
  );
}
