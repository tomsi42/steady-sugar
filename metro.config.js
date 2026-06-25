const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Required for expo-sqlite web support (wa-sqlite WebAssembly binary)
config.resolver.assetExts.push('wasm');

module.exports = config;
