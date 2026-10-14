/* eslint-disable @typescript-eslint/no-require-imports -- a CommonJS file that Metro loads before anything is compiled. */
// Metro's configuration for the customer app: Expo's defaults, plus one thing. The repository keeps one `.env` at its root (see
// `.env.example`), and Expo only looks for `.env` next to the app, so the `EXPO_PUBLIC_` values in the root file would never reach
// the app. They are read here, before the bundler starts, and a value the app's own `.env` or the shell already sets wins.
const fs = require('node:fs');
const path = require('node:path');
const { getDefaultConfig } = require('expo/metro-config');

function loadRootEnv() {
  const file = path.resolve(__dirname, '../../.env');
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const match = /^\s*(EXPO_PUBLIC_[A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line);
    if (match === null) continue;
    const name = match[1];
    const value = match[2].replace(/^(['"])(.*)\1$/, '$2');
    // An empty value is unset, as everywhere else in the project.
    if (value !== '' && process.env[name] === undefined) process.env[name] = value;
  }
}

loadRootEnv();

module.exports = getDefaultConfig(__dirname);
