import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Place } from '../types';

type Props = {
  place: Place;
  onBack: () => void;
};

export default function DetailScreen({ place, onBack }: Props) {
  return (
    <View style={styles.container}>
      <Pressable onPress={onBack}>
        <Text style={styles.back}>← 목록으로</Text>
      </Pressable>
      <Text testID="place-title" style={styles.title}>
        {place.name}
      </Text>
      <Text style={styles.meta}>
        {place.neighborhood} · {place.category} · {place.menu}
      </Text>
      <Text style={styles.body}>{place.description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  back: { color: '#e8590c', fontSize: 16, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '700' },
  meta: { marginTop: 8, color: '#555' },
  body: { marginTop: 16, fontSize: 16, lineHeight: 24 },
});
