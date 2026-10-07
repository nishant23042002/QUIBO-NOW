import tailwindcss from '@tailwindcss/vite';
import type { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.tsx'],
  addons: ['@storybook/addon-a11y', '@storybook/addon-vitest'],
  framework: '@storybook/react-vite',
  // Dev tooling should not phone home from this project (CLAUDE.md: collect minimal data).
  core: { disableTelemetry: true },
  viteFinal: (viteConfig) =>
    mergeConfig(viteConfig, {
      plugins: [tailwindcss()],
      build: {
        // Storybook's preview bundles its own runtime, React and axe (about 1.1 MB). This build is
        // a developer tool and is never served to users; the app's own bundle size is measured
        // separately (PHASE-0-report.md).
        chunkSizeWarningLimit: 1500,
        rolldownOptions: {
          onLog(
            level: string,
            log: { code?: string },
            defaultHandler: (l: string, g: unknown) => void,
          ) {
            // "use client" matters to Next.js server components and means nothing in Storybook,
            // which bundles everything for the browser.
            if (log.code === 'MODULE_LEVEL_DIRECTIVE') return;
            defaultHandler(level, log);
          },
        },
      },
    }),
};

export default config;
