const mockLoadSkiaWeb = jest.fn(() => Promise.resolve());

jest.mock('@shopify/react-native-skia/lib/module/web', () => ({
  LoadSkiaWeb: () => mockLoadSkiaWeb(),
}));

import { initSkiaWeb } from '../initSkiaWeb.web';

describe('initSkiaWeb (web)', () => {
  it('loads the CanvasKit WASM binary via LoadSkiaWeb', async () => {
    await initSkiaWeb();
    expect(mockLoadSkiaWeb).toHaveBeenCalledTimes(1);
  });
});
