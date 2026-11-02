import type { ConfigContext, ExpoConfig } from 'expo/config';

// app.json 을 바탕으로 하되, 실제 AdMob 앱 ID 는 환경변수(.env)에서 읽어 덮어쓴다.
// 환경변수가 없으면 app.json 에 적힌 구글 공식 샘플 앱 ID(테스트용)가 그대로 쓰인다.
export default ({ config }: ConfigContext): ExpoConfig => {
  const plugins = (config.plugins ?? []).map((plugin) => {
    if (Array.isArray(plugin) && plugin[0] === 'react-native-google-mobile-ads') {
      const options = (plugin[1] ?? {}) as Record<string, string>;
      return [
        plugin[0],
        {
          ...options,
          androidAppId: process.env.ADMOB_ANDROID_APP_ID || options.androidAppId,
          iosAppId: process.env.ADMOB_IOS_APP_ID || options.iosAppId,
        },
      ];
    }
    return plugin;
  });
  return { ...config, plugins } as ExpoConfig;
};
