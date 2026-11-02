// 광고 단위 ID 를 고르는 규칙. 네이티브 모듈을 불러오지 않는 순수 함수라 테스트할 수 있다.

// 구글 공식 샘플 배너 광고 단위 (내 계정과 무관한 시험용, 돈이 오가지 않는다)
// https://developers.google.com/admob/android/test-ads
// https://developers.google.com/admob/ios/test-ads
export const TEST_BANNER_UNIT_ID = {
  android: 'ca-app-pub-3940256099942544/6300978111',
  ios: 'ca-app-pub-3940256099942544/2934735716',
} as const;

export type AdPlatform = 'android' | 'ios';

export type AdEnv = {
  bannerAndroid?: string;
  bannerIos?: string;
  testMode?: string;
};

const UNIT_ID_PATTERN = /^ca-app-pub-\d{16}\/\d{10}$/;
const GOOGLE_SAMPLE_PUBLISHER = 'ca-app-pub-3940256099942544/';

/**
 * 이번 실행에서 쓸 배너 광고 단위 ID 를 돌려준다. 광고를 띄우면 안 되는 상황이면 null.
 * - 개발 모드(isDev): 어떤 환경변수가 있어도 테스트 광고 단위만 쓴다.
 * - 테스트 모드(env.testMode === 'true'): 배포용 빌드여도 테스트 광고 단위만 쓴다.
 * - 그 밖(스토어 배포 빌드): 환경변수의 실제 단위만 쓰고, 없거나 모양이 틀리거나 샘플 단위면 광고를 띄우지 않는다.
 */
export function resolveBannerUnitId(params: {
  isDev: boolean;
  platform: AdPlatform;
  env: AdEnv;
}): string | null {
  const { isDev, platform, env } = params;
  if (isDev || env.testMode === 'true') {
    return TEST_BANNER_UNIT_ID[platform];
  }
  const real = platform === 'android' ? env.bannerAndroid : env.bannerIos;
  if (!real || !UNIT_ID_PATTERN.test(real) || real.startsWith(GOOGLE_SAMPLE_PUBLISHER)) {
    return null;
  }
  return real;
}
