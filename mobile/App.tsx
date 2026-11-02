import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';

import DetailScreen from './src/screens/DetailScreen';
import HomeScreen from './src/screens/HomeScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import type { Place } from './src/types';

// 화면은 셋뿐이라 내비게이션 라이브러리 없이 상태로 바꾼다.
export default function App() {
  const [selected, setSelected] = useState<Place | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      {showSettings ? (
        <SettingsScreen onBack={() => setShowSettings(false)} />
      ) : selected ? (
        <DetailScreen place={selected} onBack={() => setSelected(null)} />
      ) : (
        <HomeScreen onSelect={setSelected} onOpenSettings={() => setShowSettings(true)} />
      )}
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
