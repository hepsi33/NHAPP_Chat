const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add transformation for agora native components if needed, or simply handle extensions
config.resolver.sourceExts.push('tsx', 'ts', 'js', 'jsx');

module.exports = config;
