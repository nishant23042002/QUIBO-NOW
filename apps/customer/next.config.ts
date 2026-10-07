import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Internal packages are shipped as TypeScript source (docs/decisions/0004).
  transpilePackages: ['@quibo/config', '@quibo/i18n', '@quibo/ui'],
};

export default withNextIntl(nextConfig);
