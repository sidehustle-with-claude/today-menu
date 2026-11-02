import { useEffect, useState } from 'react';
import { Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { AdsConsent, AdsConsentPrivacyOptionsRequirementStatus } from 'react-native-google-mobile-ads';

import { PRIVACY_POLICY_URL, SUPPORT_URL } from '../links';

type Props = {
  onBack: () => void;
};

export default function SettingsScreen({ onBack }: Props) {
  const [canChangeAdPrivacy, setCanChangeAdPrivacy] = useState(false);

  useEffect(() => {
    AdsConsent.getConsentInfo()
      .then((info) =>
        setCanChangeAdPrivacy(
          info.privacyOptionsRequirementStatus === AdsConsentPrivacyOptionsRequirementStatus.REQUIRED,
        ),
      )
      .catch(() => setCanChangeAdPrivacy(false));
  }, []);

  const open = (url: string) => {
    Linking.openURL(url).catch(() => Alert.alert('주소를 열 수 없어요', url));
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={onBack}>
        <Text style={styles.back}>← 돌아가기</Text>
      </Pressable>
      <Text style={styles.title}>설정</Text>

      <Pressable style={styles.row} onPress={() => open(PRIVACY_POLICY_URL)}>
        <Text style={styles.rowText}>개인정보처리방침</Text>
      </Pressable>
      <Pressable style={styles.row} onPress={() => open(SUPPORT_URL)}>
        <Text style={styles.rowText}>문의하기</Text>
      </Pressable>
      {canChangeAdPrivacy && (
        <Pressable style={styles.row} onPress={() => AdsConsent.showPrivacyOptionsForm().catch(() => {})}>
          <Text style={styles.rowText}>광고 개인정보 설정</Text>
        </Pressable>
      )}

      <Text style={styles.note}>
        이 앱에는 로그인과 계정이 없어서 삭제할 계정 정보가 없습니다. 입력한 동네 이름은 기기에 저장되지 않고 앱을
        닫으면 사라집니다.
      </Text>
      <Text style={styles.note}>
        광고는 구글 AdMob이 제공합니다. 광고 식별자 사용 여부는 동의 화면과 기기 설정에서 바꿀 수 있어요.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  back: { color: '#e8590c', fontSize: 16, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 16 },
  row: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#eee' },
  rowText: { fontSize: 16 },
  note: { marginTop: 16, color: '#555', lineHeight: 22 },
});
