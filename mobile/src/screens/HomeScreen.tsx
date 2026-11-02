import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { searchPlaces } from '../search';
import AdBanner from '../ads/AdBanner';
import type { Place } from '../types';

type Props = {
  onSelect: (place: Place) => void;
};

// testID는 e2e 테스트(.maestro/search.yaml)에 필요한 요소에만 단다.
export default function HomeScreen({ onSelect }: Props) {
  const [neighborhood, setNeighborhood] = useState('');
  const [results, setResults] = useState<Place[] | null>(null);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>오늘 뭐 먹지</Text>
      <TextInput
        testID="neighborhood-input"
        style={styles.input}
        placeholder="동네 이름 (예: 망원동)"
        value={neighborhood}
        onChangeText={setNeighborhood}
        returnKeyType="search"
        onSubmitEditing={() => setResults(searchPlaces(neighborhood))}
      />
      <Pressable
        testID="search-button"
        style={styles.button}
        onPress={() => setResults(searchPlaces(neighborhood))}
      >
        <Text style={styles.buttonText}>추천 받기</Text>
      </Pressable>

      {results !== null && results.length === 0 && (
        <Text style={styles.empty}>이 동네의 예시 데이터가 아직 없어요.</Text>
      )}
      {results !== null && results.length > 0 && (
        <FlatList
          data={results}
          keyExtractor={(p) => p.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable testID="place-card" style={styles.card} onPress={() => onSelect(item)}>
              <Text style={styles.cardMenu}>{item.menu}</Text>
              <Text style={styles.cardName}>
                {item.name} · {item.category}
              </Text>
            </Pressable>
          )}
        />
      )}
      <AdBanner />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  heading: { fontSize: 24, fontWeight: '700', marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#e8590c',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  empty: { marginTop: 24, color: '#666' },
  list: { paddingTop: 16 },
  card: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  cardMenu: { fontSize: 18, fontWeight: '600' },
  cardName: { marginTop: 4, color: '#555' },
});
