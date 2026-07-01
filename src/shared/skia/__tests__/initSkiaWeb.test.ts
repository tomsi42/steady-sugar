import { initSkiaWeb } from '../initSkiaWeb';

describe('initSkiaWeb (native)', () => {
  it('resolves without doing anything', async () => {
    await expect(initSkiaWeb()).resolves.toBeUndefined();
  });
});
