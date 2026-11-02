// 22장 비교용 예시입니다. 동작을 확인하지 않았고 실행하지 않아도 됩니다.
// 같은 흐름(.maestro/search.yaml)을 Appium(WebdriverIO 클라이언트)으로 쓰면 이렇게 길어진다는 감각만 보세요.
// 확인이 끝나면 지워도 됩니다.
const { remote } = require('webdriverio');

const capabilities = {
  platformName: 'Android',
  'appium:automationName': 'UiAutomator2',
  'appium:deviceName': 'Android Emulator',
  'appium:appPackage': 'com.example.todaymenu',
  'appium:appActivity': '.MainActivity',
  'appium:noReset': false,
};

const wdOpts = {
  hostname: '127.0.0.1',
  port: 4723,
  path: '/',
  logLevel: 'info',
  capabilities,
};

async function byTestId(driver, id) {
  // React Native의 testID는 안드로이드에서 resource-id로 잡힌다.
  const el = await driver.$(`android=new UiSelector().resourceId("${id}")`);
  await el.waitForDisplayed({ timeout: 10000 });
  return el;
}

async function run() {
  const driver = await remote(wdOpts);
  try {
    const input = await byTestId(driver, 'neighborhood-input');
    await input.click();
    await input.setValue('망원동');
    await driver.hideKeyboard();

    const search = await byTestId(driver, 'search-button');
    await search.click();

    const card = await byTestId(driver, 'place-card');
    await card.click();

    const title = await byTestId(driver, 'place-title');
    if (!(await title.isDisplayed())) {
      throw new Error('상세 제목이 보이지 않습니다');
    }
    console.log('통과');
  } finally {
    await driver.deleteSession();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
