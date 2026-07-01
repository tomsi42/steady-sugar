import { LoadSkiaWeb } from '@shopify/react-native-skia/lib/module/web';

export async function initSkiaWeb(): Promise<void> {
  await LoadSkiaWeb();
}
