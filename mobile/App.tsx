import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';

import DetailScreen from './src/screens/DetailScreen';
import HomeScreen from './src/screens/HomeScreen';
import type { Place } from './src/types';

// 화면은 둘뿐이라 내비게이션 라이브러리 없이 상태 하나로 바꾼다.
export default function App() {
  const [selected, setSelected] = useState<Place | null>(null);

  return (
    <SafeAreaView style={styles.container}>
      {selected ? (
        <DetailScreen place={selected} onBack={() => setSelected(null)} />
      ) : (
        <HomeScreen onSelect={setSelected} />
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
