// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add the shared folder to watchFolders so Metro can resolve imports outside the project root
config.watchFolders = [path.resolve(__dirname, '../shared')];

module.exports = config;
