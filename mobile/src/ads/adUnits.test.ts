import assert from 'node:assert/strict';
import { test } from 'node:test';

import { resolveBannerUnitId, TEST_BANNER_UNIT_ID } from './adUnits';

const REAL_ANDROID = 'ca-app-pub-1111111111111111/2222222222';
const REAL_IOS = 'ca-app-pub-1111111111111111/3333333333';
const env = { bannerAndroid: REAL_ANDROID, bannerIos: REAL_IOS };

test('개발 모드에서는 실제 단위가 환경변수에 있어도 테스트 단위만 쓴다', () => {
  assert.equal(resolveBannerUnitId({ isDev: true, platform: 'android', env }), TEST_BANNER_UNIT_ID.android);
  assert.equal(resolveBannerUnitId({ isDev: true, platform: 'ios', env }), TEST_BANNER_UNIT_ID.ios);
});

test('테스트 모드 배포 빌드(preview)도 테스트 단위만 쓴다', () => {
  const id = resolveBannerUnitId({ isDev: false, platform: 'android', env: { ...env, testMode: 'true' } });
  assert.equal(id, TEST_BANNER_UNIT_ID.android);
});

test('스토어 배포 빌드에서만 실제 단위를 쓴다', () => {
  assert.equal(resolveBannerUnitId({ isDev: false, platform: 'android', env }), REAL_ANDROID);
  assert.equal(resolveBannerUnitId({ isDev: false, platform: 'ios', env }), REAL_IOS);
});

test('배포 빌드에 단위가 없거나 모양이 틀리면 광고를 띄우지 않는다', () => {
  assert.equal(resolveBannerUnitId({ isDev: false, platform: 'android', env: {} }), null);
  assert.equal(
    resolveBannerUnitId({ isDev: false, platform: 'android', env: { bannerAndroid: 'ca-app-pub-0000000000000000/0000' } }),
    null,
  );
});

test('배포 빌드에 구글 샘플 단위가 섞여 들어오면 광고를 띄우지 않는다', () => {
  const sample = { bannerAndroid: TEST_BANNER_UNIT_ID.android };
  assert.equal(resolveBannerUnitId({ isDev: false, platform: 'android', env: sample }), null);
});
