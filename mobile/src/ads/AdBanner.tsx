import { useRef } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { BannerAd, BannerAdSize, useForeground } from 'react-native-google-mobile-ads';

import { resolveBannerUnitId } from './adUnits';
import { useAdsReady } from './initAds';

// process.env.EXPO_PUBLIC_* 는 글자 그대로 적어야 빌드 때 값이 들어간다.
const unitId = resolveBannerUnitId({
  isDev: __DEV__,
  platform: Platform.OS === 'ios' ? 'ios' : 'android',
  env: {
    bannerAndroid: process.env.EXPO_PUBLIC_ADMOB_BANNER_ANDROID,
    bannerIos: process.env.EXPO_PUBLIC_ADMOB_BANNER_IOS,
    testMode: process.env.EXPO_PUBLIC_ADMOB_TEST_MODE,
  },
});

// 추천 카드가 밀려나지 않게 광고 자리의 높이를 미리 잡아 둔다 (배너 50 + 여백).
const SLOT_HEIGHT = 60;

export default function AdBanner() {
  const ready = useAdsReady();
  const bannerRef = useRef<BannerAd>(null);

  // iOS: 앱이 앞으로 돌아올 때 빈 배너가 될 수 있어 새로 불러온다.
  useForeground(() => {
    if (Platform.OS === 'ios') bannerRef.current?.load();
  });

  if (!unitId) return null;
  return (
    <View style={styles.slot}>
      {ready && <BannerAd ref={bannerRef} unitId={unitId} size={BannerAdSize.BANNER} />}
    </View>
  );
}

const styles = StyleSheet.create({
  slot: { height: SLOT_HEIGHT, alignItems: 'center', justifyContent: 'center' },
});
