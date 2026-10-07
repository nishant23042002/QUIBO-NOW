import type { Preview } from '@storybook/react-vite';
import './preview.css';

const preview: Preview = {
  parameters: {
    layout: 'padded',
    // A violation fails the story, in the Storybook UI and in `pnpm a11y` (and so in CI).
    a11y: { test: 'error' },
  },
};

export default preview;
