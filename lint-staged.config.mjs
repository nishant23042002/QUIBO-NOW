export default {
  '*.{ts,tsx,js,jsx,mjs,cjs}': ['eslint --max-warnings 0 --fix', 'prettier --write'],
  '*.{json,md,mdx,css,yml,yaml}': 'prettier --write',
};
