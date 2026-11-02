import { useEffect, useState } from 'react';
import mobileAds, { AdsConsent } from 'react-native-google-mobile-ads';

let startPromise: Promise<boolean> | null = null;

// 동의 정보를 갱신하고(UMP), 필요하면 동의 양식을 보여 준 뒤, 광고 요청이 가능할 때만 SDK 를 시작한다.
// 어떤 지역에서 동의가 필수인지는 AdMob 계정의 개인정보 메시지 설정을 따른다.
export function startAds(): Promise<boolean> {
  if (!startPromise) {
    startPromise = (async () => {
      try {
        await AdsConsent.gatherConsent();
      } catch {
        // 실패해도 이전 실행에서 받은 동의 상태로 계속 진행한다.
      }
      const { canRequestAds } = await AdsConsent.getConsentInfo();
      if (!canRequestAds) return false;
      await mobileAds().initialize();
      return true;
    })().catch(() => false);
  }
  return startPromise;
}

export function useAdsReady(): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let alive = true;
    startAds().then((ok) => {
      if (alive) setReady(ok);
    });
    return () => {
      alive = false;
    };
  }, []);
  return ready;
}
