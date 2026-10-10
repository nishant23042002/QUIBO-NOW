// Writes the sheet a native Hindi or Marathi speaker reviews: every line of the screens built in Phase 1 section 1f and 1g, in
// English next to the Hindi and Marathi drafts, with a column to mark it OK or give the better wording.
//
//   node scripts/language-review.mjs
//
// It reads the message files, so the sheet can never drift from what the app says. {placeholders} must stay as they are.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const read = (locale) =>
  JSON.parse(readFileSync(`${root}packages/i18n/messages/${locale}.json`, 'utf8'));

/** The parts of the message files this sheet covers, in the order a shopper meets them: [heading, path in the files]. */
const SECTIONS = [
  ['Checkout', 'checkout'],
  ['Order placed', 'placed'],
  ['Orders', 'orders'],
  ['Tracking an order', 'tracking'],
  ['Help', 'help'],
];

const en = read('en');
const hi = read('hi');
const mr = read('mr');

/** Every string under a path, as [key, text], keys joined with dots. */
function flatten(value, prefix = '') {
  if (typeof value === 'string') return [[prefix, value]];
  if (value === null || typeof value !== 'object') return [];
  return Object.entries(value).flatMap(([key, child]) =>
    flatten(child, prefix === '' ? key : `${prefix}.${key}`),
  );
}

const at = (messages, key) => key.split('.').reduce((node, part) => node?.[part], messages);
const cell = (text) =>
  String(text ?? '')
    .replace(/\|/g, '\\|')
    .replace(/\n/g, ' ');
// Word joiners and no-break spaces are invisible: show them so a reviewer knows they are meant to be there.
const WORD_JOINER = String.fromCharCode(0x2060);
const NO_BREAK_SPACE = String.fromCharCode(0xa0);
const visible = (text) => cell(text).replaceAll(WORD_JOINER, '').replaceAll(NO_BREAK_SPACE, ' ');

let out = `# Hindi and Marathi review sheet

Written for a native speaker. Every line below is what the app says today, in English with the Hindi and Marathi **drafts**
beside it. Please mark each line **OK**, or write the wording you would use. Keep \`{placeholders}\` exactly as they are: the app
puts a number, a name or an amount there.

Things worth checking as you read:

- Does it sound like a shop in your own town, not like a bank or a government form?
- Is it short enough to fit on a small phone? Hindi and Marathi often run longer than English.
- Money and delivery lines must never sound like a promise: "about", "usually", "an estimate".
- Nothing should blame the rider or the customer.

Made by \`node scripts/language-review.mjs\`. Run it again after the wording changes.
`;

let total = 0;
for (const [heading, path] of SECTIONS) {
  const node = at(en, path);
  if (node === undefined) continue;
  const rows = flatten(node, path);
  total += rows.length;
  out += `\n## ${heading}\n\n| Key | English | Hindi (draft) | Marathi (draft) | OK or change to |\n| --- | --- | --- | --- | --- |\n`;
  for (const [key, text] of rows) {
    out += `| \`${key}\` | ${visible(text)} | ${visible(at(hi, key))} | ${visible(at(mr, key))} | |\n`;
  }
}
out += `\n${total} lines in all.\n`;

writeFileSync(`${root}docs/phases/PHASE-1-language-review.md`, out);
process.stdout.write(`wrote docs/phases/PHASE-1-language-review.md (${total} lines)\n`);
