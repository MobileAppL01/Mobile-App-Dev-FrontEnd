const { getSentryExpoConfig } = require("@sentry/react-native/metro");

// Polyfill for Node < 20 (fixes "configs.toReversed is not a function")
if (!Array.prototype.toReversed) {
  Array.prototype.toReversed = function() {
    return this.slice().reverse();
  };
}

const config = getSentryExpoConfig(__dirname);

const { transformer, resolver } = config;

config.transformer = {
    ...transformer,
    babelTransformerPath: require.resolve("react-native-svg-transformer"),
};
config.resolver = {
    ...resolver,
    assetExts: resolver.assetExts.filter((ext) => ext !== "svg"),
    sourceExts: [...resolver.sourceExts, "svg"],
};

module.exports = config;
